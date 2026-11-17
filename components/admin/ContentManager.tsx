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

const publicCopyFields = [
  ["overviewEyebrow", "Overview Eyebrow"],
  ["overviewCtaText", "Overview Project Link"],
  ["verticalsEyebrow", "Development Verticals Eyebrow"],
  ["verticalsHeadline", "Development Verticals Headline"],
  ["verticalsDescription", "Development Verticals Description"],
  ["projectsEyebrow", "Projects Eyebrow"],
  ["projectsHeadline", "Projects Headline"],
  ["projectsDescription", "Projects Description"],
  ["galleryEyebrow", "Gallery Eyebrow"],
  ["galleryHeadline", "Gallery Headline"],
  ["galleryDescription", "Gallery Description"],
  ["blogSectionEyebrow", "Homepage Blog Eyebrow"],
  ["blogSectionHeadline", "Homepage Blog Headline"],
  ["blogSectionDescription", "Homepage Blog Description"],
  ["contactEyebrow", "Contact Eyebrow"],
  ["contactHeadline", "Contact Headline"],
  ["contactDescription", "Contact Description"],
  ["blogEyebrow", "Blog Index Eyebrow"],
  ["blogHeadline", "Blog Index Headline"],
  ["blogDescription", "Blog Index Description"],
] as const;

interface ContentManagerProps {
  settings: SiteSettings;
  onUpdate: (updatedContent: SiteSettings["content"]) => Promise<void>;
  onUpdateFull?: (patch: Partial<SiteSettings>) => Promise<void>;
}

