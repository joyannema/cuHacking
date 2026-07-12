// app/api/classify/route.ts
// Receives an audio recording from the frontend, runs it through
// ElevenLabs (speech-to-text) then Gemini (classification), returns JSON.
//
// .env.local (or .env) needs: ELEVENLABS_API_KEY, GEMINI_API_KEY
// Next.js loads these automatically - no dotenv needed here.

import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Step 1: send audio to ElevenLabs Scribe, get back a transcript string
async function transcribeAudio(audioBlob: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", audioBlob, filename);
  form.append("model_id", "scribe_v1");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY! },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs STT failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.text;
}

// Step 2: send transcript to Gemini, get back structured JSON
async function classifyTranscript(transcript: string, existingCategories: string[] = []) {
  const categoryContext =
    existingCategories.length > 0
      ? `Categories already in use: ${existingCategories.join(", ")}.
If one of these is a good semantic match for this thought, REUSE it exactly (same spelling/casing). Only create a new category if none of the existing ones fit well.`
      : `No categories exist yet - create one that fits this thought.`;

  const prompt = `You are an AI assistant that organizes voice notes into structured notes for a note-taking app.

${categoryContext}

Transcript:
"${transcript}"

Your job is to:
1. Choose the best category for this note. Reuse an existing category whenever possible.
2. Generate a natural, human-readable title (3-8 words). Do NOT simply copy the first few words of the transcript.
3. Lightly clean up the transcript (fix filler words, obvious typos, run-on sentences) but keep it as close to the original wording as possible. Do NOT add details, dates, or specifics that weren't actually said. Do NOT paraphrase into different words if the original phrasing already makes sense.
4. Generate 2-5 short relevant tags (lowercase, no # symbols).
5. Extract any useful structured information such as people, places, dates, times, money, organizations, or tasks.
6. Determine if this note describes an action the person needs to do (a task/reminder like "call mom" or "submit the report") versus just a thought or observation with nothing actionable.

Return ONLY valid JSON in exactly this format:

{
  "category": "string",
  "title": "string",
  "details": "string",
  "tags": ["tag1", "tag2"],
  "is_todo": true or false,
  "extracted_fields": {
    "person": null,
    "place": null,
    "date": null,
    "time": null,
    "organization": null,
    "money": null,
    "task": null
  }
}`;

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

  if (!rawText) {
    throw new Error("Gemini returned no text.");
  } 

  const cleaned = rawText.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
  }

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const existingCategoriesRaw = formData.get("existingCategories") as string | null;
    const existingCategories: string[] = existingCategoriesRaw ? JSON.parse(existingCategoriesRaw) : [];

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcript = await transcribeAudio(audioFile, audioFile.name || "recording.webm");
    const classified = await classifyTranscript(transcript, existingCategories);

    console.log("Gemini response:", classified);

    return NextResponse.json({ transcript, ...classified });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("classify route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
