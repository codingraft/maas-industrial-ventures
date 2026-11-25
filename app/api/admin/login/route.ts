import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000); // 5 attempts per 15 min

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many failed login attempts. Please wait 15 minutes." },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new TypeError("Expected object");
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const { username, password } = body;
  const isValid = verifyAdminCredentials(username, password);

  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid administrator credentials. Access denied." },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true, message: "Logged in successfully." });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
