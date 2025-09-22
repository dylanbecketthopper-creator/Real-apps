let xp = 0;
let streak = 0;
let step = 0;
let steps = [];

const homePage = document.getElementById("home");
const lessonPage = document.getElementById("lesson");
const stepContent = document.getElementById("stepContent");
const progressBar = document.getElementById("progress");
const xpDisplay = document.getElementById("xp");
const streakDisplay = document.getElementById("streak");
const lessonWindow = document.querySelector(".lesson-window");

// Feedback text
const feedbackEl = document.createElement("p");
feedbackEl.style.marginTop = "0.5rem";
feedbackEl.style.fontWeight = "bold";
stepContent.appendChild(feedbackEl);

// Pages
function goHome() {
  homePage.classList.remove("hidden");
  lessonPage.classList.add("hidden");
}

async function startLesson() {
  homePage.classList.add("hidden");
  lessonPage.classList.remove("hidden");
  step = 0;
  stepContent.innerHTML = "<p>Loading AI lesson...</p>";

  // Call serverless function instead of direct API
  steps = await fetchAILesson();
  renderStep();
}

// Fetch AI lesson via Netlify function
async function fetchAILesson() {
  try {
    const response = await fetch("/.netlify/functions/getLesson");
    if (!response.ok) throw new Error("Function call failed");

    const aiSteps = await response.json();
    return aiSteps;
  } catch (err) {
    console.error(err);
    alert("Failed to fetch AI lesson. Check your Netlify function.");
    return [
      { title: "Error", content: "AI lesson could not be loaded." }
    ];
  }
}

// Render current step
function renderStep() {
  const s = steps[step];
  stepContent.innerHTML = `<h2>${s.title}</h2><p>${s.content}</p>`;
  lessonWindow.classList.remove("correct");

  stepContent.appendChild(feedbackEl);
  feedbackEl.textContent = "";

  // Multiple choice
  if (s.choices) {
    s.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice;
      btn.className = "styled-btn"; // ✅ use your style
      btn.style.display = "block";
      btn.style.margin = "0.5rem 0";
      btn.onclick = () => {
        if (choice === s.correct) {
          feedbackEl.textContent = "🎉 Correct!";
          lessonWindow.classList.add("correct");
          xp += 5; streak += 1;
        } else {
          feedbackEl.textContent = "❌ Wrong, try again!";
        }
        updateStats();
      };
      stepContent.appendChild(btn);
    });
  }

  // Input challenge
  if (s.input) {
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "Enter answer";
    input.style.display = "block";
    input.style.marginTop = "0.5rem";
    stepContent.appendChild(input);

    const btn = document.createElement("button");
    btn.textContent = "Check";
    btn.className = "styled-btn"; // ✅ keep styling
    btn.style.display = "block";
    btn.style.marginTop = "0.5rem";
    btn.onclick = () => {
      if (Number(input.value) === s.answer) {
        feedbackEl.textContent = "🎉 Correct!";
        lessonWindow.classList.add("correct");
        xp += 5; streak += 1;
      } else {
        feedbackEl.textContent = "❌ Wrong, try again!";
      }
      updateStats();
    };
    stepContent.appendChild(btn);
  }

  // Finish button if it's the last step
  if (s.finish) {
    const btn = document.createElement("button");
    btn.textContent = "Finish";
    btn.className = "styled-btn";
    btn.style.display = "block";
    btn.style.marginTop = "1rem";
    btn.onclick = () => {
      xp += 10;
      streak += 1;
      updateStats();
      goHome();
    };
    stepContent.appendChild(btn);
  }

  progressBar.style.width = `${((step + 1) / steps.length) * 100}%`;
}

// Navigation
function nextStep() {
  if (step < steps.length - 1) { step++; renderStep(); }
}
function prevStep() {
  if (step > 0) { step--; renderStep(); }
}

// XP/streak update
function updateStats() {
  xpDisplay.textContent = `XP: ${xp}`;
  streakDisplay.textContent = `Streak: ${streak} 🔥`;
  xpDisplay.classList.add("bounce");
  setTimeout(() => xpDisplay.classList.remove("bounce"), 600);
}
