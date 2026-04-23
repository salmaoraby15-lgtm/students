const selects = document.querySelectorAll('.select-one select, .select-two select, .select-three select, .select-four select');
const recommendationsSelect = document.querySelector('.select-five select');



function getRandomItems(array, count = 2) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

selects.forEach(select => {
  select.addEventListener('change', function () {
    recommendationsSelect.innerHTML = '<option selected>التوصيات</option>';
    const value = parseInt(this.value);
    const recs = recommendations[value] || recommendations.default;
    const selectedRecs = getRandomItems(recs);
    selectedRecs.forEach((rec, index) => {
      const option = document.createElement('option');
      option.value = 100 + index;
      option.textContent = rec;
      recommendationsSelect.appendChild(option);
    });
  });
});
const data = {
  goal0: {
    type: "video",
    content: `
        <video class="responsive-video" controls muted>
         <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
          المتصفح لا يدعم عرض الفيديو.
        </video>
      `
  },
  goal1: {
    type: "video",
    questions: [
      {
        question: "ما هو الذكاء الاصطناعي؟",
        options: ["برمجة الحواسيب لأداء مهام ذكية", "التصميم الجرافيكي", "تحليل البيانات فقط", "تعلم الآلة"],
        answer: 0
      }
    ]
  },
  goal2: {
    type: "video",
    questions: [
      {
        question: "الذكاء الاصطناعي التوليدي يعتمد على توليد محتوى جديد. صح أم خطأ؟",
        answer: true
      }
    ]
  },
  goal3: {
    type: "video",
    questions: [
      {
        question: "ما هي معمارية برمجيات الذكاء الاصطناعي التوليدي؟",
        options: ["شبكات عصبية عميقة", "قواعد بيانات فقط", "أجهزة الحاسوب", "خوارزميات التعلم"],
        answer: 0
      },
      {
        question: "أي من التالي جزء من المعمارية؟",
        options: ["التعلم العميق", "الكتابة اليدوية", "الترجمة الآلية", "التحليل الإحصائي"],
        answer: 0
      },
      {
        question: "هل تستخدم المعمارية التوليد؟",
        options: ["نعم", "لا", "أحياناً", "غير معروف"],
        answer: 0
      }
    ]
  },
  goal4: {
    type: "video",
    questions: [
      {
        question: "هندسة الأوامر مهمة لضبط استجابات الذكاء الاصطناعي. صح أم خطأ؟",
        answer: true
      }
    ]
  },
  goal5: {
    type: "mixed",
    truefalse: [
      { question: "التوظيف الصحيح يقلل الأخطاء. صح أم خطأ؟", answer: true },
      { question: "لا حاجة لقواعد التوظيف. صح أم خطأ؟", answer: false }
    ],
    multiplechoice: [
      {
        question: "ما هي إحدى قواعد التوظيف؟",
        options: ["التحقق من المصداقية", "عدم اختبار النموذج", "عدم المتابعة", "تجاهل الأخطاء"],
        answer: 0
      },
      {
        question: "كيف نتحقق من التوظيف الصحيح؟",
        options: ["باستخدام تقنيات التقييم", "تجاهل الأخطاء", "عدم التحديث", "عدم الاختبار"],
        answer: 0
      }
    ]
  },
  goal6: {
    type: "tf",
    questions: [
      { question: "الذكاء الاصطناعي التوليدي يستخدم في البحث العلمي. صح أم خطأ؟", answer: true },
      { question: "يقتصر على الترفيه فقط. صح أم خطأ؟", answer: false },
      { question: "يساعد في تحليل البيانات. صح أم خطأ؟", answer: true }
    ]
  },
  goal7: {
    type: "mc",
    questions: [
      {
        question: "ما أهمية توظيف الذكاء الاصطناعي في البحث؟",
        options: ["تسريع البحث", "إطالة مدة البحث", "إزالة الباحثين", "زيادة الأخطاء"],
        answer: 0
      }
    ]
  },
  goal8: {
    type: "mc",
    questions: [
      {
        question: "ما هي معايير تقييم الذكاء الاصطناعي التوليدي؟",
        options: ["الدقة، الأصالة، الإبداع", "السعر، الحجم", "اللون، التصميم", "السرعة"],
        answer: 0
      }
    ]
  },
  goal9: {
    type: "tf",
    questions: [
      { question: "عدم الانتحال هو جزء من النزاهة الأكاديمية. صح أم خطأ؟", answer: true },
      { question: "استخدام مصادر غير موثوقة مقبول. صح أم خطأ؟", answer: false }
    ]
  },
  goal10: {
    type: "upload",
    content: `
        <h3 class="question-title">رفع ملف برمجي</h3>
        <div class="upload-section">
          <label for="fileUpload">اختر ملفاً للرفع:</label>
          <input type="file" id="fileUpload" />
        </div>
      `
  }
};

const goalsList = document.getElementById("goalsList");
const contentArea = document.getElementById("contentArea");
let currentGoalId = "goal0";
let currentIndex = 0;
let firstAttempt = true;
let mixedQuestionsCache = {};

// لتخزين إذا تمت الإجابة على كل سؤال من كل هدف (key: goalId_index)
const answeredQuestions = {};

function renderVideo(content) {
  contentArea.innerHTML = content;
}

function createMCQ(q) {
  return `
      <div class="question-card">
        <div class="question-title">${q.question}</div>
        <div class="options">
          ${q.options.map((opt, i) => `<button data-index="${i}">${opt}</button>`).join("")}
        </div>
        <div class="feedback"></div>
      </div>
    `;
}

