import { ObjectId } from "mongodb";
import { getNotesCollection } from "./collections";
import type { NoteDoc } from "./types";
import type { CategorySlug, Note } from "@/lib/types";
import { formatRelativeTime } from "@/lib/data";
import { isMood } from "@/lib/moods";

export async function listNotesForUser(userId: ObjectId, limit = 100): Promise<NoteDoc[]> {
  const notes = await getNotesCollection();
  return notes.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
}

// Derives a stable numeric id from a note's ObjectId so it can slot into the
// client's Note.id: number field without widening that type across the app.
export function objectIdToNumericId(id: ObjectId): number {
  return parseInt(id.toHexString().slice(-8), 16);
}

// Defensive against older documents saved before this schema (and its
// required fields) existed — falls back to sane defaults for anything missing.
export function toClientNote(doc: NoteDoc): Note {
  return {
    id: objectIdToNumericId(doc._id!),
    category: (doc.category || "random_thoughts") as CategorySlug,
    title: doc.title,
    text: doc.text,
    tags: doc.tags ?? [],
    time: formatRelativeTime(doc.createdAt),
    colorIdx: doc.colorIdx ?? 0,
    mood: isMood(doc.mood) ? doc.mood : undefined,
    isTodo: doc.isTodo ?? false,
    todoText: doc.todoText ?? undefined,
    todoDone: doc.todoDone ?? false,
    photo: doc.photo ?? false,
  };
}
