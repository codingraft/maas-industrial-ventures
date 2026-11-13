import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

// Type definitions for DatabaseSync if not directly exported by node:sqlite
interface SqliteStatement {
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
}

interface SqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
}

let dbInstance: SqliteDatabase | null = null;

export function getDb(): SqliteDatabase {
  if (dbInstance) return dbInstance;

  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const dataDir = isVercel ? "/tmp" : path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, "maas.db");

  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // In case directory exists or is system-managed
    }
  }

  // If on Vercel and a seed DB exists in the project repository, copy it into writable /tmp
  if (isVercel && !fs.existsSync(dbPath)) {
    const seedPath = path.join(process.cwd(), "data", "maas.db");
    if (fs.existsSync(seedPath)) {
      try {
        fs.copyFileSync(seedPath, dbPath);
      } catch {
        // Fallback to auto-initializing default settings
      }
    }
  }

  const req = createRequire(import.meta.url);
  const { DatabaseSync } = req("node:sqlite") as {
    DatabaseSync: new (path: string) => SqliteDatabase;
  };

  const db = new DatabaseSync(dbPath);
  dbInstance = db;

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      industry TEXT DEFAULT '',
      requirement TEXT DEFAULT '',
      message TEXT DEFAULT '',
      status TEXT DEFAULT 'new',
      notes TEXT DEFAULT '',
      utm_source TEXT DEFAULT '',
      utm_medium TEXT DEFAULT '',
      utm_campaign TEXT DEFAULT '',
      utm_term TEXT DEFAULT '',
      utm_content TEXT DEFAULT '',
      gclid TEXT DEFAULT '',
      fbclid TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Initialize default settings if not exists
  initDefaultSettings(db);

  return db;
}

export * from "./types";
import { defaultMedia, defaultContent, defaultSeo, SiteSettings, Lead, GalleryItem } from "./types";

function initDefaultSettings(db: SqliteDatabase) {
  const getStmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const insertStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");

  const defaults: Record<string, unknown> = {
    site_info: {
      brandName: "MAAS INDUSTRIAL VENTURES PVT LIMITED",
      shortName: "MAAS Industrial Ventures",
      tagline: "A Better Foundation for Industry.",
      subheadline: "Built for industry. Designed for what's next.",
      introduction:
        "MAAS Industrial Ventures Pvt Limited delivers high-capacity, infrastructure-ready industrial addresses engineered for modern manufacturing, strategic distribution, and high-value capital investment.",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      email: "enquiry@maasventures.com",
      address: "MAAS Industrial Hub, Primary Investment Zone, India",
      brochureUrl: "",
    },
    sections: {
      hero: true,
      facts: true,
      overview: true,
      highlights: true,
      infrastructure: true,
      masterplan: true,
      location: true,
      gallery: true,
      timeline: true,
      faq: true,
      enquire: true,
    },
    social_links: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      facebook: "",
      twitter: "",
      youtube: "",
    },
    media: defaultMedia,
    tracking: {
      gtmId: "",
      googleAdsId: "",
      metaPixelId: "",
    },
    seo: defaultSeo,
    content: defaultContent,
  };

  for (const [key, val] of Object.entries(defaults)) {
    const existing = getStmt.get(key);
    if (!existing) {
      insertStmt.run(key, JSON.stringify(val));
    }
  }
}

export function getAllSettings(): SiteSettings {
  const db = getDb();
  const stmt = db.prepare("SELECT key, value FROM settings");
  const rows = stmt.all() as Array<{ key: string; value: string }>;
  const result: Partial<SiteSettings> = {};
  for (const row of rows) {
    result[row.key as keyof SiteSettings] = JSON.parse(row.value);
  }

  // Ensure media has full section-by-section structure (backwards-compatible)
  if (result.media) {
    result.media = {
      ...defaultMedia,
      ...result.media,
      heroSlides: result.media.heroSlides && result.media.heroSlides.length > 0
        ? result.media.heroSlides
        : defaultMedia.heroSlides,
      overviewImage: result.media.overviewImage?.src
        ? result.media.overviewImage
        : defaultMedia.overviewImage,
      infraImage: result.media.infraImage?.src
        ? result.media.infraImage
        : defaultMedia.infraImage,
      masterplanImage: result.media.masterplanImage || defaultMedia.masterplanImage,
      masterplanPlans: (result.media.masterplanPlans && result.media.masterplanPlans.length > 0)
        ? result.media.masterplanPlans
        : (result.media.masterplanImage?.src
            ? [
                {
                  id: "plan-custom",
                  title: "Overall Verified Master Layout",
                  subtitle: "Approved industrial park zoning and plot framework",
                  description: result.media.masterplanImage.caption || "Approved master plan blueprint and zoning framework.",
                  src: result.media.masterplanImage.src,
                  alt: result.media.masterplanImage.alt || "Master Plan Blueprint",
                  tag: "Verified Master Layout",
                },
                ...defaultMedia.masterplanPlans.slice(1),
              ]
            : defaultMedia.masterplanPlans),
      locationImage: result.media.locationImage || defaultMedia.locationImage,
      galleryCategories: (result.media.galleryCategories && result.media.galleryCategories.length > 0)
        ? result.media.galleryCategories
        : defaultMedia.galleryCategories,
      gallery: (result.media.gallery && result.media.gallery.length > 0
        ? result.media.gallery
        : defaultMedia.gallery
      ).map((item, idx) => {
        const defaultCats: GalleryItem["category"][] = [
          "manufacturing",
          "warehousing",
          "infrastructure",
          "logistics",
        ];
        return {
          ...item,
          id: item.id || `gal-${idx + 1}`,
          category: (item.category || defaultCats[idx % defaultCats.length]) as GalleryItem["category"],
        };
      }),
    };
  }

  // Ensure content has full default fallback structure
  result.content = {
    facts: result.content?.facts && result.content.facts.length > 0 ? result.content.facts : defaultContent.facts,
    highlights: result.content?.highlights && result.content.highlights.length > 0 ? result.content.highlights : defaultContent.highlights,
    timeline: result.content?.timeline && result.content.timeline.length > 0 ? result.content.timeline : defaultContent.timeline,
    faqs: result.content?.faqs && result.content.faqs.length > 0 ? result.content.faqs : defaultContent.faqs,
  };

  // Ensure SEO has full default fallback structure
  result.seo = {
    ...defaultSeo,
    ...(result.seo || {}),
  };

  return result as SiteSettings;
}

export function updateSetting(key: keyof SiteSettings, value: unknown) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, JSON.stringify(value));
}
