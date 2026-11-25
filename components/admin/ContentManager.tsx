"use client";

import { useState } from "react";
import { AdminTabs, TabOption } from "@/components/admin/ui/AdminTabs";
import {
  SiteSettings,
  FactItem,
  HighlightItem,
  TimelineMilestone,
  FaqItem,
  DevelopmentVertical,
  VisionMissionPhilosophy,
  defaultContent,
  defaultVerticals,
  defaultVisionMission,
} from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";

interface CopyFieldDef {
  key: keyof SiteSettings["site_info"];
  label: string;
  placeholder: string;
  isLong?: boolean;
}

interface CopySectionDef {
  title: string;
  desc: string;
  fields: CopyFieldDef[];
}

const copySections: CopySectionDef[] = [
  {
    title: "Company Story & Overview Headings",
    desc: "Controls the eyebrow tag and call-to-action button text above the company story paragraphs.",
    fields: [
      { key: "overviewEyebrow", label: "Overview Eyebrow Tag", placeholder: "OUR EXPERTISE & DEVELOPMENT VISION" },
      { key: "overviewCtaText", label: "Overview CTA Button Label", placeholder: "Explore Industrial Verticals" },
    ],
  },
  {
    title: "Development Verticals Section",
    desc: "Controls the headline banner introducing the 4 core verticals on the homepage.",
    fields: [
      { key: "verticalsEyebrow", label: "Verticals Eyebrow", placeholder: "CORE CAPABILITIES" },
      { key: "verticalsHeadline", label: "Verticals Section Headline", placeholder: "Strategic Development Verticals" },
      { key: "verticalsDescription", label: "Verticals Summary Description", placeholder: "Delivering end-to-end industrial infrastructure and plotted township developments.", isLong: true },
    ],
  },
  {
    title: "Projects & Portfolio Section",
    desc: "Controls the header introducing Gayatri Industrial Park and Shri Balaji Industrial Park.",
    fields: [
      { key: "projectsEyebrow", label: "Projects Eyebrow", placeholder: "LANDMARK DEVELOPMENTS" },
      { key: "projectsHeadline", label: "Projects Section Headline", placeholder: "Featured Industrial Parks & Townships" },
      { key: "projectsDescription", label: "Projects Summary Description", placeholder: "Master-planned industrial hubs offering ready-to-build industrial plots.", isLong: true },
    ],
  },
  {
    title: "Gallery & Visuals Section",
    desc: "Controls the eyebrow and headline introducing the photo & infrastructure gallery.",
    fields: [
      { key: "galleryEyebrow", label: "Gallery Eyebrow", placeholder: "PROJECT GALLERY" },
      { key: "galleryHeadline", label: "Gallery Section Headline", placeholder: "On-Site Infrastructure & Progress" },
      { key: "galleryDescription", label: "Gallery Description", placeholder: "Visual evidence of broad internal roads, boundary walls, and high-cube electricity feeds.", isLong: true },
    ],
  },
  {
    title: "Blog & Editorial Previews",
    desc: "Controls the homepage blog strip and the dedicated /blog index page headlines.",
    fields: [
      { key: "blogSectionEyebrow", label: "Homepage Blog Eyebrow", placeholder: "INSIGHTS & MARKET INTELLIGENCE" },
      { key: "blogSectionHeadline", label: "Homepage Blog Headline", placeholder: "Latest News & Investment Analysis" },
      { key: "blogSectionDescription", label: "Homepage Blog Description", placeholder: "Expert perspectives on Gujarat industrial land, connectivity corridors, and policies.", isLong: true },
      { key: "blogEyebrow", label: "Blog Page Eyebrow", placeholder: "EDITORIAL STUDIO" },
      { key: "blogHeadline", label: "Blog Page Headline", placeholder: "MAAS Ventures Intelligence" },
      { key: "blogDescription", label: "Blog Page Subtitle", placeholder: "Stay informed on land acquisition, GST incentives, and industrial hub expansions.", isLong: true },
    ],
  },
  {
    title: "Contact & Enquiry Section",
    desc: "Controls the lead capture banner at the bottom of the homepage.",
    fields: [
      { key: "contactEyebrow", label: "Contact Eyebrow", placeholder: "DIRECT DEVELOPER ADVISORY" },
      { key: "contactHeadline", label: "Contact Section Headline", placeholder: "Schedule a Site Visit or Request Investor Kit" },
      { key: "contactDescription", label: "Contact Description", placeholder: "Connect with our principal land planners to evaluate unit sizes, FAR ratios, and power availability.", isLong: true },
    ],
  },
];

