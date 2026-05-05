import { NextRequest, NextResponse } from "next/server";
import { signToken, getCookieValue, getClearCookieValue, getPasswords } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const passwords = getPasswords();
  if (passwords.length === 0) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  try {
    const { password: inputPassword } = await request.json();

    const matched = passwords.find(p => p === inputPassword);
    if (!matched) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await signToken(matched);
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

export async function DELETE() {
  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: { "Set-Cookie": getClearCookieValue() },
    }
  );
}
