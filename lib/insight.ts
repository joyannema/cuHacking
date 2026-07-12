const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateInsight(noteSummaries: string[]): Promise<string> {
  const prompt = `You are a warm, observant friend reading through someone's personal notes app.

Here are their recent notes, most recent first:
${noteSummaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Look for a pattern across these notes (a recurring topic, place, person, or habit) and write exactly ONE short, casual, second-person sentence pointing it out with a light, friendly nudge or recommendation — the kind of thing a friend would text you. Same tone as: "you've mentioned ice cream a few times lately — maybe swing by Honeycone this week?"

Rules:
- Output ONLY the sentence, no quotes, no markdown, no preamble.
- Keep it under 25 words.
- Base it only on real patterns in the notes above. Do not invent specifics that aren't there.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini call failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText || typeof rawText !== "string") {
    throw new Error("Gemini returned no text.");
  }

  return rawText.trim().replace(/^["'\s]+|["'\s]+$/g, "");
}
