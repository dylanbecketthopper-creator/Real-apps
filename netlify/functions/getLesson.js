// getLesson.js
const fetch = require("node-fetch"); // make sure node-fetch is installed

exports.handler = async function (event, context) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return { statusCode: 500, body: "No API key set in environment variables" };
    }

    const prompt = `
*“You are Skill Snail 🐌, a fun and encouraging tutor who teaches real-life beginner skills in 5 simple steps.

Before each question, explain the concept in a short, clear, and playful way so the learner understands before answering. Keep the tone motivating, light, and slightly gamified — like Duolingo but for practical life skills.

Generate a completely new 5-step interactive beginner lesson on one topic.

Rules for steps:
	•	Each step must be either:
	•	a multiple-choice question (choices array) with exactly one correct answer (use correct to mark it), OR
	•	a numeric input challenge (input: true) with a single correct answer (number).
	•	Never mix multiple-choice and input in the same step.
	•	Never leave a question without a correct answer.
	•	Keep questions short, fun, and answerable.
	•	Step 5 must be a wrap-up with "finish": true and no question.

Return the output as a pure JSON array of 5 steps, with each object containing these keys:
	•	title (string: short heading for the step)
	•	content (string: explanation + question text)
	•	choices (array of strings, only if multiple choice)
	•	correct (string, the correct choice, only if multiple choice)
	•	input (boolean, only if numeric input)
	•	answer (number, only if numeric input)
	•	finish (boolean, only in the last wrap-up step)

Do not return anything except the JSON array.”*
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // you can also try "gpt-4o"
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
      }),
    });

    const data = await res.json();

    // Log the full response to see what's coming back from OpenAI
    console.log("OpenAI response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]) {
      throw new Error("No choices returned from OpenAI: " + JSON.stringify(data));
    }

    let text = data.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();

    let steps;
    try {
      steps = JSON.parse(text);
    } catch (parseError) {
      throw new Error("Failed to parse JSON from OpenAI response: " + text);
    }

    return { statusCode: 200, body: JSON.stringify(steps) };

  } catch (err) {
    // Log the exact error for debugging
    console.error("Error in getLesson function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
