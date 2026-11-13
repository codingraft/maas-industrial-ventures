import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/maas.db");
const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("media");
const media = JSON.parse(row.value);

// Seed masterplanPlans with the user's uploaded master plan image as Plan 1
const userUploadedSrc = media.masterplanImage?.src || "/uploads/msss_1794562111878.webp";

media.masterplanPlans = [
  {
    id: "plan-1",
    title: "Overall Zoning & Master Layout",
    subtitle: "Macro sectoral demarcation & green buffer perimeter",
    description: "Official 150+ acre comprehensive master layout showing approved sector demarcations, green ecological buffer zones, and internal arterial spine roads.",
    src: userUploadedSrc,
    alt: "Master Plan Layout and Zoning Blueprint",
    tag: "Verified Master Layout",
  },
  {
    id: "plan-2",
    title: "Phase 1 Industrial Plot Demarcation",
    subtitle: "Modular plots from 2.5 to 25 acres with clear setbacks",
    description: "Engineered plot division matrix optimized for build-to-suit manufacturing units, standard design factories (SDF), and scalable footprint expansion.",
    src: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1600&q=85",
    alt: "Phase 1 Industrial Plot Demarcation Grid",
    tag: "Plot Demarcation Grid",
  },
  {
    id: "plan-3",
    title: "Utility Corridors & Road Circulation",
    subtitle: "45m primary arterial freight spines & 33/11kV substations",
    description: "Dedicated heavy vehicle freight transit spines, internal storm water drainage networks, underground utility trenches, and dedicated industrial substations.",
    src: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1600&q=85",
    alt: "Utility Corridors & Road Arteries",
    tag: "Infrastructure Matrix",
  },
];

media.galleryCategories = [
  { id: "manufacturing", label: "Manufacturing" },
  { id: "warehousing", label: "Warehousing" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "logistics", label: "Logistics" },
];

db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(JSON.stringify(media), "media");
console.log("Updated data/maas.db with masterplanPlans and galleryCategories!");
