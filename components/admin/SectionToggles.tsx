"use client";

import { useState } from "react";
import { SiteSettings } from "@/lib/types";

interface SectionTogglesProps {
  initialSections: SiteSettings["sections"];
  onUpdate: (updated: SiteSettings["sections"]) => Promise<void>;
}

export const sectionDefinitions: Array<{
  key: keyof SiteSettings["sections"];
  title: string;
  description: string;
}> = [
  {
    key: "hero",
    title: "Hero Banner & Carousel",
    description: "Main top visual carousel with slide copy, CTA buttons, and highlight pills.",
  },
  {
    key: "facts",
    title: "Project Facts Strip",
    description: "Quick-metric summary bar displaying key credentials, scale, and positioning.",
  },
  {
    key: "overview",
    title: "Overview & Company Story",
    description: "Core industrial vision statement, value proposition paragraphs, and feature photo.",
  },
  {
    key: "projects",
    title: "Projects & Landmark Developments",
    description: "Multi-project portfolio cards for Gayatri Industrial Park and Shri Balaji Industrial Park.",
  },
  {
    key: "masterplan",
    title: "Master Plan & Zoning Blueprints",
    description: "Interactive master plan layout schematics, zoning specs, and dossier request trigger.",
  },
  {
    key: "gallery",
    title: "Project & Typology Gallery",
    description: "Interactive visual lightbox gallery showcasing industrial park development and operations.",
  },
  {
    key: "blog",
    title: "Insights, News & Blog Preview Strip",
    description: "Homepage preview strip showcasing latest market reports and link to /blog.",
  },
  {
    key: "faq",
    title: "Frequently Asked Questions (FAQ)",
    description: "Expandable accordions answering buyer questions on permissions, sizing, and pricing.",
  },
  {
    key: "contact",
    title: "Contact & Lead Enquiry Section",
    description: "Homepage lead capture form, advisory contacts, and direct enquiry section.",
  },
];

export function SectionToggles({ initialSections, onUpdate }: SectionTogglesProps) {
  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleToggle(key: keyof SiteSettings["sections"]) {
    const nextVal = !sections[key];
    const next: SiteSettings["sections"] = {
      ...sections,
      [key]: nextVal,
      ...(key === "contact" ? { enquire: nextVal } : {}),
    };
    setSections(next);
    setSaving(true);
    setSaveFailed(false);
    setStatusMessage("");

    try {
      await onUpdate(next);
      setStatusMessage("Section visibility updated live!");

    } catch {
      setSections(sections);
      setSaveFailed(true);
      setStatusMessage("Could not save visibility. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = sectionDefinitions.filter(({ key }) => sections[key]).length;

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="admin-card-title">Homepage sections</h2>
          <p className="admin-card-desc">
            Turn sections ON or OFF with a single click. When turned off, the section and its navigation anchor are instantly hidden on the live website.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "5px 12px",
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--admin-success)",
            }}
          >
            {activeCount} of {sectionDefinitions.length} Sections Active
          </div>
          {statusMessage && (
            <span role={saveFailed ? "alert" : "status"} style={{ color: saveFailed ? "var(--admin-danger)" : "var(--admin-success)", fontSize: "12px", fontWeight: 600 }}>
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
        {sectionDefinitions.map((item) => {
          const isActive = !!sections[item.key];
          return (
            <div
              key={item.key}
              className="toggle-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: isActive ? "var(--admin-bg-card-subtle)" : "rgba(255, 255, 255, 0.02)",
                borderRadius: "8px",
                border: "1px solid " + (isActive ? "var(--admin-border-subtle)" : "rgba(255, 255, 255, 0.04)"),
                transition: "all 0.15s ease",
              }}
            >
              <div className="toggle-info" style={{ flex: 1, paddingRight: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--admin-text-main)" }}>
                    {item.title}
                  </h4>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: isActive ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.12)",
                      color: isActive ? "var(--admin-success)" : "var(--admin-text-muted)",
                      border: "1px solid " + (isActive ? "rgba(34, 197, 94, 0.3)" : "rgba(148, 163, 184, 0.2)"),
                    }}
                  >
                    {isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--admin-text-muted)" }}>
                  {item.description}
                </p>
              </div>

              <label className="switch" title={`Toggle ${item.title}`} style={{ flexShrink: 0 }}>
                <input
                  type="checkbox"
                  aria-label={item.title}
                  checked={isActive}
                  onChange={() => handleToggle(item.key)}
                  disabled={saving}
                />
                <span className="slider"></span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
