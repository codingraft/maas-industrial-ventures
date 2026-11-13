import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/maas.db");
const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("media");
const media = JSON.parse(row.value);

const curatedGallery = [
  {
    id: "gal-1",
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=82",
    alt: "Precision robotics and automated assembly bay",
    caption: "Precision Engineering & Robotic Manufacturing Bay",
    category: "manufacturing",
  },
  {
    id: "gal-2",
    src: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=82",
    alt: "Heavy fabrication and structural machinery floor",
    caption: "Heavy Industrial Fabrication Unit",
    category: "manufacturing",
  },
  {
    id: "gal-3",
    src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
    alt: "High-bay distribution and racking logistics terminal",
    caption: "High-Bay Distribution & Logistics Centre",
    category: "warehousing",
  },
  {
    id: "gal-4",
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=82",
    alt: "Automated warehouse pallet sorting and storage",
    caption: "Automated Pallet Storage & Dispatch Systems",
    category: "warehousing",
  },
  {
    id: "gal-5",
    src: "/uploads/wallpaperflare_com_wallpaper_1794561154734.jpg",
    alt: "MAAS industrial custom facility visual",
    caption: "Project Facility View",
    category: "warehousing",
  },
  {
    id: "gal-6",
    src: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=82",
    alt: "Multi-modal transport network and highway corridor",
    caption: "Strategic Multi-Modal Connectivity Hub",
    category: "infrastructure",
  },
  {
    id: "gal-7",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=82",
    alt: "Park administrative center and high-tension utility grid",
    caption: "Park Central Administrative Complex",
    category: "infrastructure",
  },
  {
    id: "gal-8",
    src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=82",
    alt: "Intermodal freight rail terminal and freight staging",
    caption: "Dedicated Freight Rail & Intermodal Staging Hub",
    category: "logistics",
  },
  {
    id: "gal-9",
    src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=82",
    alt: "Cross-docking bays and logistics fleet dispatch",
    caption: "High-Volume Multi-Axle Cross-Docking Terminal",
    category: "logistics",
  },
];

media.gallery = curatedGallery;
db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(JSON.stringify(media), "media");
console.log("Updated media.gallery in SQLite with 9 curated items across all 4 sectors!");
