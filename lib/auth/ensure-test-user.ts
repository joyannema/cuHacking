import { hashPassword } from "./password";
import { getUsersCollection } from "@/lib/db/collections";

const TEST_USER = { username: "person", password: "hello" };

export async function ensureTestUser() {
  if (process.env.NODE_ENV !== "development") return;

  const users = await getUsersCollection();
  const existing = await users.findOne({ username: TEST_USER.username });
  if (existing) return;

  await users.insertOne({
    username: TEST_USER.username,
    passwordHash: await hashPassword(TEST_USER.password),
    createdAt: new Date(),
  });
}
