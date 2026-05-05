import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getCookieName, getCookieValue } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const password = process.env.ACCESS_PASSWORD;
  if (!password) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  const cookieName = getCookieName();
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const valid = await verifyToken(token, password);
  if (!valid) {
    return redirectToLogin(request);
  }

  const response = NextResponse.next();
  response.headers.set("Set-Cookie", getCookieValue(token));
  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next|login|api/auth|site\\.webmanifest|\\.png$|\\.ico$|\\.woff$).*)",
  ],
};
