import { NextResponse } from "next/server";
import { ensureTestUser } from "@/lib/auth/ensure-test-user";
import { verifyPassword } from "@/lib/auth/password";
import { getUsersCollection } from "@/lib/db/collections";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username =
    typeof body === "object" && body !== null && "username" in body && typeof body.username === "string"
      ? body.username.trim()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body && typeof body.password === "string"
      ? body.password
      : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  await ensureTestUser();

  const users = await getUsersCollection();
  const user = await users.findOne({ username });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  return NextResponse.json({
    userId: user._id.toString(),
    username: user.username,
  });
}
