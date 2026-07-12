import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCategoriesCollection, getNotesCollection } from "@/lib/db/collections";
import { listNotesForUser, toClientNote } from "@/lib/db/notes";
import { CATEGORY_LABELS } from "@/lib/data";
import { isMood } from "@/lib/moods";
import type { CategorySlug } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, category, title, text, tags, mood, isTodo, todoText, colorIdx } = body;

    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Valid userId is required" }, { status: 400 });
    }
    if (typeof category !== "string" || typeof text !== "string") {
      return NextResponse.json({ error: "category and text are required" }, { status: 400 });
    }

    const userObjectId = new ObjectId(userId);
    const normalizedCategory = category.toLowerCase();
    const label = CATEGORY_LABELS[normalizedCategory as CategorySlug] || normalizedCategory;

    const categories = await getCategoriesCollection();
    const categoryResult = await categories.findOneAndUpdate(
      { userId: userObjectId, label },
      { $setOnInsert: { userId: userObjectId, label, createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    const notes = await getNotesCollection();
    const noteDoc = {
      userId: userObjectId,
      categoryId: categoryResult?._id ?? null,
      category: normalizedCategory,
      title: typeof title === "string" ? title : undefined,
      text,
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [],
      mood: isMood(mood) ? mood : null,
      isTodo: isTodo === true,
      todoText: typeof todoText === "string" ? todoText.toLowerCase() : null,
      todoDone: false,
      photo: false,
      colorIdx: typeof colorIdx === "number" ? colorIdx : 0,
      createdAt: new Date(),
    };
    const result = await notes.insertOne(noteDoc);

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      note: toClientNote({ ...noteDoc, _id: result.insertedId }),
    });
  } catch (error) {
    console.error("notes POST error:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get("userId");

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Valid userId is required" }, { status: 400 });
    }

    const notes = await listNotesForUser(new ObjectId(userId));
    return NextResponse.json({ notes: notes.map(toClientNote) });
  } catch (error) {
    console.error("notes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
