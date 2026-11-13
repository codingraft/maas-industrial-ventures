import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { isMongoConfigured, getMongoDb } from "./mongodb";
import {
  defaultMedia,
  defaultContent,
  defaultSeo,
  SiteSettings,
  Lead,
  GalleryItem,
} from "./types";

export * from "./types";

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

export const defaultSiteSettings: SiteSettings = {
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

function initDefaultSettings(db: SqliteDatabase) {
  const getStmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const insertStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");

  for (const [key, val] of Object.entries(defaultSiteSettings)) {
    const existing = getStmt.get(key);
    if (!existing) {
      insertStmt.run(key, JSON.stringify(val));
    }
  }
}

/**
 * Normalizes settings ensuring complete backward-compatibility and guaranteed default fallbacks
 */
export function normalizeSettings(raw: Partial<SiteSettings>): SiteSettings {
  const result: Partial<SiteSettings> = { ...raw };

  result.site_info = {
    ...defaultSiteSettings.site_info,
    ...(result.site_info || {}),
  };

  result.sections = {
    ...defaultSiteSettings.sections,
    ...(result.sections || {}),
  };

  result.social_links = {
    ...defaultSiteSettings.social_links,
    ...(result.social_links || {}),
  };

  result.tracking = {
    ...defaultSiteSettings.tracking,
    ...(result.tracking || {}),
  };

  // Normalize media structure
  const mediaRaw = result.media || defaultMedia;
  result.media = {
    ...defaultMedia,
    ...mediaRaw,
    heroSlides:
      mediaRaw.heroSlides && mediaRaw.heroSlides.length > 0
        ? mediaRaw.heroSlides
        : defaultMedia.heroSlides,
    overviewImage: mediaRaw.overviewImage?.src ? mediaRaw.overviewImage : defaultMedia.overviewImage,
    infraImage: mediaRaw.infraImage?.src ? mediaRaw.infraImage : defaultMedia.infraImage,
    masterplanImage: mediaRaw.masterplanImage || defaultMedia.masterplanImage,
    masterplanPlans:
      mediaRaw.masterplanPlans && mediaRaw.masterplanPlans.length > 0
        ? mediaRaw.masterplanPlans
        : mediaRaw.masterplanImage?.src
          ? [
              {
                id: "plan-custom",
                title: "Overall Verified Master Layout",
                subtitle: "Approved industrial park zoning and plot framework",
                description:
                  mediaRaw.masterplanImage.caption ||
                  "Approved master plan blueprint and zoning framework.",
                src: mediaRaw.masterplanImage.src,
                alt: mediaRaw.masterplanImage.alt || "Master Plan Blueprint",
                tag: "Verified Master Layout",
              },
              ...defaultMedia.masterplanPlans.slice(1),
            ]
          : defaultMedia.masterplanPlans,
    locationImage: mediaRaw.locationImage || defaultMedia.locationImage,
    galleryCategories:
      mediaRaw.galleryCategories && mediaRaw.galleryCategories.length > 0
        ? mediaRaw.galleryCategories
        : defaultMedia.galleryCategories,
    gallery: (mediaRaw.gallery && mediaRaw.gallery.length > 0
      ? mediaRaw.gallery
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
        category: (item.category ||
          defaultCats[idx % defaultCats.length]) as GalleryItem["category"],
      };
    }),
  };

  // Normalize content structure
  result.content = {
    facts:
      result.content?.facts && result.content.facts.length > 0
        ? result.content.facts
        : defaultContent.facts,
    highlights:
      result.content?.highlights && result.content.highlights.length > 0
        ? result.content.highlights
        : defaultContent.highlights,
    timeline:
      result.content?.timeline && result.content.timeline.length > 0
        ? result.content.timeline
        : defaultContent.timeline,
    faqs:
      result.content?.faqs && result.content.faqs.length > 0
        ? result.content.faqs
        : defaultContent.faqs,
  };

  // Normalize SEO structure
  result.seo = {
    ...defaultSeo,
    ...(result.seo || {}),
  };

  return result as SiteSettings;
}

/**
 * Synchronous fallback settings reader using SQLite (for backward-compatibility)
 */
export function getAllSettingsSync(): SiteSettings {
  const db = getDb();
  const stmt = db.prepare("SELECT key, value FROM settings");
  const rows = stmt.all() as Array<{ key: string; value: string }>;
  const result: Partial<SiteSettings> = {};
  for (const row of rows) {
    result[row.key as keyof SiteSettings] = JSON.parse(row.value);
  }
  return normalizeSettings(result);
}