interface ContentManagerProps {
  settings: SiteSettings;
  onUpdate: (patch: Partial<SiteSettings>) => Promise<void>;
}

export function ContentManager({ settings, onUpdate }: ContentManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "hero" | "overview" | "verticals" | "vision" | "facts" | "highlights" | "faqs" | "public-copy"
  >("hero");

  // Hero & Overview local state
  const [siteInfo, setSiteInfo] = useState({ ...settings.site_info });

  // 4 Bottom highlights
  const [bottomHighlights, setBottomHighlights] = useState<string[]>(
    settings.site_info.bottomHighlights && settings.site_info.bottomHighlights.length > 0
      ? settings.site_info.bottomHighlights
      : [
          "Industrial Hub Development",
          "Industrial Plot Development",
          "Residential Land Development",
          "Real Estate Development",
        ]
  );

  // 3 Overview paragraphs
  const [overviewParagraphs, setOverviewParagraphs] = useState<string[]>(
    settings.site_info.overviewParagraphs && settings.site_info.overviewParagraphs.length > 0
      ? settings.site_info.overviewParagraphs
      : [
          "MAAS Industrial Ventures Pvt. Limited is a land and real estate development company specialising in industrial and residential development. We focus on identifying land opportunities, planning and developing integrated industrial hubs, creating industrial plots and developing residential plotted projects.",
          "We are developers who believe that every piece of land has the potential to become something greater. From developing industrial hubs that provide opportunities for businesses and manufacturers to create residential developments for individuals and families, our aim is to transform land into well-planned destinations.",
          "Our work goes beyond selling land. We focus on the development process — from land identification and planning to project development and offering developed plots to buyers. Through our projects, we aim to create opportunities for businesses, entrepreneurs, investors and communities.",
        ]
  );

  // 4 Verticals local state
  const [verticals, setVerticals] = useState<DevelopmentVertical[]>(
    settings.verticals && settings.verticals.length > 0
      ? settings.verticals
      : defaultVerticals
  );

  // Vision, Mission & Philosophy local state
  const [visionMission, setVisionMission] = useState<VisionMissionPhilosophy>(
    settings.vision_mission || defaultVisionMission
  );

  // Content strip local state
  const [facts, setFacts] = useState<FactItem[]>(
    settings.content?.facts && settings.content.facts.length > 0
      ? settings.content.facts
      : defaultContent.facts
  );

  const [highlights, setHighlights] = useState<HighlightItem[]>(
    settings.content?.highlights && settings.content.highlights.length > 0
      ? settings.content.highlights
      : defaultContent.highlights
  );

  const [timeline, setTimeline] = useState<TimelineMilestone[]>(
    settings.content?.timeline && settings.content.timeline.length > 0
      ? settings.content.timeline
      : defaultContent.timeline
  );

  const [faqs, setFaqs] = useState<FaqItem[]>(
    settings.content?.faqs && settings.content.faqs.length > 0
      ? settings.content.faqs
      : defaultContent.faqs
  );

  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  function addToast(type: "success" | "error" | "info", title: string, message?: string) {
    const id = "toast-" + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleSaveAll() {
    setSaving(true);
    try {
      await onUpdate({
        content: { facts, highlights, timeline, faqs },
        site_info: { ...siteInfo, bottomHighlights, overviewParagraphs },
        verticals,
        vision_mission: visionMission,
      });

      addToast("success", "Changes Saved Successfully", "All text, verticals, vision, and FAQs are updated live.");
    } catch (err) {
      addToast("error", "Failed to save", err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Sleek Content Studio Action Header */}
      <div
        className="admin-content-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "18px",
          marginBottom: "20px",
          borderBottom: "1px solid var(--admin-border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--admin-gold)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--admin-text-main)", margin: 0, letterSpacing: "-0.01em" }}>
              Website content
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", margin: "3px 0 0 0" }}>
              Update hero copy, company story, 4 verticals, vision, and FAQs with live previews.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-gold"
          onClick={handleSaveAll}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 22px",
            fontSize: "13.5px",
            fontWeight: 700,
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(212, 175, 55, 0.22)",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? (
            <>
              <span className="status-dot-pulse" style={{ background: "#000" }} />
              <span>Saving Changes…</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div>
        <AdminTabs
          tabs={[
            { id: "hero", label: "🌟 Hero & Highlights", count: bottomHighlights.length },
            { id: "overview", label: "🏢 Company Story" },
            { id: "verticals", label: "🏗️ 4 Verticals", count: verticals.length },
            { id: "vision", label: "🧭 Vision & Philosophy" },
            { id: "public-copy", label: "🏷️ Section Headings" },
            { id: "facts", label: "📊 Project Facts", count: facts.length },
            { id: "faqs", label: "💬 Customer FAQs", count: faqs.length },
          ]}
          activeTab={activeSubTab}
          onChange={(tabId) => setActiveSubTab(tabId as typeof activeSubTab)}
        />
      </div>

      <div style={{ marginTop: "24px" }}>
        {/* 1. HERO TAB WITH LIVE INTERACTIVE PREVIEW */}
        {activeSubTab === "hero" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Live Interactive Hero Preview Mockup */}
            <div className="admin-dark-preview"
              style={{
                background: "linear-gradient(180deg, #131c2d 0%, #0c121e 100%)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                borderRadius: "12px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", fontWeight: 700, color: "var(--admin-gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--admin-gold)", display: "inline-block", boxShadow: "0 0 8px var(--admin-gold)" }} />
                  Live Hero Preview (Homepage View)
                </div>
                <span style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>Updates in real-time as you type</span>
              </div>

              {/* Eyebrow Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  color: "var(--admin-gold)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "8px" }}>●</span>
                <span>{siteInfo.heroEyebrow || "MAAS INDUSTRIAL VENTURES PVT. LIMITED"}</span>
              </div>

              {/* Headline H1 */}
              <h3
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  fontFamily: "serif",
                  color: "#ffffff",
                  lineHeight: 1.15,
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                {siteInfo.heroHeadline || "Developing Land. Building Opportunities."}
              </h3>

              {/* Subheadline */}
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-gold)", lineHeight: 1.35, margin: "0 0 10px 0" }}>
                {siteInfo.heroSubheadline || "Creating Industrial Hubs & Residential Developments for a Better Tomorrow."}
              </p>

              {/* Body Description */}
              <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.55, margin: "0 0 18px 0", maxWidth: "750px" }}>
                {siteInfo.heroDescription || "We are land and real estate developers focused on creating thoughtfully planned industrial hubs..."}
              </p>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
                <span
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, #d4af37, #aa7a38)",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "12.5px",
                  }}
                >
                  {siteInfo.heroPrimaryBtnText || "Explore Our Projects"} ↗
                </span>
                <span
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12.5px",
                  }}
                >
                  {siteInfo.heroSecondaryBtnText || "Get in Touch"} →
                </span>
              </div>

              {/* 4 Bottom Glance Pills Preview */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "8px",
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {bottomHighlights.map((hl, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(0, 0, 0, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      color: "var(--admin-text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ color: "var(--admin-gold)", fontWeight: 700 }}>0{i + 1}</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Form Cards */}
            {/* Card 1: Headline & Narrative Copy */}
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✍️</span>
                <span>Headline &amp; Hero Story</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 16px 0" }}>
                Primary typography appearing above the fold on the homepage.
              </p>

              <div className="admin-form-grid" style={{ gap: "16px" }}>
                <div className="admin-field admin-field-full">
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                    Hero Eyebrow Tag (Top Pill Badge)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteInfo.heroEyebrow || ""}
                    onChange={(e) => setSiteInfo({ ...siteInfo, heroEyebrow: e.target.value })}
                    placeholder="e.g. MAAS INDUSTRIAL VENTURES PVT. LIMITED"
                  />
                  <span style={{ fontSize: "11px", color: "var(--admin-text-dim)", marginTop: "3px" }}>
                    Shown inside the gold pill badge at the very top of the hero banner.
                  </span>
                </div>

                <div className="admin-field admin-field-full">
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                    Main Headline (H1 Serif)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteInfo.heroHeadline || ""}
                    onChange={(e) => setSiteInfo({ ...siteInfo, heroHeadline: e.target.value })}
                    placeholder="e.g. Developing Land. Building Opportunities."
                  />
                </div>

                <div className="admin-field admin-field-full">
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                    Hero Subheadline (Gold Accent)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteInfo.heroSubheadline || ""}
                    onChange={(e) => setSiteInfo({ ...siteInfo, heroSubheadline: e.target.value })}
                    placeholder="e.g. Creating Industrial Hubs & Residential Developments for a Better Tomorrow."
                  />
                </div>

                <div className="admin-field admin-field-full">
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                    Hero Body Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    value={siteInfo.heroDescription || ""}
                    onChange={(e) => setSiteInfo({ ...siteInfo, heroDescription: e.target.value })}
                    placeholder="Comprehensive introductory paragraph explaining your company mission..."
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Call to Action Buttons */}
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔘</span>
                <span>Call to Action Button Labels</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 16px 0" }}>
                Labels for the primary action button (jumps to Projects) and secondary button (opens Contact/Enquiry).
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div className="admin-field">
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                    Primary Button Label (Gold Fill)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteInfo.heroPrimaryBtnText || "Explore Our Projects"}
                    onChange={(e) => setSiteInfo({ ...siteInfo, heroPrimaryBtnText: e.target.value })}
                    placeholder="Explore Our Projects"
                  />
                </div>

                <div className="admin-field">
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                    Secondary Button Label (Outline)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteInfo.heroSecondaryBtnText || "Get in Touch"}
                    onChange={(e) => setSiteInfo({ ...siteInfo, heroSecondaryBtnText: e.target.value })}
                    placeholder="Get in Touch"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Location Bar & Glance Highlight Pills */}
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📌</span>
                <span>Location Bar &amp; Glance Highlight Pills</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 16px 0" }}>
                The 4 quick-glance service pills and location badge pinned beneath the hero banner.
              </p>

              <div className="admin-field admin-field-full" style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                  Location Pin Tag
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={siteInfo.locationHighlight || "Industrial & Residential Land Development | India"}
                  onChange={(e) => setSiteInfo({ ...siteInfo, locationHighlight: e.target.value })}
                  placeholder="e.g. Industrial & Residential Land Development | India"
                />
              </div>

              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "8px", display: "block" }}>
                Bottom 4 Highlight Pills
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
                {bottomHighlights.map((hl, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--admin-gold)",
                        padding: "3px 7px",
                        background: "rgba(212, 175, 55, 0.12)",
                        borderRadius: "4px",
                        flexShrink: 0,
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <input
                      type="text"
                      className="admin-input"
                      value={hl}
                      style={{ padding: "6px 10px", fontSize: "12.5px" }}
                      onChange={(e) => {
                        const next = [...bottomHighlights];
                        next[idx] = e.target.value;
                        setBottomHighlights(next);
                      }}
                    />
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ padding: "6px 10px", flexShrink: 0 }}
                      onClick={() => setBottomHighlights(bottomHighlights.filter((_, i) => i !== idx))}
                      title="Remove highlight"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {bottomHighlights.length < 6 && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setBottomHighlights([...bottomHighlights, "New Development Highlight"])}
                >
                  <span>+</span>
                  <span>Add Highlight Pill</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. OVERVIEW TAB */}
        {activeSubTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📖</span>
                <span>Company Story Headline &amp; Narrative</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 16px 0" }}>
                The core company proposition narrative explaining MAAS Industrial Ventures&apos; track record and mission.
              </p>

              <div className="admin-field admin-field-full" style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px" }}>
                  Overview Section Headline
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={siteInfo.overviewHeadline || "We Develop Land. We Build Destinations. We Create Opportunities."}
                  onChange={(e) => setSiteInfo({ ...siteInfo, overviewHeadline: e.target.value })}
                  placeholder="e.g. We Develop Land. We Build Destinations. We Create Opportunities."
                />
              </div>

              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "8px", display: "block" }}>
                Narrative Paragraphs (Official Corporate Profile)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {overviewParagraphs.map((para, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "14px 16px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Paragraph 0{idx + 1}
                      </span>
                      {overviewParagraphs.length > 1 && (
                        <button
                          type="button"
                          className="btn-danger"
                          style={{ padding: "3px 8px", fontSize: "11px" }}
                          onClick={() => setOverviewParagraphs(overviewParagraphs.filter((_, i) => i !== idx))}
                          title="Remove paragraph"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={para}
                      onChange={(e) => {
                        const next = [...overviewParagraphs];
                        next[idx] = e.target.value;
                        setOverviewParagraphs(next);
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setOverviewParagraphs([...overviewParagraphs, "New company overview paragraph detailing expansion, zoning compliance, or client benefits."])}
              >
                <span>+</span>
                <span>Add Story Paragraph</span>
              </button>
            </div>
          </div>
        )}

        {activeSubTab === "public-copy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {copySections.map((sec, secIdx) => (
              <div
                key={secIdx}
                className="admin-card-inner"
                style={{
                  padding: "20px",
                  background: "var(--admin-bg-card-subtle)",
                  borderRadius: "10px",
                  border: "1px solid var(--admin-border-subtle)",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0" }}>
                    {sec.title}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", margin: 0 }}>
                    {sec.desc}
                  </p>
                </div>

                <div className="admin-form-grid" style={{ gap: "14px" }}>
                  {sec.fields.map((f) => (
                    <div className="admin-field admin-field-full" key={String(f.key)}>
                      <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "6px", display: "block" }}>
                        {f.label}
                      </label>
                      {f.isLong ? (
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={String(siteInfo[f.key] || "")}
                          onChange={(e) => setSiteInfo({ ...siteInfo, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                        />
                      ) : (
                        <input
                          type="text"
                          className="admin-input"
                          value={String(siteInfo[f.key] || "")}
                          onChange={(e) => setSiteInfo({ ...siteInfo, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. VERTICALS TAB */}
        {activeSubTab === "verticals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🏗️</span>
                <span>4 Core Development Verticals</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 18px 0" }}>
                The 4 operational pillars displayed in the interactive grid on the homepage.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {verticals.map((vert, idx) => (
                  <div
                    key={vert.id || idx}
                    style={{
                      padding: "16px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-gold)", padding: "3px 8px", background: "rgba(212, 175, 55, 0.12)", borderRadius: "4px" }}>
                        VERTICAL 0{idx + 1}
                      </span>
                      <input
                        type="text"
                        className="admin-input"
                        value={vert.tag || "Vertical"}
                        style={{ width: "150px", padding: "4px 8px", fontSize: "11.5px" }}
                        placeholder="Tag e.g. Industrial Hubs"
                        onChange={(e) => {
                          const next = [...verticals];
                          next[idx] = { ...vert, tag: e.target.value };
                          setVerticals(next);
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px", display: "block" }}>
                        Vertical Title
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={vert.title}
                        onChange={(e) => {
                          const next = [...verticals];
                          next[idx] = { ...vert, title: e.target.value };
                          setVerticals(next);
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px", display: "block" }}>
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="admin-textarea"
                        value={vert.description}
                        onChange={(e) => {
                          const next = [...verticals];
                          next[idx] = { ...vert, description: e.target.value };
                          setVerticals(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. VISION & MISSION TAB */}
        {activeSubTab === "vision" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            <div
              className="admin-card-inner"
              style={{
                padding: "20px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🎯</span>
                <span>Our Vision</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 12px 0" }}>
                Long-term development aspiration.
              </p>
              <textarea
                rows={4}
                className="admin-textarea"
                value={visionMission.vision}
                onChange={(e) => setVisionMission({ ...visionMission, vision: e.target.value })}
              />
            </div>

            <div
              className="admin-card-inner"
              style={{
                padding: "20px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🚀</span>
                <span>Our Mission</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 12px 0" }}>
                Day-to-day operational commitment.
              </p>
              <textarea
                rows={4}
                className="admin-textarea"
                value={visionMission.mission}
                onChange={(e) => setVisionMission({ ...visionMission, mission: e.target.value })}
              />
            </div>

            <div
              className="admin-card-inner"
              style={{
                padding: "20px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
                gridColumn: "1 / -1",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🧭</span>
                <span>Our Development Philosophy</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 14px 0" }}>
                Core guiding philosophy governing land acquisition and township planning.
              </p>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px", display: "block" }}>
                  Philosophy Headline
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={visionMission.philosophyTitle}
                  onChange={(e) => setVisionMission({ ...visionMission, philosophyTitle: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px", display: "block" }}>
                  Philosophy Narrative
                </label>
                <textarea
                  rows={3}
                  className="admin-textarea"
                  value={visionMission.philosophyText}
                  onChange={(e) => setVisionMission({ ...visionMission, philosophyText: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. FACTS STRIP TAB */}
        {activeSubTab === "facts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📊</span>
                <span>Project Facts Summary Strip</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 18px 0" }}>
                The key metrics displayed in the horizontal summary bar below the hero (e.g. 150+ Acres, 45m Road).
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                {facts.map((fact, idx) => (
                  <div
                    key={fact.id || idx}
                    style={{
                      padding: "14px 16px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-gold)" }}>
                        METRIC #{idx + 1}
                      </span>
                      {facts.length > 1 && (
                        <button
                          type="button"
                          className="btn-danger"
                          style={{ padding: "2px 7px", fontSize: "11px" }}
                          onClick={() => setFacts(facts.filter((_, i) => i !== idx))}
                          title="Remove metric"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <label style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", display: "block", marginBottom: "2px" }}>
                          Label / Specification
                        </label>
                        <input
                          type="text"
                          className="admin-input"
                          value={fact.label}
                          onChange={(e) => {
                            const next = [...facts];
                            next[idx] = { ...fact, label: e.target.value };
                            setFacts(next);
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", display: "block", marginBottom: "2px" }}>
                          Value / Magnitude
                        </label>
                        <input
                          type="text"
                          className="admin-input"
                          value={fact.value}
                          onChange={(e) => {
                            const next = [...facts];
                            next[idx] = { ...fact, value: e.target.value };
                            setFacts(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setFacts([...facts, { id: `fact-${Date.now()}`, label: "Parameter", value: "Value" }])}
              >
                <span>+</span>
                <span>Add Project Fact</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. FAQS TAB */}
        {activeSubTab === "faqs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              className="admin-card-inner"
              style={{
                padding: "22px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💬</span>
                <span>Customer Frequently Asked Questions (FAQ)</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 18px 0" }}>
                The interactive accordions answering buyer questions on permissions, sizing, utilities, and pricing.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {faqs.map((faq, idx) => (
                  <div
                    key={faq.id || idx}
                    style={{
                      padding: "16px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-gold)" }}>
                        QUESTION 0{idx + 1}
                      </span>
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: "3px 8px", fontSize: "11px" }}
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        title="Remove question"
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px", display: "block" }}>
                          Question Text
                        </label>
                        <input
                          type="text"
                          className="admin-input"
                          value={faq.question}
                          onChange={(e) => {
                            const next = [...faqs];
                            next[idx] = { ...faq, question: e.target.value };
                            setFaqs(next);
                          }}
                          placeholder="e.g. What plot sizes are available?"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", marginBottom: "4px", display: "block" }}>
                          Detailed Answer
                        </label>
                        <textarea
                          rows={3}
                          className="admin-textarea"
                          value={faq.answer}
                          onChange={(e) => {
                            const next = [...faqs];
                            next[idx] = { ...faq, answer: e.target.value };
                            setFaqs(next);
                          }}
                          placeholder="Answer explanation..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setFaqs([...faqs, { id: `faq-${Date.now()}`, question: "New Question?", answer: "Answer description." }])}
              >
                <span>+</span>
                <span>Add FAQ Item</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
