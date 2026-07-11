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

  const dbName = process.env.MONGODB_DB_NAME ?? "synapse";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const users = db.collection("users");
    const notes = db.collection("notes");
    const categories = db.collection("categories");

    await users.createIndex({ username: 1 }, { unique: true });
    await notes.createIndex({ userId: 1, createdAt: -1 });
    await notes.createIndex({ categoryId: 1 });
    await categories.createIndex({ userId: 1, label: 1 }, { unique: true });
    await categories.createIndex({ userId: 1, createdAt: -1 });

    const counts = await Promise.all([
      users.countDocuments(),
      notes.countDocuments(),
      categories.countDocuments(),
    ]);

    console.log(`Database "${dbName}" ready`);
    console.log(`  users:      ${counts[0]} documents`);
    console.log(`  notes:      ${counts[1]} documents`);
    console.log(`  categories: ${counts[2]} documents (empty until Gemini creates them)`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
