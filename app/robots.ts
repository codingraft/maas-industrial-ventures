import type { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  let baseUrl = "https://maasventures.com";
  let allowIndex = true;
  try {
    const settings = getAllSettings();
    if (settings.seo?.canonicalUrl) {
      baseUrl = settings.seo.canonicalUrl;
    }
    if (settings.seo?.robotsIndex !== undefined) {
      allowIndex = settings.seo.robotsIndex;
    }
  } catch {
    // fallback if db is initializing
  }

  const cleanUrl = baseUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: allowIndex ? "/" : undefined,
      disallow: allowIndex ? ["/admin", "/api/"] : "/",
    },
    sitemap: `${cleanUrl}/sitemap.xml`,
  };
}
