// app/api/transcribe/route.ts
// Receives an audio recording from the frontend and runs it through
// ElevenLabs (speech-to-text) only. Kept separate from /api/classify so the
// mic step returns as soon as the raw transcript is ready, instead of also
// waiting on Gemini classification.
//
// .env.local (or .env) needs: ELEVENLABS_API_KEY
// Next.js loads these automatically - no dotenv needed here.

import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcript = await transcribeAudio(audioFile, audioFile.name || "recording.webm");

    return NextResponse.json({ transcript });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("transcribe route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