export function ContentManager({ settings, onUpdate, onUpdateFull }: ContentManagerProps) {
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
      // 1. Update Content
      await onUpdate({
        facts,
        highlights,
        timeline,
        faqs,
      });

      // 2. Update site_info, verticals, vision_mission if callback provided
      if (onUpdateFull) {
        await onUpdateFull({
          site_info: {
            ...siteInfo,
            bottomHighlights,
            overviewParagraphs,
          },
          verticals,
          vision_mission: visionMission,
        });
      } else {
        // Fallback: direct PATCH to /api/admin/settings
        await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_info: {
              ...siteInfo,
              bottomHighlights,
              overviewParagraphs,
            },
            verticals,
            vision_mission: visionMission,
          }),
        });
      }

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

      <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="admin-card-title">MAAS Content, Verticals &amp; Strategic Vision Studio</h2>
          <p className="admin-card-desc">
            Edit hero copywriting, company overview, 4 development verticals, vision/mission, facts strip, and customer FAQs.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? "Saving Changes…" : "Save All Changes"}
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div style={{ marginTop: "16px" }}>
        <AdminTabs
          tabs={[
            { id: "hero", label: "Hero & Highlights", count: bottomHighlights.length },
            { id: "overview", label: "Company Story" },
            { id: "verticals", label: "4 Verticals", count: verticals.length },
            { id: "vision", label: "Vision & Philosophy" },
            { id: "public-copy", label: "Public Copy & Headings" },
            { id: "facts", label: "Project Facts", count: facts.length },
            { id: "faqs", label: "Customer FAQs", count: faqs.length },
          ]}
          activeTab={activeSubTab}
          onChange={(tabId) => setActiveSubTab(tabId as typeof activeSubTab)}
        />
      </div>

      <div style={{ marginTop: "24px" }}>
        {/* 1. HERO TAB */}
        {activeSubTab === "hero" && (
          <div className="admin-form-grid">
            <div className="admin-field admin-field-full">
              <label>Hero Eyebrow Text</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.heroEyebrow || ""}
                onChange={(e) => setSiteInfo({ ...siteInfo, heroEyebrow: e.target.value })}
                placeholder="MAAS INDUSTRIAL VENTURES PVT. LIMITED"
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Hero Headline (H1)</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.heroHeadline || ""}
                onChange={(e) => setSiteInfo({ ...siteInfo, heroHeadline: e.target.value })}
                placeholder="Developing Land. Building Opportunities."
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Hero Subheadline</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.heroSubheadline || ""}
                onChange={(e) => setSiteInfo({ ...siteInfo, heroSubheadline: e.target.value })}
                placeholder="Creating Industrial Hubs &amp; Residential Developments for a Better Tomorrow."
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Hero Body Paragraph</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={siteInfo.heroDescription || ""}
                onChange={(e) => setSiteInfo({ ...siteInfo, heroDescription: e.target.value })}
                placeholder="We are land and real estate developers focused on creating thoughtfully planned industrial hubs..."
              />
            </div>

            <div className="admin-field">
              <label>Primary Button Text</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.heroPrimaryBtnText || "Explore Our Projects"}
                onChange={(e) => setSiteInfo({ ...siteInfo, heroPrimaryBtnText: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label>Secondary Button Text</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.heroSecondaryBtnText || "Get in Touch"}
                onChange={(e) => setSiteInfo({ ...siteInfo, heroSecondaryBtnText: e.target.value })}
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Location Highlight Tag</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.locationHighlight || "Industrial & Residential Land Development | India"}
                onChange={(e) => setSiteInfo({ ...siteInfo, locationHighlight: e.target.value })}
              />
            </div>

            {/* Bottom 4 Glance Highlights */}
            <div className="admin-field admin-field-full">
              <label>Bottom 4 Highlights (Glance pills beneath hero)</label>
              {bottomHighlights.map((hl, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    className="admin-input"
                    value={hl}
                    onChange={(e) => {
                      const next = [...bottomHighlights];
                      next[idx] = e.target.value;
                      setBottomHighlights(next);
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => setBottomHighlights(bottomHighlights.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                style={{ marginTop: "6px" }}
                onClick={() => setBottomHighlights([...bottomHighlights, "New Development Highlight"])}
              >
                + Add Highlight Pill
              </button>
            </div>
          </div>
        )}

        {/* 2. OVERVIEW TAB */}
        {activeSubTab === "overview" && (
          <div className="admin-form-grid">
            <div className="admin-field admin-field-full">
              <label>Overview Section Headline</label>
              <input
                type="text"
                className="admin-input"
                value={siteInfo.overviewHeadline || "We Develop Land. We Build Destinations. We Create Opportunities."}
                onChange={(e) => setSiteInfo({ ...siteInfo, overviewHeadline: e.target.value })}
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Overview Narrative (Paragraphs from Official PDF)</label>
              {overviewParagraphs.map((para, idx) => (
                <div key={idx} style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                    Paragraph #{idx + 1}
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
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setOverviewParagraphs([...overviewParagraphs, "New company overview paragraph."])}
              >
                + Add Overview Paragraph
              </button>
            </div>
          </div>
        )}

        {activeSubTab === "public-copy" && (
          <div className="admin-form-grid">
            {publicCopyFields.map(([key, label]) => (
              <div className="admin-field admin-field-full" key={key}>
                <label>{label}</label>
                {key.toLowerCase().includes("description") ? (
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    value={siteInfo[key] || ""}
                    onChange={(e) => setSiteInfo({ ...siteInfo, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className="admin-input"
                    value={siteInfo[key] || ""}
                    onChange={(e) => setSiteInfo({ ...siteInfo, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3. VERTICALS TAB */}
        {activeSubTab === "verticals" && (
          <div>
            <p className="admin-field-desc" style={{ marginBottom: "16px", color: "#94a3b8" }}>
              The 4 Core Development Verticals displayed in the interactive grid on the homepage.
            </p>
            {verticals.map((vert, idx) => (
              <div key={vert.id || idx} className="admin-card-inner" style={{ marginBottom: "16px", padding: "16px", background: "#171c26", borderRadius: "8px", border: "1px solid #2d3748" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontWeight: 600, color: "var(--admin-gold)" }}>VERTICAL 0{idx + 1}</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={vert.tag || "Vertical"}
                    style={{ width: "160px", padding: "4px 8px", fontSize: "12px" }}
                    placeholder="Tag e.g. Parks & Estates"
                    onChange={(e) => {
                      const next = [...verticals];
                      next[idx] = { ...vert, tag: e.target.value };
                      setVerticals(next);
                    }}
                  />
                </div>

                <div className="admin-field admin-field-full" style={{ marginBottom: "10px" }}>
                  <label>Vertical Title</label>
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

                <div className="admin-field admin-field-full">
                  <label>Vertical Description</label>
                  <textarea
                    rows={2}
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
        )}

        {/* 4. VISION & MISSION TAB */}
        {activeSubTab === "vision" && (
          <div className="admin-form-grid">
            <div className="admin-field admin-field-full">
              <label>Our Vision</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={visionMission.vision}
                onChange={(e) => setVisionMission({ ...visionMission, vision: e.target.value })}
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Our Mission</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={visionMission.mission}
                onChange={(e) => setVisionMission({ ...visionMission, mission: e.target.value })}
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Our Philosophy Headline</label>
              <input
                type="text"
                className="admin-input"
                value={visionMission.philosophyTitle}
                onChange={(e) => setVisionMission({ ...visionMission, philosophyTitle: e.target.value })}
              />
            </div>

            <div className="admin-field admin-field-full">
              <label>Our Philosophy Narrative</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={visionMission.philosophyText}
                onChange={(e) => setVisionMission({ ...visionMission, philosophyText: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* 5. FACTS STRIP TAB */}
        {activeSubTab === "facts" && (
          <div>
            {facts.map((fact, idx) => (
              <div key={fact.id || idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Label</label>
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
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Value</label>
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
                <div style={{ alignSelf: "end" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => setFacts(facts.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={() => setFacts([...facts, { id: `fact-${Date.now()}`, label: "Parameter", value: "Value" }])}
            >
              + Add Fact
            </button>
          </div>
        )}

        {/* 6. FAQS TAB */}
        {activeSubTab === "faqs" && (
          <div>
            {faqs.map((faq, idx) => (
              <div key={faq.id || idx} style={{ marginBottom: "16px", padding: "14px", background: "#171c26", borderRadius: "8px", border: "1px solid #2d3748" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong style={{ color: "#d4af37", fontSize: "13px" }}>Question #{idx + 1}</strong>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "2px 8px", fontSize: "11px" }}
                    onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  className="admin-input"
                  value={faq.question}
                  style={{ marginBottom: "8px" }}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx] = { ...faq, question: e.target.value };
                    setFaqs(next);
                  }}
                  placeholder="e.g. What plot sizes are available?"
                />
                <textarea
                  rows={2}
                  className="admin-textarea"
                  value={faq.answer}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx] = { ...faq, answer: e.target.value };
                    setFaqs(next);
                  }}
                  placeholder="Answer text here..."
                />
              </div>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={() => setFaqs([...faqs, { id: `faq-${Date.now()}`, question: "New Question?", answer: "Answer description." }])}
            >
              + Add FAQ Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
