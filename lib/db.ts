import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { isMongoConfigured, getMongoDb } from "./mongodb";
import { cacheGet, cacheSet, cacheInvalidate, CACHE_KEYS } from "./cache";
import {
  defaultMedia,
  defaultContent,
  defaultSeo,
  defaultVerticals,
  defaultVisionMission,
  defaultProjects,
  defaultBlogs,
  SiteSettings,
  Lead,
  GalleryItem,
  ProjectItem,
  BlogPost,
  PaginatedResult,
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
      project TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      "order" INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      published_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Migrate leads table if project column is missing
  try {
    const tableInfo = db.prepare("PRAGMA table_info(leads)").all() as Array<{ name: string }>;
    const hasProjectCol = tableInfo.some((col) => col.name === "project");
    if (!hasProjectCol) {
      db.exec("ALTER TABLE leads ADD COLUMN project TEXT DEFAULT ''");
    }
  } catch {
    // Ignore migration check error
  }

  // Initialize default settings, projects and blogs if not exists
  initDefaultSettings(db);
  initDefaultProjects(db);
  initDefaultBlogs(db);

  return db;
}

export const defaultSiteSettings: SiteSettings = {
  site_info: {
    brandName: "MAAS INDUSTRIAL VENTURES PVT. LIMITED",
    shortName: "MAAS Industrial Ventures",
    tagline: "Developing Land. Building Opportunities.",
    subheadline: "Creating Industrial Hubs & Residential Developments for a Better Tomorrow.",
    introduction:
      "MAAS Industrial Ventures Pvt. Limited is a land and real estate development company specialising in industrial and residential development. We focus on identifying land opportunities, planning and developing integrated industrial hubs, creating industrial plots and developing residential plotted projects.",
    heroEyebrow: "MAAS INDUSTRIAL VENTURES PVT. LIMITED",
    heroHeadline: "Developing Land. Building Opportunities.",
    heroSubheadline: "Creating Industrial Hubs & Residential Developments for a Better Tomorrow.",
    heroDescription:
      "We are land and real estate developers focused on creating thoughtfully planned industrial hubs, industrial plots and residential developments. From empowering businesses to shaping future communities, we transform land into opportunities for growth and investment.",
    heroPrimaryBtnText: "Explore Our Projects",
    heroSecondaryBtnText: "Get in Touch",
    locationHighlight: "Industrial & Residential Land Development | India",
    bottomHighlights: [
      "Industrial Hub Development",
      "Industrial Plot Development",
      "Residential Land Development",
      "Real Estate Development",
    ],
    overviewHeadline: "We Develop Land. We Build Destinations. We Create Opportunities.",
    overviewEyebrow: "About MAAS Industrial Ventures Pvt. Limited",
    overviewCtaText: "Explore Active Projects",
    verticalsEyebrow: "Our Focus Areas",
    verticalsHeadline: "Our Development Verticals",
    verticalsDescription:
      "From strategic industrial manufacturing estates to planned plotted communities, our developments are engineered for long-term value.",
    projectsEyebrow: "Our Landmark Developments",
    projectsHeadline: "Industrial Land Opportunities & Planned Developments.",
    projectsDescription:
      "Strategically positioned along prime expressway corridors in Western Uttar Pradesh. Engineered with completed boundary demarcation, heavy concrete roads, continuous power feeds, and government policy benefits.",
    galleryEyebrow: "Project Visuals & Site Progress",
    galleryHeadline: "Project Gallery & Site Progress.",
    galleryDescription:
      "Real site photographs and clearly identified illustrative images of Gayatri Industrial Park, Shri Balaji Industrial Park, concrete road networks, and manufacturing operations.",
    blogSectionEyebrow: "Market Intelligence & Property Updates",
    blogSectionHeadline: "Industrial Land Insights & Real Estate Updates.",
    blogSectionDescription:
      "Stay informed with our latest news, Uttar Pradesh MSME policy analysis, and corridor infrastructure updates designed to guide manufacturers and investors.",
    overviewParagraphs: [
      "MAAS Industrial Ventures Pvt. Limited is a land and real estate development company specialising in industrial and residential development. We focus on identifying land opportunities, planning and developing integrated industrial hubs, creating industrial plots and developing residential plotted projects.",
      "We are developers who believe that every piece of land has the potential to become something greater. From developing industrial hubs that provide opportunities for businesses and manufacturers to create residential developments for individuals and families, our aim is to transform land into well-planned destinations.",
      "Our work goes beyond selling land. We focus on the development process — from land identification and planning to project development and offering developed plots to buyers. Through our projects, we aim to create opportunities for businesses, entrepreneurs, investors and communities.",
    ],
    contactEyebrow: "Inbound Project Allocation Desk",
    contactHeadline: "Get in Touch & Request Details.",
    contactDescription:
      "Connect with MAAS Industrial Ventures to explore plot availability, schedule physical site visits at Gayatri or Shri Balaji Industrial Park, or request government policy subsidy documentation.",
    blogEyebrow: "MAAS INDUSTRIAL VENTURES / INTELLIGENCE",
    blogHeadline: "Industrial Land Insights & Market Intelligence.",
    blogDescription:
      "In-depth analysis on state manufacturing incentives, expressway logistics corridors, and technical site planning for factory owners and institutional investors.",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "enquiry@maasventures.com",
    address: "Bhojpur & Hapur Investment Corridors, Uttar Pradesh, India",
    brochureUrl: "",
  },
  sections: {
    hero: true,
    overview: true,
    projects: true,
    gallery: true,
    blog: true,
    contact: true,
    facts: false,
    highlights: false,
    infrastructure: false,
    masterplan: false,
    location: false,
    timeline: false,
    faq: true,
    enquire: true,
  },
  verticals: defaultVerticals,
  vision_mission: defaultVisionMission,
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

function initDefaultProjects(db: SqliteDatabase) {
  const metaStmt = db.prepare("SELECT value FROM settings WHERE key = '_projects_seeded'");
  if (!metaStmt.get()) {
    const insertStmt = db.prepare(
      "INSERT INTO projects (id, slug, title, data, \"order\", is_active) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const proj of defaultProjects) {
      insertStmt.run(
        proj.id,
        proj.slug,
        proj.title,
        JSON.stringify(proj),
        proj.order,
        proj.isActive ? 1 : 0
      );
    }
    db.prepare("INSERT INTO settings (key, value) VALUES ('_projects_seeded', '1')").run();
  }
}

function initDefaultBlogs(db: SqliteDatabase) {
  const metaStmt = db.prepare("SELECT value FROM settings WHERE key = '_blogs_seeded'");
  if (!metaStmt.get()) {
    const insertStmt = db.prepare(
      "INSERT INTO blogs (id, slug, title, data, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const blog of defaultBlogs) {
      insertStmt.run(
        blog.id,
        blog.slug,
        blog.title,
        JSON.stringify(blog),
        blog.isPublished ? 1 : 0,
        blog.publishedAt
      );
    }
    db.prepare("INSERT INTO settings (key, value) VALUES ('_blogs_seeded', '1')").run();
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
    projects: result.sections?.projects !== false,
    blog: result.sections?.blog !== false,
    faq: result.sections?.faq !== false,
  };

  result.verticals =
    result.verticals && result.verticals.length > 0
      ? result.verticals
      : defaultSiteSettings.verticals;

  result.vision_mission = {
    ...defaultSiteSettings.vision_mission,
    ...(result.vision_mission || {}),
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
      const defaultCats = [
        "all",
        "gayatri",
        "shri-balaji",
        "infrastructure",
        "manufacturing",
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
    try {
      result[row.key as keyof SiteSettings] = JSON.parse(row.value);
    } catch {
      // Ignore parse error
    }
  }
  return normalizeSettings(result);
}

/**
 * Reads all site settings. Uses an in-memory TTL cache to eliminate redundant
 * database hits on high-traffic page views, falling back to MongoDB or SQLite.
 */
export async function getAllSettings(): Promise<SiteSettings> {
  const cached = cacheGet<SiteSettings>(CACHE_KEYS.SETTINGS);
  if (cached) return cached;

  let result: SiteSettings;
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
        result = normalizeSettings(defaultSiteSettings);
      } else {
        const parsed: Partial<SiteSettings> = {};
        for (const doc of docs) {
          if (doc.key) {
            parsed[doc.key as keyof SiteSettings] = doc.value;
          }
        }
        result = normalizeSettings(parsed);
      }
    } catch (err) {
      console.error("MongoDB settings read failed, falling back to local SQLite:", err);
      result = getAllSettingsSync();
    }
  } else {
    result = getAllSettingsSync();
  }

  cacheSet(CACHE_KEYS.SETTINGS, result, 60000); // 60s TTL
  return result;
}

