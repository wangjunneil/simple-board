import { NextRequest, NextResponse } from "next/server";
import { signToken, getCookieValue } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const password = process.env.ACCESS_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  try {
    const { password: inputPassword } = await request.json();

    if (inputPassword !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await signToken(password);
    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: { "Set-Cookie": getCookieValue(token) },
      }
    );
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
