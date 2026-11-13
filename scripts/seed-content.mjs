import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const req = createRequire(import.meta.url);
const { DatabaseSync } = req("node:sqlite");

const dbPath = path.join(process.cwd(), "data", "maas.db");
if (fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const getStmt = db.prepare("SELECT value FROM settings WHERE key = 'content'");
  const existing = getStmt.get();

  const defaultContent = {
    facts: [
      { id: "fact-1", label: "Development Zone", value: "Master Industrial Park" },
      { id: "fact-2", label: "Connectivity", value: "Direct NH Corridor Access" },
      { id: "fact-3", label: "Zoning Status", value: "Clear Industry Approvals" },
      { id: "fact-4", label: "Space Typology", value: "Plots & Built-to-Suit" },
    ],
    highlights: [
      {
        id: "hl-1",
        index: "01",
        title: "Zoning & Land Tenure",
        value: "Freehold Industrial Title",
        note: "Verified clear commercial documentation",
      },
      {
        id: "hl-2",
        index: "02",
        title: "Power Infrastructure",
        value: "Dedicated HT Dual Grid Feeders",
        note: "High-capacity uninterrupted supply",
      },
      {
        id: "hl-3",
        index: "03",
        title: "Circulation & Access",
        value: "Heavy Freight Arterial Concrete Roads",
        note: "Engineered for 40ft multi-axle freight trailers",
      },
      {
        id: "hl-4",
        index: "04",
        title: "Statutory Approvals",
        value: "Fast-Track Single Window Approvals",
        note: "Comprehensive statutory clearance dossiers",
      },
    ],
    timeline: [
      {
        id: "tm-1",
        phase: "PHASE 01 / ALLOCATION",
        title: "Land Allotment & Civil Infrastructure",
        description: "Plot boundaries demarcation, concrete road network completion, and boundary security deployment.",
      },
      {
        id: "tm-2",
        phase: "PHASE 02 / UTILITIES",
        title: "Power Substations & Water Lines",
        description: "HT electricity energization, high-capacity water connection, and telecom optical fiber laying.",
      },
      {
        id: "tm-3",
        phase: "PHASE 03 / COMMISSIONING",
        title: "Built-to-Suit Handover & Operations",
        description: "Full occupier operations commencement with dedicated park administration and security.",
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "What plot sizes and warehouse configurations are available?",
        answer: "MAAS Industrial Ventures accommodates requirements from 2-acre discrete manufacturing plots up to 50+ acre custom enterprise industrial and logistics campuses. Contact the team for the current verified availability schedule.",
      },
      {
        id: "faq-2",
        question: "Which industrial categories and zoning permissions apply?",
        answer: "Zoning accommodates clean manufacturing, engineering, heavy assembly, warehousing, cold-chain, and logistics operations with fast-track clearances. Contact us for exact classification documents.",
      },
      {
        id: "faq-3",
        question: "What power, water, and road infrastructure is delivered?",
        answer: "Direct dedicated high-tension (HT) industrial feeder lines, high-capacity dual water supplies, storm drainage, heavy-duty internal concrete arterial roads designed for multi-axle freight vehicles.",
      },
      {
        id: "faq-4",
        question: "Where is the development strategically situated?",
        answer: "Positioned along prime industrial freight corridors with direct access to national highways, dedicated freight corridors, and key cargo ports for seamless regional and global distribution.",
      },
      {
        id: "faq-5",
        question: "What regulatory approvals and title verifications are in place?",
        answer: "Clear, unencumbered freehold land titles with complete master development sanctions. Verified due-diligence dossiers and master plans are provided upon registration.",
      },
      {
        id: "faq-6",
        question: "How can I arrange a private site visit or discuss commercial terms?",
        answer: "Submit your specifications via the enquiry form, call our project desk directly, or connect via WhatsApp for an executive presentation and escorted site inspection.",
      },
    ],
  };

  if (!existing) {
    const insertStmt = db.prepare("INSERT INTO settings (key, value) VALUES ('content', ?)");
    insertStmt.run(JSON.stringify(defaultContent));
    console.log("Successfully seeded default content into settings table.");
  } else {
    console.log("Content already exists in settings table.");
  }
}