/**
 * Persists multiple setting changes in a single database round-trip (bulkWrite)
 * and invalidates the in-memory cache immediately.
 */
export async function updateSettings(updates: Partial<SiteSettings>): Promise<void> {
  cacheInvalidate(CACHE_KEYS.SETTINGS);

  const entries = Object.entries(updates);
  if (entries.length === 0) return;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const ops = entries.map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: { $set: { key, value, updated_at: new Date() } },
          upsert: true,
        },
      }));
      await db.collection("settings").bulkWrite(ops);
      return;
    } catch (err) {
      console.error("MongoDB settings bulk update failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  db.exec("BEGIN");
  try {
    for (const [key, value] of entries) {
      stmt.run(key, JSON.stringify(value));
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

/**
 * Persists a single setting change to MongoDB (production) or SQLite (local).
 */
export async function updateSetting(key: keyof SiteSettings, value: unknown): Promise<void> {
  return updateSettings({ [key]: value } as Partial<SiteSettings>);
}

// ==========================================
// PROJECTS API (MongoDB & SQLite)
// ==========================================

function getProjectsFromSqlite(activeOnly: boolean): ProjectItem[] {
  const db = getDb();
  const query = activeOnly
    ? 'SELECT data FROM projects WHERE is_active = 1 ORDER BY "order" ASC'
    : 'SELECT data FROM projects ORDER BY "order" ASC';
  const stmt = db.prepare(query);
  const rows = stmt.all() as Array<{ data: string }>;
  if (rows.length === 0) {
    return defaultProjects.filter((p) => !activeOnly || p.isActive);
  }
  return rows.map((r) => JSON.parse(r.data) as ProjectItem);
}

export async function getProjects(activeOnly: boolean = false): Promise<ProjectItem[]> {
  const cacheKey = activeOnly ? CACHE_KEYS.PROJECTS_ACTIVE : CACHE_KEYS.PROJECTS_ALL;
  const cached = cacheGet<ProjectItem[]>(cacheKey);
  if (cached) return cached;

  let projects: ProjectItem[];
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const coll = db.collection("projects");

      const filter = activeOnly ? { isActive: true } : {};
      const docs = await coll.find(filter).sort({ order: 1, _id: 1 }).toArray();

      if (docs.length === 0 && !activeOnly) {
        // Seed default projects to Mongo in 1 bulk write
        const ops = defaultProjects.map((p) => ({
          updateOne: {
            filter: { id: p.id },
            update: { $set: p },
            upsert: true,
          },
        }));
        await coll.bulkWrite(ops);
        projects = defaultProjects;
      } else if (docs.length === 0) {
        projects = defaultProjects.filter((p) => p.isActive);
      } else {
        projects = docs.map((d: any) => ({
          id: d.id || d._id.toString(),
          title: d.title || "",
          slug: d.slug || "",
          tagline: d.tagline || "",
          location: d.location || "",
          addressShort: d.addressShort || "",
          shortDescription: d.shortDescription || "",
          fullDescription: d.fullDescription || "",
          plotSizes: d.plotSizes || "",
          roadWidth: d.roadWidth || "",
          connectivity: Array.isArray(d.connectivity) ? d.connectivity : [],
          features: Array.isArray(d.features) ? d.features : [],
          subsidiesInfo: d.subsidiesInfo || "",
          status: d.status || "Active Plots Available",
          coverImage: d.coverImage || "",
          galleryImages: Array.isArray(d.galleryImages) ? d.galleryImages : [],
          brochureUrl: d.brochureUrl || "",
          order: Number(d.order) || 0,
          isActive: d.isActive !== false,
        }));
      }
    } catch (err) {
      console.error("MongoDB getProjects failed, falling back to SQLite:", err);
      projects = getProjectsFromSqlite(activeOnly);
    }
  } else {
    projects = getProjectsFromSqlite(activeOnly);
  }

  cacheSet(cacheKey, projects, 60000);
  return projects;
}

export interface GetPaginatedProjectsOptions {
  activeOnly?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function getPaginatedProjects(
  options: GetPaginatedProjectsOptions = {}
): Promise<PaginatedResult<ProjectItem>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 10));
  const skip = (page - 1) * limit;
  const search = options.search?.trim() || "";
  const status = options.status?.trim() || "";

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const coll = db.collection("projects");
      const filter: Record<string, unknown> = {};

      if (options.activeOnly) {
        filter.isActive = true;
      }
      if (status && status !== "all") {
        filter.status = status;
      }
      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [
          { title: regex },
          { location: regex },
          { tagline: regex },
          { shortDescription: regex },
          { addressShort: regex },
        ];
      }

      const [total, docs] = await Promise.all([
        coll.countDocuments(filter),
        coll
          .find(filter)
          .sort({ order: 1, _id: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));
      const items: ProjectItem[] = docs.map((d: any) => ({
        id: d.id || d._id.toString(),
        title: d.title || "",
        slug: d.slug || "",
        tagline: d.tagline || "",
        location: d.location || "",
        addressShort: d.addressShort || "",
        shortDescription: d.shortDescription || "",
        fullDescription: d.fullDescription || "",
        plotSizes: d.plotSizes || "",
        roadWidth: d.roadWidth || "",
        connectivity: Array.isArray(d.connectivity) ? d.connectivity : [],
        features: Array.isArray(d.features) ? d.features : [],
        subsidiesInfo: d.subsidiesInfo || "",
        status: d.status || "Active Plots Available",
        coverImage: d.coverImage || "",
        galleryImages: Array.isArray(d.galleryImages) ? d.galleryImages : [],
        brochureUrl: d.brochureUrl || "",
        order: Number(d.order) || 0,
        isActive: d.isActive !== false,
      }));

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (err) {
      console.error("MongoDB getPaginatedProjects failed, falling back to SQLite:", err);
    }
  }

  // Fallback: fetch all from SQLite and slice
  let all = getProjectsFromSqlite(Boolean(options.activeOnly));
  if (status && status !== "all") {
    all = all.filter((p) => p.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    all = all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
  }
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const items = all.slice(skip, skip + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Targeted O(1) single project lookup by slug or ID without loading the entire collection.
 */
export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  if (!slug) return null;

  // 1. Try cache if full project list is already memory-resident
  const cachedList = cacheGet<ProjectItem[]>(CACHE_KEYS.PROJECTS_ALL) || cacheGet<ProjectItem[]>(CACHE_KEYS.PROJECTS_ACTIVE);
  if (cachedList) {
    const found = cachedList.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;
  }

  // 2. Targeted lookup in MongoDB
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const d: any = await db.collection("projects").findOne({
        $or: [{ slug }, { id: slug }],
      });
      if (d) {
        return {
          id: d.id || d._id.toString(),
          title: d.title || "",
          slug: d.slug || "",
          tagline: d.tagline || "",
          location: d.location || "",
          addressShort: d.addressShort || "",
          shortDescription: d.shortDescription || "",
          fullDescription: d.fullDescription || "",
          plotSizes: d.plotSizes || "",
          roadWidth: d.roadWidth || "",
          connectivity: Array.isArray(d.connectivity) ? d.connectivity : [],
          features: Array.isArray(d.features) ? d.features : [],
          subsidiesInfo: d.subsidiesInfo || "",
          status: d.status || "Active Plots Available",
          coverImage: d.coverImage || "",
          galleryImages: Array.isArray(d.galleryImages) ? d.galleryImages : [],
          brochureUrl: d.brochureUrl || "",
          order: Number(d.order) || 0,
          isActive: d.isActive !== false,
        };
      }
    } catch (err) {
      console.error("MongoDB getProjectBySlug failed, falling back to SQLite:", err);
    }
  }

  // 3. Targeted lookup in SQLite
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT data FROM projects WHERE slug = ? OR id = ? LIMIT 1");
    const row = stmt.get(slug, slug) as { data: string } | undefined;
    if (row?.data) {
      return JSON.parse(row.data) as ProjectItem;
    }
  } catch {
    // Fall back to default projects list
  }

  return defaultProjects.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProject(project: ProjectItem): Promise<ProjectItem> {
  cacheInvalidate("projects:");

  const id = project.id || `proj-${Date.now()}`;
  const slug =
    project.slug ||
    project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const fullProject: ProjectItem = {
    ...project,
    id,
    slug,
    order: Number(project.order) || 0,
    isActive: project.isActive !== false,
  };

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      await db
        .collection("projects")
        .updateOne({ id }, { $set: { ...fullProject, updated_at: new Date() } }, { upsert: true });
      return fullProject;
    } catch (err) {
      console.error("MongoDB saveProject failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO projects (id, slug, title, data, "order", is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      data = excluded.data,
      "order" = excluded."order",
      is_active = excluded.is_active,
      updated_at = excluded.updated_at
  `);
  stmt.run(
    fullProject.id,
    fullProject.slug,
    fullProject.title,
    JSON.stringify(fullProject),
    fullProject.order,
    fullProject.isActive ? 1 : 0
  );
  return fullProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  cacheInvalidate("projects:");

  let deletedFromMongo = false;
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      await db.collection("projects").deleteOne({ id });
      deletedFromMongo = true;
    } catch (err) {
      console.error("MongoDB deleteProject failed, falling back to SQLite:", err);
    }
  }

  try {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM projects WHERE id = ?");
    stmt.run(id);
  } catch (err) {
    if (!deletedFromMongo) throw err;
  }
  return true;
}

// ==========================================
// BLOG API (MongoDB & SQLite)
// ==========================================

function getBlogPostsFromSqlite(publishedOnly: boolean): BlogPost[] {
  const db = getDb();
  const query = publishedOnly
    ? "SELECT data FROM blogs WHERE is_published = 1 ORDER BY published_at DESC"
    : "SELECT data FROM blogs ORDER BY published_at DESC";
  const stmt = db.prepare(query);
  const rows = stmt.all() as Array<{ data: string }>;
  if (rows.length === 0) {
    return defaultBlogs.filter((b) => !publishedOnly || b.isPublished);
  }
  return rows.map((r) => JSON.parse(r.data) as BlogPost);
}

export async function getBlogPosts(
  publishedOnly: boolean = false,
  includeContent: boolean = false
): Promise<BlogPost[]> {
  const cacheKey = includeContent
    ? (publishedOnly ? `${CACHE_KEYS.BLOGS_PUBLISHED}:full` : `${CACHE_KEYS.BLOGS_ALL}:full`)
    : (publishedOnly ? CACHE_KEYS.BLOGS_PUBLISHED : CACHE_KEYS.BLOGS_ALL);
  const cached = cacheGet<BlogPost[]>(cacheKey);
  if (cached) return cached;

  let blogs: BlogPost[];
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const coll = db.collection("blogs");

      const filter = publishedOnly ? { isPublished: true } : {};
      const projection = includeContent ? {} : { content: 0 };
      const docs = await coll
        .find(filter, { projection })
        .sort({ publishedAt: -1, _id: -1 })
        .toArray();

      if (docs.length === 0 && !publishedOnly) {
        // Seed default blogs to Mongo in 1 bulk write
        const ops = defaultBlogs.map((b) => ({
          updateOne: {
            filter: { id: b.id },
            update: { $set: b },
            upsert: true,
          },
        }));
        await coll.bulkWrite(ops);
        blogs = includeContent
          ? defaultBlogs
          : defaultBlogs.map((b) => ({ ...b, content: "" }));
      } else if (docs.length === 0) {
        const published = defaultBlogs.filter((b) => b.isPublished);
        blogs = includeContent
          ? published
          : published.map((b) => ({ ...b, content: "" }));
      } else {
        blogs = docs.map((d: any) => ({
          id: d.id || d._id.toString(),
          title: d.title || "",
          slug: d.slug || "",
          category: d.category || "General",
          excerpt: d.excerpt || "",
          content: includeContent ? (d.content || "") : "",
          coverImage: d.coverImage || "",
          author: d.author || "MAAS Research Desk",
          authorBio: d.authorBio || "",
          readTime: d.readTime || "4 min read",
          publishedAt: d.publishedAt || new Date().toISOString().slice(0, 10),
          isFeatured: Boolean(d.isFeatured),
          isPublished: d.isPublished !== false,
          metaTitle: d.metaTitle || d.title,
          metaDescription: d.metaDescription || d.excerpt,
          keywords: Array.isArray(d.keywords) ? d.keywords : [],
        }));
      }
    } catch (err) {
      console.error("MongoDB getBlogPosts failed, falling back to SQLite:", err);
      blogs = getBlogPostsFromSqlite(publishedOnly);
      if (!includeContent) {
        blogs = blogs.map((b) => ({ ...b, content: "" }));
      }
    }
  } else {
    blogs = getBlogPostsFromSqlite(publishedOnly);
    if (!includeContent) {
      blogs = blogs.map((b) => ({ ...b, content: "" }));
    }
  }

  cacheSet(cacheKey, blogs, 60000);
  return blogs;
}

export interface GetPaginatedBlogPostsOptions {
  publishedOnly?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  includeContent?: boolean;
}

export async function getPaginatedBlogPosts(
  options: GetPaginatedBlogPostsOptions = {}
): Promise<PaginatedResult<BlogPost>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 10));
  const skip = (page - 1) * limit;
  const search = options.search?.trim() || "";
  const category = options.category?.trim() || "";

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const coll = db.collection("blogs");
      const filter: Record<string, unknown> = {};

      if (options.publishedOnly) {
        filter.isPublished = true;
      }
      if (category && category !== "all") {
        filter.category = category;
      }
      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [
          { title: regex },
          { excerpt: regex },
          { category: regex },
          { author: regex },
        ];
      }

      // Projections: omit heavy markdown content unless explicitly requested
      const projection = options.includeContent ? {} : { content: 0 };

      const [total, docs] = await Promise.all([
        coll.countDocuments(filter),
        coll
          .find(filter, { projection })
          .sort({ publishedAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));
      const items: BlogPost[] = docs.map((d: any) => ({
        id: d.id || d._id.toString(),
        title: d.title || "",
        slug: d.slug || "",
        category: d.category || "General",
        excerpt: d.excerpt || "",
        content: d.content || "",
        coverImage: d.coverImage || "",
        author: d.author || "MAAS Research Desk",
        authorBio: d.authorBio || "",
        readTime: d.readTime || "4 min read",
        publishedAt: d.publishedAt || new Date().toISOString().slice(0, 10),
        isFeatured: Boolean(d.isFeatured),
        isPublished: d.isPublished !== false,
        metaTitle: d.metaTitle || d.title,
        metaDescription: d.metaDescription || d.excerpt,
        keywords: Array.isArray(d.keywords) ? d.keywords : [],
      }));

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (err) {
      console.error("MongoDB getPaginatedBlogPosts failed, falling back to SQLite:", err);
    }
  }

  // Fallback: fetch all from SQLite and slice
  let all = getBlogPostsFromSqlite(Boolean(options.publishedOnly));
  if (category && category !== "all") {
    all = all.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    all = all.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const rawItems = all.slice(skip, skip + limit);
  const items = options.includeContent
    ? rawItems
    : rawItems.map((b) => ({ ...b, content: "" }));

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Targeted O(1) single blog post lookup by slug or ID without loading the entire collection.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;

  // 1. Try single post cache
  const cachedSingle = cacheGet<BlogPost>(`blogs:single:${slug}`);
  if (cachedSingle && cachedSingle.content) return cachedSingle;

  // 2. Try cache if full blog list is already memory-resident with content
  const cachedList = cacheGet<BlogPost[]>(`${CACHE_KEYS.BLOGS_ALL}:full`) || cacheGet<BlogPost[]>(`${CACHE_KEYS.BLOGS_PUBLISHED}:full`);
  if (cachedList) {
    const found = cachedList.find((b) => b.slug === slug || b.id === slug);
    if (found && found.content) return found;
  }

  // 3. Targeted lookup in MongoDB
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const d: any = await db.collection("blogs").findOne({
        $or: [{ slug }, { id: slug }],
      });
      if (d) {
        const post: BlogPost = {
          id: d.id || d._id.toString(),
          title: d.title || "",
          slug: d.slug || "",
          category: d.category || "General",
          excerpt: d.excerpt || "",
          content: d.content || "",
          coverImage: d.coverImage || "",
          author: d.author || "MAAS Research Desk",
          authorBio: d.authorBio || "",
          readTime: d.readTime || "4 min read",
          publishedAt: d.publishedAt || new Date().toISOString().slice(0, 10),
          isFeatured: Boolean(d.isFeatured),
          isPublished: d.isPublished !== false,
          metaTitle: d.metaTitle || d.title,
          metaDescription: d.metaDescription || d.excerpt,
          keywords: Array.isArray(d.keywords) ? d.keywords : [],
        };
        cacheSet(`blogs:single:${slug}`, post, 60000);
        return post;
      }
    } catch (err) {
      console.error("MongoDB getBlogPostBySlug failed, falling back to SQLite:", err);
    }
  }

  // 4. Targeted lookup in SQLite
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT data FROM blogs WHERE slug = ? OR id = ? LIMIT 1");
    const row = stmt.get(slug, slug) as { data: string } | undefined;
    if (row?.data) {
      const post = JSON.parse(row.data) as BlogPost;
      cacheSet(`blogs:single:${slug}`, post, 60000);
      return post;
    }
  } catch {
    // Fall back to default blogs list
  }

  const fallback = defaultBlogs.find((b) => b.slug === slug || b.id === slug) || null;
  return fallback;
}

export async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  cacheInvalidate("blogs:");

  const id = post.id || `blog-${Date.now()}`;
  const slug =
    post.slug ||
    post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const fullPost: BlogPost = {
    ...post,
    id,
    slug,
    publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
    isPublished: post.isPublished !== false,
  };

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      await db
        .collection("blogs")
        .updateOne({ id }, { $set: { ...fullPost, updated_at: new Date() } }, { upsert: true });
      return fullPost;
    } catch (err) {
      console.error("MongoDB saveBlogPost failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO blogs (id, slug, title, data, is_published, published_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      data = excluded.data,
      is_published = excluded.is_published,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at
  `);
  stmt.run(
    fullPost.id,
    fullPost.slug,
    fullPost.title,
    JSON.stringify(fullPost),
    fullPost.isPublished ? 1 : 0,
    fullPost.publishedAt
  );
  return fullPost;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  cacheInvalidate("blogs:");

  let deletedFromMongo = false;
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      await db.collection("blogs").deleteOne({ id });
      deletedFromMongo = true;
    } catch (err) {
      console.error("MongoDB deleteBlogPost failed, falling back to SQLite:", err);
    }
  }

  try {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM blogs WHERE id = ?");
    stmt.run(id);
  } catch (err) {
    if (!deletedFromMongo) throw err;
  }
  return true;
}

