const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateInsight(noteSummaries: string[]): Promise<string[]> {
  const prompt = `You are a warm, observant friend reading through someone's personal notes app.

Here are their recent notes, most recent first:
${noteSummaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Look for patterns across these notes (recurring topics, places, people, or habits) and write up to 3 short, casual, second-person sentences, each pointing out a DIFFERENT pattern with a light, friendly nudge or recommendation — the kind of thing a friend would text you. Same tone as: "you've mentioned ice cream a few times lately — maybe swing by Honeycone this week?"

Rules:
- Only include a recommendation if there's a real, distinct pattern behind it. If there's only enough signal for 1 or 2, return just those — do NOT pad with filler or repeat the same observation twice.
- Never return more than 3.
- Each sentence under 25 words.
- Base them only on real patterns in the notes above. Do not invent specifics that aren't there.
- Output ONLY valid JSON: an array of strings, e.g. ["...", "..."]. No markdown, no preamble, no explanation.`;

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

  const cleaned = rawText.trim().replace(/^```json|^```|```$/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini did not return valid JSON: ${cleaned}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Gemini JSON was not an array: ${cleaned}`);
  }

  return parsed
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim().replace(/^["'\s]+|["'\s]+$/g, ""))
    .slice(0, 3);
}
