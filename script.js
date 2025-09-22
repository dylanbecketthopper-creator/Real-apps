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

// ===== PUT YOUR OPENAI API KEY HERE =====
const OPENAI_API_KEY = "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";

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

  // Call OpenAI
  steps = await fetchAILesson();
  renderStep();
}

// Fetch AI lesson from OpenAI
async function fetchAILesson() {
  const prompt = `
Generate a completely new and unique 5-step interactive life skills lesson for a beginner. 
The topic should be practical, useful, and not repeat previous examples. 
Some possible inspirations are things like "How to read a map properly" or "How to tie a knot you might need". 
But you must choose your own fresh topic each time. 

Requirements:
1. Create a 5-step lesson.
2. Each step should include a short title and a short text explanation.
3. Include multiple choice quiz questions where needed, with a "correct" answer key.
4. At least one step should have an input challenge with a numeric answer (include "input:true" and "answer" fields).
5. The final step should be a wrap-up with no quiz, and include a "finish": true field.
6. Return only a JSON array of objects, with these possible keys: 
   - title
   - content
   - choices (array of strings)
   - correct (string for multiple choice)
   - need (array, optional for categorize step)
   - want (array, optional for categorize step)
   - input (boolean)
   - answer (number for input step)
   - finish (boolean, for last step).
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0
      })
    });

    const data = await response.json();

    // Get the AI's JSON response
    let text = data.choices[0].message.content;
    text = text.replace(/```json|```/g,"").trim();

    const aiSteps = JSON.parse(text);
    return aiSteps;

  } catch(err) {
    console.error(err);
    alert("Failed to fetch AI lesson. Check API key or network.");
    return [
      { title:"Error", content:"AI lesson could not be loaded." }
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
      btn.style.display="block";
      btn.style.margin="0.5rem 0";
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

  progressBar.style.width = `${((step+1)/steps.length)*100}%`;
}

// Navigation
function nextStep() {
  if(step < steps.length-1){ step++; renderStep(); }
}
function prevStep() {
  if(step>0){ step--; renderStep(); }
}

// XP/streak update
function updateStats() {
  xpDisplay.textContent = `XP: ${xp}`;
  streakDisplay.textContent = `Streak: ${streak} 🔥`;
  xpDisplay.classList.add("bounce");
  setTimeout(() => xpDisplay.classList.remove("bounce"), 600);
}