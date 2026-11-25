import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllSettings, updateSettings, defaultSiteSettings, SiteSettings } from "@/lib/db";

// Existing optional fields may be absent. Validate every supplied known field before saving.
function matchesSetting(value: unknown, model: unknown): boolean {
  if (Array.isArray(model)) {
    return Array.isArray(value) && value.every(item => model.length === 0 || matchesSetting(item, model[0]));
  }
  if (model && typeof model === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return Object.entries(value).every(([key, item]) =>
      !["__proto__", "prototype", "constructor"].includes(key) &&
      (!(key in model) || matchesSetting(item, (model as Record<string, unknown>)[key]))
    );
  }
  return typeof value === typeof model;
}

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new TypeError("Expected object");
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
    "verticals",
    "vision_mission",
  ];

  try {
    const updates: Partial<SiteSettings> = {};
    for (const key of validKeys) {
      if (key in body && body[key] !== undefined) {
        if (!matchesSetting(body[key], defaultSiteSettings[key])) {
          return NextResponse.json({ message: "Invalid " + key + " settings" }, { status: 400 });
        }
        Object.assign(updates, { [key]: body[key] });
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateSettings(updates);
    }

    const updated = await getAllSettings();
    return NextResponse.json({ ok: true, settings: updated });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
  }
}
