import { ObjectId } from "mongodb";
import { getNotesCollection } from "./collections";
import type { NoteDoc } from "./types";

export async function listNotesForUser(userId: ObjectId, limit = 100): Promise<NoteDoc[]> {
  const notes = await getNotesCollection();
  return notes.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
}
