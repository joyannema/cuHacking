// voiceClassifier.js
// Pipeline: audio file -> ElevenLabs Scribe (speech-to-text) -> Gemini (classify) -> JSON
//
// Setup:
//   npm install dotenv node-fetch form-data
//   .env file with ELEVENLABS_API_KEY and GEMINI_API_KEY
//
// Test it directly:
//   node voiceClassifier.js path/to/audio.mp3

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Step 1: send audio to ElevenLabs Scribe, get back a transcript string
async function transcribeAudio(audioFilePath) {
  const fileBuffer = fs.readFileSync(audioFilePath);
  const blob = new Blob([fileBuffer]);

  const form = new FormData();
  form.append('file', blob, path.basename(audioFilePath));
  form.append('model_id', 'scribe_v1');

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
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
// existingCategories: array of category names already used by this user, e.g. ['food', 'todo', 'work']
// Passing this lets Gemini reuse a category instead of inventing a near-duplicate every time.
async function classifyTranscript(transcript, existingCategories = []) {
  const categoryContext = existingCategories.length > 0
    ? `Categories already in use: ${existingCategories.join(', ')}.
If one of these is a good semantic match for this thought, REUSE it exactly (same spelling/casing). Only create a new category if none of the existing ones fit well.`
    : `No categories exist yet - create one that fits this thought.`;

  const prompt = `You are organizing a short voice note transcript into a category. Categories should be short, single lowercase words or short phrases (e.g. "food", "todo", "work", "ideas") - not full sentences.

${categoryContext}

Transcript: "${transcript}"

Return ONLY valid JSON, no markdown formatting, no extra text, in this exact shape:
{
  "category": a short lowercase category name (reused or new, per the instructions above),
  "title": a short 3-6 word title,
  "details": the cleaned up version of the transcript,
  "extracted_fields": { any relevant structured info you can pull out, e.g. person name, place name, due date. Use null for fields that don't apply. }
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini call failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;

  // Gemini sometimes wraps JSON in ```json fences even when told not to - strip if present
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  return JSON.parse(cleaned);
}

// Full pipeline: audio in, classified JSON out
// existingCategories: optional array of category names already saved for this user (e.g. fetched from Mongo)
async function classifyVoiceNote(audioFilePath, existingCategories = []) {
  const transcript = await transcribeAudio(audioFilePath);
  const classified = await classifyTranscript(transcript, existingCategories);
  return classified;
}

module.exports = { classifyVoiceNote, transcribeAudio, classifyTranscript };

// Allow running directly from command line for testing:
// node voiceClassifier.js path/to/audio.mp3
if (require.main === module) {
  const audioPath = process.argv[2];
  if (!audioPath) {
    console.error('Usage: node voiceClassifier.js <path-to-audio-file>');
    process.exit(1);
  }

  classifyVoiceNote(audioPath)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((err) => console.error('Error:', err.message));
}