/**
 * Reads all site settings. Uses MongoDB Atlas when MONGODB_URI is provided;
 * falls back seamlessly to SQLite for local development.
 */
export async function getAllSettings(): Promise<SiteSettings> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const settingsColl = db.collection("settings");
      const docs = await settingsColl.find({}).toArray();

      if (docs.length === 0) {
        // Seed default settings into MongoDB
        const ops = Object.entries(defaultSiteSettings).map(([key, value]) => ({
          updateOne: {
            filter: { key },
            update: { $set: { key, value } },
            upsert: true,
          },
        }));
        await settingsColl.bulkWrite(ops);
        return normalizeSettings(defaultSiteSettings);
      }

      const result: Partial<SiteSettings> = {};
      for (const doc of docs) {
        if (doc.key) {
          result[doc.key as keyof SiteSettings] = doc.value;
        }
      }
      return normalizeSettings(result);
    } catch (err) {
      console.error("MongoDB settings read failed, falling back to local SQLite:", err);
      return getAllSettingsSync();
    }
  }

  return getAllSettingsSync();
}

/**
 * Persists a setting change to MongoDB (production) or SQLite (local).
 */
export async function updateSetting(key: keyof SiteSettings, value: unknown): Promise<void> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      await db.collection("settings").updateOne(
        { key },
        { $set: { key, value, updated_at: new Date() } },
        { upsert: true }
      );
      return;
    } catch (err) {
      console.error("MongoDB settings update failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, JSON.stringify(value));
}

export type LeadInsertData = {
  name: string;
  phone: string;
  email: string;
  industry?: string;
  requirement?: string;
  message?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  status?: Lead["status"];
  notes?: string;
};

/**
 * Inserts a new lead into MongoDB or SQLite.
 */
export async function insertLead(data: LeadInsertData): Promise<{ id: number | string }> {
  const now = new Date();
  const createdAt = now.toISOString().replace("T", " ").slice(0, 19);

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      // Sequential human-readable ID via atomic counter
      const counter = await db.collection("counters").findOneAndUpdate(
        { _id: "lead_seq" as any },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      const leadId = (counter && "seq" in counter) ? (counter as any).seq : Date.now();

      await db.collection("leads").insertOne({
        lead_id: leadId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        industry: data.industry || "",
        requirement: data.requirement || "",
        message: data.message || "",
        status: data.status || "new",
        notes: data.notes || "",
        utm_source: data.utm_source || "",
        utm_medium: data.utm_medium || "",
        utm_campaign: data.utm_campaign || "",
        utm_term: data.utm_term || "",
        utm_content: data.utm_content || "",
        gclid: data.gclid || "",
        fbclid: data.fbclid || "",
        created_at: createdAt,
      });

      return { id: leadId };
    } catch (err) {
      console.error("MongoDB lead insert failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const insertStmt = db.prepare(`
    INSERT INTO leads (
      name, phone, email, industry, requirement, message,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    data.name,
    data.phone,
    data.email,
    data.industry || "",
    data.requirement || "",
    data.message || "",
    data.utm_source || "",
    data.utm_medium || "",
    data.utm_campaign || "",
    data.utm_term || "",
    data.utm_content || "",
    data.gclid || "",
    data.fbclid || "",
    data.status || "new",
    data.notes || ""
  );

  return { id: Number(result.lastInsertRowid) };
}

export type GetLeadsOptions = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  exportCsv?: boolean;
};

/**
 * Retrieves leads with search, filtering, and pagination for MongoDB or SQLite.
 */
export async function getLeads(options: GetLeadsOptions): Promise<{
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const search = options.search?.trim().toLowerCase() || "";
  const status = options.status?.trim().toLowerCase() || "";
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const filter: Record<string, unknown> = {};

      if (status && status !== "all") {
        filter.status = status;
      }

      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [
          { name: regex },
          { phone: regex },
          { email: regex },
          { industry: regex },
          { requirement: regex },
        ];
      }

      const total = await db.collection("leads").countDocuments(filter);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;

      let cursor = db.collection("leads").find(filter).sort({ lead_id: -1, _id: -1 });
      if (!options.exportCsv) {
        cursor = cursor.skip(offset).limit(limit);
      }
      const docs = await cursor.toArray();

      const leads: Lead[] = docs.map((d: any) => ({
        id: d.lead_id || d._id.toString(),
        name: d.name || "",
        phone: d.phone || "",
        email: d.email || "",
        industry: d.industry || "",
        requirement: d.requirement || "",
        message: d.message || "",
        status: (d.status as Lead["status"]) || "new",
        notes: d.notes || "",
        utm_source: d.utm_source || "",
        utm_medium: d.utm_medium || "",
        utm_campaign: d.utm_campaign || "",
        utm_term: d.utm_term || "",
        utm_content: d.utm_content || "",
        gclid: d.gclid || "",
        fbclid: d.fbclid || "",
        created_at: d.created_at || "",
      }));

      return { leads, total, page, limit, totalPages };
    } catch (err) {
      console.error("MongoDB getLeads failed, falling back to SQLite:", err);
    }
  }

  // SQLite implementation
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push(
      "(LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ? OR LOWER(industry) LIKE ? OR LOWER(requirement) LIKE ?)"
    );
    const wild = `%${search}%`;
    params.push(wild, wild, wild, wild, wild);
  }

  const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

  if (options.exportCsv) {
    const query = `SELECT * FROM leads${whereClause} ORDER BY id DESC`;
    const stmt = db.prepare(query);
    const leads = stmt.all(...params) as Lead[];
    return { leads, total: leads.length, page: 1, limit: leads.length, totalPages: 1 };
  }

  const countQuery = `SELECT COUNT(*) as total FROM leads${whereClause}`;
  const countStmt = db.prepare(countQuery);
  const total = (countStmt.get(...params) as { total: number }).total;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const offset = (page - 1) * limit;
  const dataQuery = `SELECT * FROM leads${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
  const dataStmt = db.prepare(dataQuery);
  const leads = dataStmt.all(...params, limit, offset) as Lead[];

  return { leads, total, page, limit, totalPages };
}

/**
 * Retrieves aggregate summary metrics for dashboard cards.
 */
export async function getLeadMetrics(): Promise<{
  totalLeads: number;
  newLeads: number;
  todayLeads: number;
}> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const totalLeads = await db.collection("leads").countDocuments({});
      const newLeads = await db.collection("leads").countDocuments({ status: "new" });

      const todayPrefix = new Date().toISOString().slice(0, 10);
      const todayLeads = await db.collection("leads").countDocuments({
        created_at: { $regex: `^${todayPrefix}` },
      });

      return { totalLeads, newLeads, todayLeads };
    } catch (err) {
      console.error("MongoDB getLeadMetrics failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const totalStmt = db.prepare("SELECT COUNT(*) as count FROM leads");
  const totalLeads = (totalStmt.get() as { count: number }).count;

  const newStmt = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'new'");
  const newLeads = (newStmt.get() as { count: number }).count;

  const todayStmt = db.prepare(
    "SELECT COUNT(*) as count FROM leads WHERE date(created_at) = date('now', 'localtime')"
  );
  const todayLeads = (todayStmt.get() as { count: number }).count;

  return { totalLeads, newLeads, todayLeads };
}

/**
 * Updates status or notes on a lead.
 */
export async function updateLead(
  id: number | string,
  updates: { status?: string; notes?: string }
): Promise<void> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const numId = Number(id);
      const filter: Record<string, unknown> = !isNaN(numId)
        ? { $or: [{ lead_id: numId }, { _id: id }] }
        : { _id: id };

      const setFields: Record<string, string> = {};
      if (updates.status) setFields.status = updates.status;
      if (typeof updates.notes === "string") setFields.notes = updates.notes;

      if (Object.keys(setFields).length > 0) {
        await db.collection("leads").updateOne(filter, { $set: setFields });
      }
      return;
    } catch (err) {
      console.error("MongoDB updateLead failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  if (updates.status) {
    const stmt = db.prepare("UPDATE leads SET status = ? WHERE id = ?");
    stmt.run(updates.status, id);
  }
  if (typeof updates.notes === "string") {
    const stmt = db.prepare("UPDATE leads SET notes = ? WHERE id = ?");
    stmt.run(updates.notes, id);
  }
}

/**
 * Deletes a lead by ID.
 */
export async function deleteLead(id: number | string): Promise<void> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const numId = Number(id);
      const filter: Record<string, unknown> = !isNaN(numId)
        ? { $or: [{ lead_id: numId }, { _id: id }] }
        : { _id: id };

      await db.collection("leads").deleteOne(filter);
      return;
    } catch (err) {
      console.error("MongoDB deleteLead failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const stmt = db.prepare("DELETE FROM leads WHERE id = ?");
  stmt.run(id);
}
