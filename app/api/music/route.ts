// app/api/music/route.ts
// Generates a short mood-matched instrumental via the ElevenLabs Music API.
//
// .env.local (or .env) needs: ELEVENLABS_API_KEY

import { NextRequest, NextResponse } from "next/server";
import { isMood, musicLengthMsForMood, musicPromptForMood, type Mood } from "@/lib/moods";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mood: Mood = isMood(body?.mood) ? body.mood : "neutral";

    const response = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: musicPromptForMood(mood),
        music_length_ms: musicLengthMsForMood(mood),
        force_instrumental: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs Music failed (${response.status}): ${errText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("music route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
