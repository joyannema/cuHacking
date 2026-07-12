import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCategoriesCollection, getNotesCollection } from "@/lib/db/collections";
import { listNotesForUser } from "@/lib/db/notes";
import { CATEGORY_LABELS } from "@/lib/data";
import type { CategorySlug } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, category, title, text, tags } = body;

    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Valid userId is required" }, { status: 400 });
    }
    if (typeof category !== "string" || typeof text !== "string") {
      return NextResponse.json({ error: "category and text are required" }, { status: 400 });
    }

    const userObjectId = new ObjectId(userId);
    const label = CATEGORY_LABELS[category as CategorySlug] || category;

    const categories = await getCategoriesCollection();
    const categoryResult = await categories.findOneAndUpdate(
      { userId: userObjectId, label },
      { $setOnInsert: { userId: userObjectId, label, createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    const notes = await getNotesCollection();
    const result = await notes.insertOne({
      userId: userObjectId,
      categoryId: categoryResult?._id ?? null,
      title: typeof title === "string" ? title : undefined,
      text,
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [],
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
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
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("notes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
