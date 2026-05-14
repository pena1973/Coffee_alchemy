import { NextResponse } from "next/server";
import { authenticate, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const user = authenticate(String(body.email ?? "").toLowerCase(), String(body.password ?? ""));
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await setSession(user);
  return NextResponse.json({ user });
}
