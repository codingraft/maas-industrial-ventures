import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Logged out successfully." });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
