// app/api/notes/route.ts
// Persists notes (and the categories they use) to MongoDB, and lets the
// client reload a user's saved notes at sign-in.

import { NextRequest, NextResponse } from "next/server";
import { ObjectId, type WithId } from "mongodb";
import { getCategoriesCollection, getNotesCollection } from "@/lib/db/collections";
import type { NoteDoc } from "@/lib/db/types";
import { formatRelativeTime } from "@/lib/data";
import type { Note } from "@/lib/types";

function noteDocToNote(doc: WithId<NoteDoc>): Note {
  return {
    // ObjectIds are unique, so a numeric slice of the hex string is a safe,
    // collision-free id for the frontend's number-keyed Note.id.
    id: parseInt(doc._id.toHexString().slice(0, 12), 16),
    category: doc.category as Note["category"],
    text: doc.text,
    tags: doc.tags,
    time: formatRelativeTime(doc.createdAt),
    colorIdx: doc.colorIdx,
    title: doc.title || undefined,
    mood: (doc.mood as Note["mood"]) || undefined,
    isTodo: doc.isTodo || undefined,
    todoText: doc.todoText || undefined,
    todoDone: doc.todoDone || undefined,
    photo: doc.photo || undefined,
  };
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const notesCol = await getNotesCollection();
  const docs = await notesCol.find({ userId: userObjectId }).sort({ createdAt: -1 }).toArray();

  return NextResponse.json({ notes: docs.map(noteDocToNote) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, category, title, text, tags, mood, isTodo, todoText, photo, colorIdx } = body;

    if (!userId || !category || !text) {
      return NextResponse.json({ error: "userId, category, and text are required" }, { status: 400 });
    }

    let userObjectId: ObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const categoriesCol = await getCategoriesCollection();
    await categoriesCol.updateOne(
      { userId: userObjectId, label: category },
      { $setOnInsert: { userId: userObjectId, label: category, createdAt: new Date() } },
      { upsert: true }
    );

    const notesCol = await getNotesCollection();
    const doc: NoteDoc = {
      userId: userObjectId,
      category,
      title: title || "",
      text,
      tags: Array.isArray(tags) ? tags : [],
      mood: mood ?? null,
      isTodo: !!isTodo,
      todoText: todoText ?? null,
      todoDone: false,
      photo: !!photo,
      colorIdx: typeof colorIdx === "number" ? colorIdx : 0,
      createdAt: new Date(),
    };

    const result = await notesCol.insertOne(doc);

    return NextResponse.json({ note: noteDocToNote({ ...doc, _id: result.insertedId }) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("notes POST error:", message);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
