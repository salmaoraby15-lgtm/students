const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));

// اختبار عمل السيرفر
app.get('/', (req, res) => {
    res.send("SERVER WORKING 🔥 - AI & DASHBOARD CONNECTED");
});

// مفاتيح الـ API وقاعدة البيانات
const API_KEYS = ["AIzaSyBt2ma7t3klkzclyu7liYC-ILmWC0-0ogg"];
const dbURI = 'mongodb+srv://salmaoraby15_db_user:Salma123456@cluster0.9ninmcl.mongodb.net/studentsDB?retryWrites=true&w=majority';

mongoose.connect(dbURI)
    .then(() => console.log("✅ الداتابيز متصلة بنجاح"))
    .catch(err => console.error("❌ فشل اتصال الداتابيز:", err));

// تعريف موديل الطالبة (Schema)
const StudentSchema = new mongoose.Schema({
    studentID: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    preTestScore: { type: Number, default: 0 },
    postTestScore: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    modulesData: { type: Array, default: [] } 
}, { strict: false, minimize: false });

const Student = mongoose.model('Student', StudentSchema, 'students');

// --- 1. مسار إنشاء حساب جديد (تجهيز الـ 16 موديول) ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, studentID, password } = req.body;
        const cleanID = String(studentID).trim();
        const existingStudent = await Student.findOne({ studentID: cleanID });
        
        if (existingStudent) return res.json({ success: false, message: "هذا الكود مسجل بالفعل" });

        // تجهيز مصفوفة الموديولات الـ 16 بشكل افتراضي
        const initialModules = Array.from({ length: 16 }, () => ({
            preScore: 0, 
            postScore: 0, 
            moduleProgress: 0, 
            activityDone: false
        }));

        const newStudent = new Student({
            name: name.trim(),
            studentID: cleanID,
            password: String(password).trim(),
            modulesData: initialModules
        });

        await newStudent.save();
        console.log(`✨ طالبة جديدة سجلت بنجاح: ${name}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 2. مسار تسجيل الدخول ---
app.post('/api/login', async (req, res) => {
    try {
        const { studentID, password } = req.body;
        const student = await Student.findOne({ 
            studentID: String(studentID).trim(), 
            password: String(password).trim() 
        });
        if (student) res.json({ success: true, student });
        else res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 3. مسار جلب بيانات طالبة معينة ---
app.get('/api/student-data/:id', async (req, res) => {
    try {
        const sID = String(req.params.id).trim(); 
        const student = await Student.findOne({ studentID: sID });
        if (student) res.json(student);
        else res.status(404).json({ success: false });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 4. المسار الذهبي: تحديث التقدم والدرجات ---
app.post('/api/update-dashboard', async (req, res) => {
    try {
        const { studentID, updates } = req.body;
        const student = await Student.findOne({ studentID });
        if (!student) return res.status(404).json({ success: false });

        let finalUpdates = {};

        // تحديث الاختبار القبلي
        if (updates.preTestScore !== undefined) {
            if (Number(student.preTestScore) === 0) {
                finalUpdates.preTestScore = Number(updates.preTestScore);
            }
        }

        // تحديث موديول معين (قبلي أو بعدي)
        if (updates.moduleIndex !== undefined) {
            const idx = updates.moduleIndex;
            
            if (updates.modulePreScore !== undefined) {
                finalUpdates[`modulesData.${idx}.preScore`] = Number(updates.modulePreScore);
            }

            if (updates.modulePostScore !== undefined) {
                finalUpdates[`modulesData.${idx}.postScore`] = Number(updates.modulePostScore);
                finalUpdates[`modulesData.${idx}.moduleProgress`] = 100;
                finalUpdates[`modulesData.${idx}.activityDone`] = true;
            }
        }

        // تحديث الدرجة الكلية والتقدم العام
        if (updates.postTestScore !== undefined) {
            finalUpdates.postTestScore = Number(updates.postTestScore);
        }

        if (updates.progress !== undefined) {
            finalUpdates.progress = Math.min(
                (student.progress || 0) + Number(updates.progress),
                100
            );
        }

        // --- تحديث مقاييس الإبداع والنهوض الأكاديمي ---
if (updates.preCreativityScale !== undefined) {
    finalUpdates.preCreativityScale = Number(updates.preCreativityScale);
}

if (updates.postCreativityScale !== undefined) {
    finalUpdates.postCreativityScale = Number(updates.postCreativityScale);
}

if (updates.preAcademicRiseScale !== undefined) {
    finalUpdates.preAcademicRiseScale = Number(updates.preAcademicRiseScale);
}

if (updates.postAcademicRiseScale !== undefined) {
    finalUpdates.postAcademicRiseScale = Number(updates.postAcademicRiseScale);
}

        // التنفيذ
        if (Object.keys(finalUpdates).length > 0) {
            await Student.findOneAndUpdate(
                { studentID },
                { $set: finalUpdates }
            );
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "لا توجد تحديثات جديدة" });
        }

    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- 5. مسار المساعد الذكي (Gemini AI) ---
app.post('/api/chat-with-ai', async (req, res) => {
    const { prompt } = req.body;
    try {
        const genAI = new GoogleGenerativeAI(API_KEYS[0]);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ success: true, reply: response.text() });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.json({ success: false, reply: "عذراً، المساعد الذكي يواجه ضغطاً حالياً." });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على ${PORT}`);
});