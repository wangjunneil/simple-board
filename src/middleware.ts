import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAny, getCookieName, getCookieValue } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const cookieName = getCookieName();
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const matched = await verifyTokenAny(token);
  if (!matched) {
    return redirectToLogin(request);
  }

  const response = NextResponse.next();
  response.headers.set("Set-Cookie", getCookieValue(token));
  return response;
}

function redirectToLogin(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next|login|api/auth|site\\.webmanifest|\\.png$|\\.ico$|\\.woff$).*)",
  ],
};
