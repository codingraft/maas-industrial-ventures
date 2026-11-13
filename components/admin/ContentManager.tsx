"use client";

import { useState } from "react";
import { SiteSettings, FactItem, HighlightItem, TimelineMilestone, FaqItem, defaultContent } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";

interface ContentManagerProps {
  settings: SiteSettings;
  onUpdate: (updatedContent: SiteSettings["content"]) => Promise<void>;
}

export function ContentManager({ settings, onUpdate }: ContentManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"facts" | "highlights" | "timeline" | "faqs">("facts");
  
  // Local state initialized with fallback to defaultContent
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

  // --- SAVE HANDLER ---
  async function handleSaveAll() {
    setSaving(true);
    try {
      await onUpdate({
        facts,
        highlights,
        timeline,
        faqs,
      });
      addToast("success", "Content saved successfully", "Homepage facts, highlights, timeline, and FAQs have been updated.");
    } catch (err) {
      addToast("error", "Failed to save content", err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  // --- FACTS HANDLERS ---
  function handleAddFact() {
    const newFact: FactItem = {
      id: "fact-" + Date.now(),
      label: "New Parameter",
      value: "Specification Value",
    };
    setFacts([...facts, newFact]);
  }

  function handleUpdateFact(id: string, field: "label" | "value", val: string) {
    setFacts(facts.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  }

  function handleDeleteFact(id: string) {
    if (facts.length <= 1) {
      addToast("error", "Cannot remove fact", "You must keep at least one key fact in the strip.");
      return;
    }
    setFacts(facts.filter((f) => f.id !== id));
  }

  // --- HIGHLIGHTS HANDLERS ---
  function handleAddHighlight() {
    const nextIdx = (highlights.length + 1).toString().padStart(2, "0");
    const newHl: HighlightItem = {
      id: "hl-" + Date.now(),
      index: nextIdx,
      title: "New Technical Specification",
      value: "Standard Dimension / Capacity",
      note: "Engineering verification details",
    };
    setHighlights([...highlights, newHl]);
  }

  function handleUpdateHighlight(id: string, field: keyof HighlightItem, val: string) {
    setHighlights(highlights.map((h) => (h.id === id ? { ...h, [field]: val } : h)));
  }

  function handleDeleteHighlight(id: string) {
    if (highlights.length <= 1) {
      addToast("error", "Cannot remove highlight", "You must keep at least one technical highlight.");
      return;
    }
    setHighlights(highlights.filter((h) => h.id !== id));
  }

  // --- TIMELINE HANDLERS ---
  function handleAddTimeline() {
    const nextNum = (timeline.length + 1).toString().padStart(2, "0");
    const newTm: TimelineMilestone = {
      id: "tm-" + Date.now(),
      phase: `PHASE ${nextNum} / MILESTONE`,
      title: "New Development Milestone",
      description: "Milestone completion scope, approvals, and physical site handover.",
    };
    setTimeline([...timeline, newTm]);
  }

  function handleUpdateTimeline(id: string, field: keyof TimelineMilestone, val: string) {
    setTimeline(timeline.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  }

  function handleDeleteTimeline(id: string) {
    if (timeline.length <= 1) {
      addToast("error", "Cannot remove phase", "You must keep at least one development milestone.");
      return;
    }
    setTimeline(timeline.filter((t) => t.id !== id));
  }

  // --- FAQS HANDLERS ---
  function handleAddFaq() {
    const newFaq: FaqItem = {
      id: "faq-" + Date.now(),
      question: "What are the infrastructure specifications?",
      answer: "Dedicated HT dual power lines, high-cube structural clear heights, heavy freight arterial roads, and clear statutory titles.",
    };
    setFaqs([...faqs, newFaq]);
  }

  function handleUpdateFaq(id: string, field: "question" | "answer", val: string) {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  }

  function handleMoveFaq(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    const nextFaqs = [...faqs];
    const [moved] = nextFaqs.splice(index, 1);
    nextFaqs.splice(targetIndex, 0, moved);
    setFaqs(nextFaqs);
  }

  function handleDeleteFaq(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete FAQ Item",
      message: "Are you sure you want to delete this FAQ question and answer?",
      action: () => {
        setFaqs(faqs.filter((f) => f.id !== id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast("info", "FAQ removed", "Click Save Changes to commit this change.");
      },
    });
  }

  return (
    <div className="admin-content-studio">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="admin-card">
        <div className="admin-card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="admin-card-title">Township Content &amp; FAQs Studio</h3>
            <p className="admin-card-desc">
              Manage key project facts, substance data highlights, phased development timeline, and customer FAQs displayed on the homepage.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSaveAll}
            disabled={saving}
            style={{ minWidth: "150px" }}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="content-studio-tabs">
          <button
            type="button"
            className={`content-subtab-btn ${activeSubTab === "facts" ? "is-active" : ""}`}
            onClick={() => setActiveSubTab("facts")}
          >
            Project Facts Strip ({facts.length})
          </button>
          <button
            type="button"
            className={`content-subtab-btn ${activeSubTab === "highlights" ? "is-active" : ""}`}
            onClick={() => setActiveSubTab("highlights")}
          >
            Data &amp; Highlights ({highlights.length})
          </button>
          <button
            type="button"
            className={`content-subtab-btn ${activeSubTab === "timeline" ? "is-active" : ""}`}
            onClick={() => setActiveSubTab("timeline")}
          >
            Phased Milestones ({timeline.length})
          </button>
          <button
            type="button"
            className={`content-subtab-btn ${activeSubTab === "faqs" ? "is-active" : ""}`}
            onClick={() => setActiveSubTab("faqs")}
          >
            Customer FAQs ({faqs.length})
          </button>
        </div>

        {/* 1. FACTS STRIP */}
        {activeSubTab === "facts" && (
          <div className="content-subtab-pane">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-text-muted)" }}>
                These 4 glance metrics appear directly beneath the hero slider to build instant credibility with visitors.
              </p>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleAddFact}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                + Add Fact
              </button>
            </div>

            {facts.map((fact, idx) => (
              <div key={fact.id} className="content-item-card">
                <div className="content-item-header">
                  <span className="content-item-badge">Fact #{idx + 1}</span>
                  <div className="content-item-actions">
                    <button
                      type="button"
                      className="content-icon-btn is-danger"
                      onClick={() => handleDeleteFact(fact.id)}
                      title="Remove fact"
                      aria-label="Remove fact"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="content-grid-2col">
                  <div className="admin-input-group">
                    <label className="admin-input-label">Label (Category)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={fact.label}
                      onChange={(e) => handleUpdateFact(fact.id, "label", e.target.value)}
                      placeholder="e.g. Development Zone"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Value (Bold Highlight)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={fact.value}
                      onChange={(e) => handleUpdateFact(fact.id, "value", e.target.value)}
                      placeholder="e.g. Master Industrial Park"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. HIGHLIGHTS & SUBSTANCE */}
        {activeSubTab === "highlights" && (
          <div className="content-subtab-pane">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-text-muted)" }}>
                Technical data points showcased in &quot;Substance before superlatives&quot; section for institutional investors.
              </p>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleAddHighlight}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                + Add Highlight
              </button>
            </div>

            {highlights.map((hl) => (
              <div key={hl.id} className="content-item-card">
                <div className="content-item-header">
                  <span className="content-item-badge">Index {hl.index} · {hl.title}</span>
                  <div className="content-item-actions">
                    <button
                      type="button"
                      className="content-icon-btn is-danger"
                      onClick={() => handleDeleteHighlight(hl.id)}
                      title="Remove highlight"
                      aria-label="Remove highlight"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="content-grid-3col">
                  <div className="admin-input-group">
                    <label className="admin-input-label">Index Code</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={hl.index}
                      onChange={(e) => handleUpdateHighlight(hl.id, "index", e.target.value)}
                      placeholder="01"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Title / Category</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={hl.title}
                      onChange={(e) => handleUpdateHighlight(hl.id, "title", e.target.value)}
                      placeholder="e.g. Zoning & Land Tenure"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Primary Metric (Bold)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={hl.value}
                      onChange={(e) => handleUpdateHighlight(hl.id, "value", e.target.value)}
                      placeholder="e.g. Freehold Industrial Title"
                    />
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: "12px" }}>
                  <label className="admin-input-label">Subnote / Engineering Verification</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={hl.note}
                    onChange={(e) => handleUpdateHighlight(hl.id, "note", e.target.value)}
                    placeholder="e.g. Verified clear commercial documentation and single-window sanction dossiers"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. TIMELINE MILESTONES */}
        {activeSubTab === "timeline" && (
          <div className="content-subtab-pane">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-text-muted)" }}>
                Phased execution milestones displayed in the &quot;Every phase with purpose&quot; section.
              </p>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleAddTimeline}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                + Add Phase Milestone
              </button>
            </div>

            {timeline.map((item) => (
              <div key={item.id} className="content-item-card">
                <div className="content-item-header">
                  <span className="content-item-badge">{item.phase}</span>
                  <div className="content-item-actions">
                    <button
                      type="button"
                      className="content-icon-btn is-danger"
                      onClick={() => handleDeleteTimeline(item.id)}
                      title="Remove milestone"
                      aria-label="Remove milestone"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="content-grid-2col">
                  <div className="admin-input-group">
                    <label className="admin-input-label">Phase Eyebrow Tag</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.phase}
                      onChange={(e) => handleUpdateTimeline(item.id, "phase", e.target.value)}
                      placeholder="e.g. PHASE 01 / ALLOCATION"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Milestone Title</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.title}
                      onChange={(e) => handleUpdateTimeline(item.id, "title", e.target.value)}
                      placeholder="e.g. Land Allotment & Civil Infrastructure"
                    />
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: "12px" }}>
                  <label className="admin-input-label">Scope Description</label>
                  <textarea
                    rows={2}
                    className="admin-input"
                    value={item.description}
                    onChange={(e) => handleUpdateTimeline(item.id, "description", e.target.value)}
                    placeholder="e.g. Plot boundaries demarcation, concrete road network completion, and boundary security deployment."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. CUSTOMER FAQS */}
        {activeSubTab === "faqs" && (
          <div className="content-subtab-pane">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-text-muted)" }}>
                Accordion questions and detailed corporate answers displayed in the &quot;Good questions come first&quot; section.
              </p>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleAddFaq}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                + Add FAQ Question
              </button>
            </div>

            {faqs.map((faq, idx) => (
              <div key={faq.id} className="content-item-card">
                <div className="content-item-header">
                  <span className="content-item-badge">Question 0{idx + 1}</span>
                  <div className="content-item-actions">
                    <button
                      type="button"
                      className="content-icon-btn"
                      onClick={() => handleMoveFaq(idx, "up")}
                      disabled={idx === 0}
                      title="Move Up"
                      aria-label="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="content-icon-btn"
                      onClick={() => handleMoveFaq(idx, "down")}
                      disabled={idx === faqs.length - 1}
                      title="Move Down"
                      aria-label="Move Down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="content-icon-btn is-danger"
                      onClick={() => handleDeleteFaq(faq.id)}
                      title="Delete question"
                      aria-label="Delete question"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="admin-input-group">
                  <label className="admin-input-label">Question</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(faq.id, "question", e.target.value)}
                    placeholder="e.g. What plot sizes and warehouse configurations are available?"
                  />
                </div>

                <div className="admin-input-group" style={{ marginTop: "12px" }}>
                  <label className="admin-input-label">Detailed Answer</label>
                  <textarea
                    rows={3}
                    className="admin-input"
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(faq.id, "answer", e.target.value)}
                    placeholder="Detailed corporate answer explaining zoning, utilities, or procedure..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSaveAll}
            disabled={saving}
            style={{ minWidth: "160px" }}
          >
            {saving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
