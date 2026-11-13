import type { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = "https://maasventures.com";
  try {
    const settings = await getAllSettings();
    if (settings.seo?.canonicalUrl) {
      baseUrl = settings.seo.canonicalUrl;
    }
  } catch {
    // fallback if db is initializing
  }

  const cleanUrl = baseUrl.replace(/\/$/, "");

  return [
    {
      url: cleanUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
