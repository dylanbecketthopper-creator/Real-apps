export async function handler(event, context) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return { statusCode: 500, body: "No API key set" };
    }

    const prompt = `
Generate a brand new 5-step interactive life skills lesson for a beginner.
Topic should be practical and unique (examples: "How to read a map", "How to tie a knot", "How to prepare for an interview").
Each step must include:
- A short explanation
- Multiple choice quiz questions (with a correct answer) when needed
- One input challenge with a numeric answer
Return ONLY a JSON array with objects: title, content, choices, correct, need, want, input, answer, finish.
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0
      })
    });

    const data = await res.json();
    let text = data.choices[0].message.content;

    text = text.replace(/```json|```/g, "").trim();
    const steps = JSON.parse(text);

    return { statusCode: 200, body: JSON.stringify(steps) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