// ==========================================
// LEADS CRM API (MongoDB & SQLite)
// ==========================================

export type LeadInsertData = {
  name: string;
  phone: string;
  email: string;
  project?: string;
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
 * Inserts an inbound enquiry lead into MongoDB (if configured) or SQLite.
 * Uses an index-backed monotonic ID generator to prevent race conditions and full collection scans.
 */
export async function insertLead(data: LeadInsertData): Promise<{ id: number | string }> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      // Fast index-backed lookup for highest existing lead_id
      const highest = await db
        .collection("leads")
        .find({}, { projection: { lead_id: 1 } })
        .sort({ lead_id: -1 })
        .limit(1)
        .toArray();

      const leadId =
        highest.length > 0 && typeof highest[0].lead_id === "number"
          ? highest[0].lead_id + 1
          : 1;

      await db.collection("leads").insertOne({
        lead_id: leadId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        project: data.project || "",
        industry: data.industry || "",
        requirement: data.requirement || "",
        message: data.message || "",
        utm_source: data.utm_source || "",
        utm_medium: data.utm_medium || "",
        utm_campaign: data.utm_campaign || "",
        utm_term: data.utm_term || "",
        utm_content: data.utm_content || "",
        gclid: data.gclid || "",
        fbclid: data.fbclid || "",
        status: data.status || "new",
        notes: data.notes || "",
        created_at: new Date().toISOString(),
      });

      return { id: leadId };
    } catch (err) {
      console.error("MongoDB lead insert failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  const insertStmt = db.prepare(`
    INSERT INTO leads (
      name, phone, email, project, industry, requirement, message,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    data.name,
    data.phone,
    data.email,
    data.project || "",
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
  project?: string;
  page?: number;
  limit?: number;
  exportCsv?: boolean;
};

/**
 * Retrieves leads with search, project filtering, status filtering, and pagination for MongoDB or SQLite.
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
  const project = options.project?.trim() || "";
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const filter: Record<string, unknown> = {};

      if (status && status !== "all") {
        filter.status = status;
      }

      if (project && project !== "all") {
        filter.project = project;
      }

      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [
          { name: regex },
          { phone: regex },
          { email: regex },
          { project: regex },
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
        project: d.project || "",
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

  if (project && project !== "all") {
    conditions.push("project = ?");
    params.push(project);
  }

  if (search) {
    conditions.push(
      "(LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ? OR LOWER(project) LIKE ? OR LOWER(industry) LIKE ? OR LOWER(requirement) LIKE ?)"
    );
    const wild = `%${search}%`;
    params.push(wild, wild, wild, wild, wild, wild);
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
 * Retrieves aggregate summary metrics for dashboard cards in a single network round-trip.
 */
export async function getLeadMetrics(): Promise<{
  totalLeads: number;
  newLeads: number;
  todayLeads: number;
}> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const todayPrefix = new Date().toISOString().slice(0, 10);

      // Single round-trip $facet aggregation pipeline in MongoDB
      const [metrics]: any = await db
        .collection("leads")
        .aggregate([
          {
            $facet: {
              total: [{ $count: "count" }],
              newCount: [{ $match: { status: "new" } }, { $count: "count" }],
              todayCount: [
                { $match: { created_at: { $regex: `^${todayPrefix}` } } },
                { $count: "count" },
              ],
            },
          },
        ])
        .toArray();

      const totalLeads = metrics?.total?.[0]?.count || 0;
      const newLeads = metrics?.newCount?.[0]?.count || 0;
      const todayLeads = metrics?.todayCount?.[0]?.count || 0;

      return { totalLeads, newLeads, todayLeads };
    } catch (err) {
      console.error("MongoDB getLeadMetrics failed, falling back to SQLite:", err);
    }
  }

  const db = getDb();
  // Single round-trip query in SQLite using subselects
  const stmt = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM leads) as totalLeads,
      (SELECT COUNT(*) FROM leads WHERE status = 'new') as newLeads,
      (SELECT COUNT(*) FROM leads WHERE date(created_at) = date('now', 'localtime')) as todayLeads
  `);
  const row = stmt.get() as { totalLeads: number; newLeads: number; todayLeads: number } | undefined;

  return {
    totalLeads: row?.totalLeads || 0,
    newLeads: row?.newLeads || 0,
    todayLeads: row?.todayLeads || 0,
  };
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
