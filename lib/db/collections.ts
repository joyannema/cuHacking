import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CategoryDoc, NoteDoc, UserDoc } from "./types";

export const COLLECTIONS = {
  users: "users",
  notes: "notes",
  categories: "categories",
} as const;

export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>(COLLECTIONS.users);
}

export async function getNotesCollection(): Promise<Collection<NoteDoc>> {
  const db = await getDb();
  return db.collection<NoteDoc>(COLLECTIONS.notes);
}

export async function getCategoriesCollection(): Promise<Collection<CategoryDoc>> {
  const db = await getDb();
  return db.collection<CategoryDoc>(COLLECTIONS.categories);
}