function createTFQ(q) {
  return `
      <div class="question-card">
        <div class="question-title">${q.question}</div>
        <div class="options">
          <button data-answer="true">صح</button>
          <button data-answer="false">خطأ</button>
        </div>
        <div class="feedback"></div>
      </div>
    `;
}

function createMixed(goalData, goalId) {
  if (mixedQuestionsCache[goalId]) return mixedQuestionsCache[goalId];
  let combined = [];
  if (goalData.truefalse) {
    goalData.truefalse.forEach(q => combined.push({ ...q, type: "tf" }));
  }
  if (goalData.multiplechoice) {
    goalData.multiplechoice.forEach(q => combined.push({ ...q, type: "mc" }));
  }
  mixedQuestionsCache[goalId] = combined;
  return combined;
}

// الدالة التي تنشئ الخيارات مع التحكم في محاولات الإجابة
const userAnswers = {}; // key: goalId_index -> { answeredOnce: bool, locked: bool }

function setupOptions(goalId, type, index, combined = null) {
  const buttons = contentArea.querySelectorAll(".options button");

  const questionKey = goalId + "_" + index;
  const answeredOnce = userAnswers[questionKey]?.answeredOnce || false;

  buttons.forEach(btn => btn.disabled = false);

  buttons.forEach(btn => {
    btn.onclick = () => {
      if (userAnswers[questionKey]?.locked) return;

      let correctAnswer;
      let userAnswer;
      if (type === "mc") {
        correctAnswer = data[goalId].questions ? data[goalId].questions[index].answer : combined[index].answer;
        userAnswer = parseInt(btn.dataset.index);
      } else if (type === "tf") {
        if (combined) {
          correctAnswer = combined[index].answer;
        } else {
          correctAnswer = data[goalId].questions[index].answer;
        }
        userAnswer = btn.dataset.answer === "true";
      }

      const feedback = contentArea.querySelector(".feedback");

      if (!answeredOnce) {
        feedback.textContent = "لقد تم تسجيل إجابتك";
        feedback.style.color = "blue";

        buttons.forEach(b => b.disabled = true);

        userAnswers[questionKey] = { answeredOnce: true, locked: false };
      } else {
        if (userAnswer === correctAnswer) {
          btn.classList.add("correct");
          feedback.textContent = "إجابة صحيحة!";
          feedback.style.color = "green";
        } else {
          btn.classList.add("wrong");
          feedback.textContent = "إجابة خاطئة!";
          feedback.style.color = "red";

          buttons.forEach(b => {
            let ans = (type === "mc") ? parseInt(b.dataset.index) : (b.dataset.answer === "true");
            if (ans === correctAnswer) {
              b.classList.add("correct");
            }
          });
        }

        userAnswers[questionKey].locked = true;

        buttons.forEach(b => b.disabled = true);
      }
    };
  });
}

function renderQuestion(goalId, index) {
  contentArea.innerHTML = "";
  let goalData = data[goalId];
  if (!goalData) return;

  if (goalData.type === "video") {
    renderVideo(goalData.content);
    return;
  }

  if (goalData.type === "upload") {
    contentArea.innerHTML = goalData.content;
    return;
  }

  let qCount = 0;
  if (goalData.type === "mc" || goalData.type === "tf") {
    qCount = goalData.questions.length;
  } else if (goalData.type === "mixed") {
    const combined = createMixed(goalData, goalId);
    qCount = combined.length;
  }

  if (index < 0) index = 0;
  if (index >= qCount) index = qCount - 1;

  currentIndex = index;

  let html = "";
  if (goalData.type === "mc") {
    html = createMCQ(goalData.questions[index]);
    contentArea.innerHTML = html;
    setupOptions(goalId, "mc", index);
  } else if (goalData.type === "tf") {
    html = createTFQ(goalData.questions[index]);
    contentArea.innerHTML = html;
    setupOptions(goalId, "tf", index);
  } else if (goalData.type === "mixed") {
    const combined = createMixed(goalData, goalId);
    if (combined[index].type === "mc") {
      html = createMCQ(combined[index]);
    } else {
      html = createTFQ(combined[index]);
    }
    contentArea.innerHTML = html;
    setupOptions(goalId, combined[index].type, index, combined);
  }

  // أزرار التنقل بين الأسئلة (السابق، التالي)
  if (qCount > 1) {
    const controls = document.createElement("div");
    controls.classList.add("carousel-controls");
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "السابق";
    prevBtn.disabled = index === 0;
    prevBtn.onclick = () => renderQuestion(goalId, index - 1);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "التالي";
    nextBtn.disabled = index === qCount - 1;
    nextBtn.onclick = () => renderQuestion(goalId, index + 1);

    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    contentArea.appendChild(controls);
  }
}

function setActiveGoal(goalId) {
  const allGoals = document.querySelectorAll(".goal");
  allGoals.forEach(g => g.classList.remove("active"));
  const activeGoal = [...allGoals].find(g => g.dataset.target === goalId);
  if (activeGoal) activeGoal.classList.add("active");
}

goalsList.addEventListener("click", e => {
  if (e.target.classList.contains("goal")) {
    const goalId = e.target.dataset.target;
    currentGoalId = goalId;
    currentIndex = 0;
    setActiveGoal(goalId);
    renderQuestion(goalId, 0);
  }
});

// بداية التحميل
renderQuestion(currentGoalId, 0);



