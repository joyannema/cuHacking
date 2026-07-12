import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db/collections";
import { listNotesForUser } from "@/lib/db/notes";
import { generateInsight } from "@/lib/insight";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_NOTES = 3;

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get("userId");

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Valid userId is required" }, { status: 400 });
    }

    const userObjectId = new ObjectId(userId);
    const users = await getUsersCollection();
    const user = await users.findOne({ _id: userObjectId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFresh =
      user.insightTexts &&
      user.insightTexts.length > 0 &&
      user.insightGeneratedAt &&
      Date.now() - new Date(user.insightGeneratedAt).getTime() < CACHE_TTL_MS;

    if (isFresh) {
      return NextResponse.json({ insights: user.insightTexts, cached: true });
    }

    const notes = await listNotesForUser(userObjectId, 50);

    if (notes.length < MIN_NOTES) {
      return NextResponse.json({ insights: null, reason: "not_enough_notes" });
    }

    try {
      const summaries = notes.map((n) => {
        const tags = n.tags.length ? ` (tags: ${n.tags.join(", ")})` : "";
        return `${n.text}${tags}`;
      });
      const insightTexts = await generateInsight(summaries);

      if (insightTexts.length === 0) {
        return NextResponse.json({ insights: null, reason: "not_enough_notes" });
      }

      await users.updateOne(
        { _id: userObjectId },
        { $set: { insightTexts, insightGeneratedAt: new Date() } }
      );

      return NextResponse.json({ insights: insightTexts, cached: false });
    } catch (genError) {
      console.error("insight generation failed:", genError);

      if (user.insightTexts && user.insightTexts.length > 0) {
        return NextResponse.json({ insights: user.insightTexts, cached: true, stale: true });
      }
      return NextResponse.json({ insights: null, reason: "generation_failed" });
    }
  } catch (error) {
    console.error("insight GET error:", error);
    return NextResponse.json({ error: "Failed to get insight" }, { status: 500 });
  }
}
