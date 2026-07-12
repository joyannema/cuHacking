// Mood -> tempo + descriptive prompt used to generate a short mood-matched
// instrumental via the ElevenLabs Music API (POST /v1/music).

export type Mood = "happy" | "calm" | "sad" | "energetic" | "angry" | "anxious" | "nostalgic" | "neutral";

export const MOODS: Mood[] = ["happy", "calm", "sad", "energetic", "angry", "anxious", "nostalgic", "neutral"];

export const MOOD_PRESETS: Record<Mood, { bpm: number; prompt: string }> = {
  happy: { bpm: 128, prompt: "a bright, cheerful, upbeat instrumental with playful major-key melodies" },
  calm: { bpm: 72, prompt: "a soft, calm, gentle ambient instrumental with warm mellow tones" },
  sad: { bpm: 68, prompt: "a slow, melancholic, wistful instrumental piano piece in a minor key" },
  energetic: { bpm: 140, prompt: "an energetic, driving instrumental with punchy rhythms" },
  angry: { bpm: 150, prompt: "an intense, tense instrumental with heavy driving rhythms" },
  anxious: { bpm: 110, prompt: "a tense, uneasy, restless instrumental with fluttering strings" },
  nostalgic: { bpm: 90, prompt: "a warm, nostalgic, bittersweet instrumental with soft acoustic guitar and strings" },
  neutral: { bpm: 100, prompt: "a simple, understated instrumental with light piano" },
};

const BEATS_PER_BAR = 4;
const BARS = 16;

export function isMood(value: unknown): value is Mood {
  return typeof value === "string" && (MOODS as string[]).includes(value);
}

// ElevenLabs Music takes a duration in ms, not a bar count, so we derive
// roughly 16 bars of 4/4 from the mood's tempo.
export function musicLengthMsForMood(mood: Mood) {
  const bpm = MOOD_PRESETS[mood].bpm;
  const ms = Math.round(((BARS * BEATS_PER_BAR) / bpm) * 60 * 1000);
  return Math.min(600000, Math.max(3000, ms));
}

export function musicPromptForMood(mood: Mood) {
  return `A short, simple, 16-bar instrumental tune. ${MOOD_PRESETS[mood].prompt}. No vocals, no lyrics, no spoken word.`;
}
