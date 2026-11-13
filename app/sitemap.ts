import type { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  let baseUrl = "https://maasventures.com";
  try {
    const settings = getAllSettings();
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
