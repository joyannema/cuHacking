// One-time migration: lowercases existing `category`/`todoText` on notes and
// `label` on categories, so old mixed-case AI output matches the new
// always-lowercase normalization in app/api/classify and app/api/notes.
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { MongoClient } from "mongodb";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env.local — copy .env.example and add your MongoDB password.");
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

async function main() {
  loadEnv();

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  const dbName = process.env.MONGODB_DB_NAME ?? "epiphany";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const notes = db.collection("notes");
    const categories = db.collection("categories");

    let notesTouched = 0;
    const noteCursor = notes.find({});
    for await (const doc of noteCursor) {
      const update = {};
      if (typeof doc.category === "string" && doc.category !== doc.category.toLowerCase()) {
        update.category = doc.category.toLowerCase();
      }
      if (typeof doc.todoText === "string" && doc.todoText !== doc.todoText.toLowerCase()) {
        update.todoText = doc.todoText.toLowerCase();
      }
      if (Object.keys(update).length > 0) {
        await notes.updateOne({ _id: doc._id }, { $set: update });
        notesTouched++;
      }
    }

    let categoriesTouched = 0;
    const catCursor = categories.find({});
    for await (const doc of catCursor) {
      if (typeof doc.label === "string" && doc.label !== doc.label.toLowerCase()) {
        try {
          await categories.updateOne({ _id: doc._id }, { $set: { label: doc.label.toLowerCase() } });
          categoriesTouched++;
        } catch (err) {
          // Unique {userId, label} index collision — a lowercase duplicate already
          // exists, so just drop this stale mixed-case category doc instead.
          if (err.code === 11000) {
            await categories.deleteOne({ _id: doc._id });
            console.log(`  dropped duplicate category "${doc.label}" (lowercase version already exists)`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log(`Lowercased ${notesTouched} note(s) and ${categoriesTouched} categor${categoriesTouched === 1 ? "y" : "ies"}.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
