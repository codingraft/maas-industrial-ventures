import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllSettings, updateSetting, SiteSettings } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<SiteSettings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const validKeys: (keyof SiteSettings)[] = [
    "site_info",
    "sections",
    "social_links",
    "media",
    "tracking",
    "seo",
    "content",
  ];

  try {
    for (const key of validKeys) {
      if (key in body && body[key] !== undefined) {
        await updateSetting(key, body[key]);
      }
    }
    const updated = await getAllSettings();
    return NextResponse.json({ ok: true, settings: updated });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
  }
}
