"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { SeoSettings } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import { AdminTabs } from "@/components/admin/ui/AdminTabs";
import { uploadImage } from "@/lib/imageOptimizer";

interface SeoManagerProps {
  initialSeo: SeoSettings;
  onUpdate: (updated: SeoSettings) => Promise<void>;
}

export function SeoManager({ initialSeo, onUpdate }: SeoManagerProps) {
  const [seo, setSeo] = useState<SeoSettings>(initialSeo);
  const [activeSubTab, setActiveSubTab] = useState<"general" | "social" | "indexing" | "schema">("general");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app toasts & confirmation
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

  function notify(title: string, type: ToastMessage["type"] = "success", message?: string) {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(seo);
      notify("SEO & Social Metadata updated successfully!", "success");
    } catch {
      notify("Failed to save SEO settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setSeo((prev) => ({ ...prev, ogImage: url }));
      notify("Social Share (OG) image uploaded & converted to WebP successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      notify(msg, "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Length calculation & health checks
  const titleLen = seo.metaTitle.length;
  const descLen = seo.metaDescription.length;

  const isTitleOptimal = titleLen >= 40 && titleLen <= 65;
  const isDescOptimal = descLen >= 120 && descLen <= 165;

  // Schema.org sample generation
  const generatedSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: seo.ogTitle || seo.metaTitle || "MAAS Industrial Ventures",
    description: seo.metaDescription,
    url: seo.canonicalUrl || "https://maasventures.com",
    image: seo.ogImage ? [seo.ogImage] : undefined,
  };

  return (
    <div className="seo-manager-wrap">
      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Confirmation Modal */}
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

      {/* Top Header Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h2 className="admin-card-title">SEO, Meta Tags &amp; Social Share Studio</h2>
            <p className="admin-card-desc">
              Manage how MAAS Industrial Ventures ranks on Google, displays on search result pages (SERPs), and shares on WhatsApp, LinkedIn, and Facebook.
            </p>
          </div>
          <button
            type="button"
            className="btn-gold"
            onClick={() => handleSave()}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>

        {/* Sub-Tabs Navigation */}
        <div style={{ marginBottom: "20px" }}>
          <AdminTabs
            tabs={[
              { id: "general", label: "Search Engine Meta" },
              { id: "social", label: "Social Media & OpenGraph" },
              { id: "indexing", label: "Indexing & Webmasters" },
              { id: "schema", label: "Schema.org Structured Data" },
            ]}
            activeTab={activeSubTab}
            onChange={(tabId) => setActiveSubTab(tabId as typeof activeSubTab)}
          />
        </div>

        {/* =========================================================================
            TAB 1: GENERAL SEARCH ENGINE METADATA
            ========================================================================= */}
        {activeSubTab === "general" && (
          <div className="seo-tab-pane">
            {/* Live Google Search Preview Card */}
            <div className="serp-preview-box">
              <div className="serp-preview-header">
                <span className="serp-header-title">Live Google Search Result Preview</span>
                <span className="serp-tag">Google SERP Snippet</span>
              </div>
              <div className="serp-card">
                <div className="serp-url-row">
                  <span className="serp-favicon">🌐</span>
                  <div className="serp-url-texts">
                    <span className="serp-site-name">MAAS Industrial Ventures</span>
                    <span className="serp-breadcrumb-url">{seo.canonicalUrl || "https://maasventures.com"}</span>
                  </div>
                </div>
                <div className="serp-title">
                  {seo.metaTitle || "MAAS Industrial Ventures Pvt Limited | High-Capacity Industrial Infrastructure"}
                </div>
                <div className="serp-snippet">
                  {seo.metaDescription || "MAAS Industrial Ventures delivers high-capacity, infrastructure-ready industrial addresses engineered for modern manufacturing and warehousing."}
                </div>
              </div>
            </div>

            {/* Meta Title Field */}
            <div className="form-row" style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Page Title (Meta Title &lt;title&gt;)
                </label>
                <span className={`char-counter-pill ${isTitleOptimal ? "is-good" : "is-warn"}`}>
                  {titleLen}/60 characters {isTitleOptimal ? "• Optimal" : "• Recommended 45-65"}
                </span>
              </div>
              <input
                type="text"
                className="admin-input-field"
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                placeholder="e.g. MAAS Industrial Ventures Pvt Limited | High-Capacity Industrial Infrastructure"
              />
              <div className="form-help">
                Appears as the primary clickable headline in Google, Bing, and browser tabs.
              </div>
            </div>

            {/* Meta Description Field */}
            <div className="form-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Page Meta Description (&lt;meta name=&quot;description&quot;&gt;)
                </label>
                <span className={`char-counter-pill ${isDescOptimal ? "is-good" : "is-warn"}`}>
                  {descLen}/160 characters {isDescOptimal ? "• Optimal" : "• Recommended 120-160"}
                </span>
              </div>
              <textarea
                className="admin-textarea-field"
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                placeholder="Brief summary detailing industrial plots, warehouse solutions, and turnkey land allocation..."
              />
              <div className="form-help">
                Appears under the title link in search results to drive click-through rate (CTR).
              </div>
            </div>

            {/* Target Keywords Field */}
            <div className="form-row">
              <label className="form-label">Focus Target Keywords</label>
              <input
                type="text"
                className="admin-input-field"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                placeholder="industrial land, warehouse for lease, industrial plots India, logistics park"
              />
              <div className="form-help">
                Comma-separated keywords representing prime industrial and warehousing search intent.
              </div>
            </div>

            {/* Canonical URL Field */}
            <div className="form-row">
              <label className="form-label">Canonical URL</label>
              <input
                type="url"
                className="admin-input-field"
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value.trim() })}
                placeholder="https://maasventures.com"
              />
              <div className="form-help">
                Directs search engines to your authoritative domain to avoid duplicate-content penalties.
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SOCIAL MEDIA & OPENGRAPH
            ========================================================================= */}
        {activeSubTab === "social" && (
          <div className="seo-tab-pane">
            {/* Live Social Share Card Preview */}
            <div className="social-preview-box">
              <div className="serp-preview-header">
                <span className="serp-header-title">Live Social Share Preview (WhatsApp / LinkedIn / Facebook)</span>
                <span className="serp-tag">Open Graph Card</span>
              </div>
              <div className="social-share-card">
                <div className="social-card-image-wrap">
                  {seo.ogImage ? (
                    <Image
                      src={seo.ogImage}
                      alt={seo.ogTitle || "Social Preview"}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="social-card-no-image">No Image Assigned (1200 x 630 Recommended)</div>
                  )}
                </div>
                <div className="social-card-body">
                  <div className="social-card-domain">
                    {seo.canonicalUrl ? new URL(seo.canonicalUrl).hostname.toUpperCase() : "MAASVENTURES.COM"}
                  </div>
                  <div className="social-card-title">
                    {seo.ogTitle || seo.metaTitle || "MAAS Industrial Ventures"}
                  </div>
                  <div className="social-card-desc">
                    {seo.ogDescription || seo.metaDescription || "A considered industrial address for businesses planning what comes next."}
                  </div>
                </div>
              </div>
            </div>

            {/* Open Graph Title */}
            <div className="form-row" style={{ marginTop: "24px" }}>
              <label className="form-label">Open Graph (Social) Title</label>
              <input
                type="text"
                className="admin-input-field"
                value={seo.ogTitle}
                onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                placeholder="Leave blank to fallback to standard Page Meta Title"
              />
              <div className="form-help">
                Custom headline shown when link is shared in WhatsApp chats, LinkedIn feeds, and Twitter posts.
              </div>
            </div>

            {/* Open Graph Description */}
            <div className="form-row">
              <label className="form-label">Open Graph (Social) Description</label>
              <textarea
                className="admin-textarea-field"
                rows={2}
                value={seo.ogDescription}
                onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                placeholder="Leave blank to fallback to standard Page Meta Description"
              />
            </div>

            {/* Open Graph Image & Uploader */}
            <div className="form-row">
              <label className="form-label">Social Share Image (og:image)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <input
                  type="text"
                  className="admin-input-field"
                  style={{ flex: 1 }}
                  value={seo.ogImage}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  placeholder="/images/hero-1.jpg or uploaded URL"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "↑ Upload New"}
                </button>
              </div>

              {/* Quick Image Presets */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>Quick Presets:</span>
                <button
                  type="button"
                  className="btn-minimal"
                  onClick={() => setSeo({ ...seo, ogImage: "/images/hero-1.jpg" })}
                >
                  Hero Slide 1
                </button>
                <button
                  type="button"
                  className="btn-minimal"
                  onClick={() => setSeo({ ...seo, ogImage: "/images/hero-2.jpg" })}
                >
                  Hero Slide 2
                </button>
                <button
                  type="button"
                  className="btn-minimal"
                  onClick={() => setSeo({ ...seo, ogImage: "/images/masterplan.jpg" })}
                >
                  Master Plan Blueprint
                </button>
              </div>
              <div className="form-help">
                Recommended dimension: 1200 x 630 pixels (Aspect Ratio: 1.91:1) in PNG, JPG, or WebP.
              </div>
            </div>

            {/* Twitter Card Details */}
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Twitter / X Card Format</label>
                <select
                  className="filter-select"
                  style={{ width: "100%" }}
                  value={seo.twitterCard}
                  onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value as "summary" | "summary_large_image" })}
                >
                  <option value="summary_large_image">summary_large_image (High-Impact Hero Banner)</option>
                  <option value="summary">summary (Compact Square Thumbnail)</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label">Twitter / X Creator Handle</label>
                <input
                  type="text"
                  className="admin-input-field"
                  value={seo.twitterHandle}
                  onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                  placeholder="@maasventures"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: INDEXING & WEBMASTERS DIRECTIVES
            ========================================================================= */}
        {activeSubTab === "indexing" && (
          <div className="seo-tab-pane">
            <div className="form-grid-2" style={{ marginBottom: "20px" }}>
              {/* Robots Index Switch */}
              <div className="admin-switch-card">
                <div style={{ flex: 1 }}>
                  <div className="switch-card-title">Search Engine Indexing (robots: index)</div>
                  <div className="switch-card-desc">
                    {seo.robotsIndex
                      ? "Search engine bots (Googlebot, Bingbot) are permitted to index and list the site."
                      : "Site is marked 'noindex' (hidden from public search engines)."}
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={seo.robotsIndex}
                    onChange={(e) => setSeo({ ...seo, robotsIndex: e.target.checked })}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Robots Follow Switch */}
              <div className="admin-switch-card">
                <div style={{ flex: 1 }}>
                  <div className="switch-card-title">Follow Hyperlinks (robots: follow)</div>
                  <div className="switch-card-desc">
                    {seo.robotsFollow
                      ? "Search bots follow internal navigation links to crawl all township content."
                      : "Search bots are restricted from following internal links (nofollow)."}
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={seo.robotsFollow}
                    onChange={(e) => setSeo({ ...seo, robotsFollow: e.target.checked })}
                  />
                  <span className="slider round" />
                </label>
              </div>
            </div>

            {/* Google Search Console Verification */}
            <div className="form-row">
              <label className="form-label">Google Search Console Verification Token</label>
              <input
                type="text"
                className="admin-input-field"
                value={seo.googleSiteVerification}
                onChange={(e) => setSeo({ ...seo, googleSiteVerification: e.target.value.trim() })}
                placeholder="e.g. d_XXXXX-XXXXXXXXXXXXXXX or verification code"
              />
              <div className="form-help">
                Injected as <code>&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code> to verify ownership with Google.
              </div>
            </div>

            {/* Bing Webmaster Tools Verification */}
            <div className="form-row">
              <label className="form-label">Bing Webmaster Tools Verification Token</label>
              <input
                type="text"
                className="admin-input-field"
                value={seo.bingSiteVerification}
                onChange={(e) => setSeo({ ...seo, bingSiteVerification: e.target.value.trim() })}
                placeholder="e.g. 7D3XXXXXXXXXXXXXX"
              />
              <div className="form-help">
                Injected as <code>&lt;meta name=&quot;msvalidate.01&quot; content=&quot;...&quot; /&gt;</code> for Bing and Yahoo Webmaster verification.
              </div>
            </div>

            {/* Automatic Sitemap & Robots Note */}
            <div className="seo-info-callout">
              <div style={{ fontWeight: 700, color: "#f8fafc", marginBottom: "4px" }}>
                ⚡ Auto-Generated XML Sitemap &amp; Robots.txt
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                Next.js 15 automatically generates and serves your live XML Sitemap at{" "}
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--admin-gold)", textDecoration: "underline" }}
                >
                  /sitemap.xml
                </a>{" "}
                and crawler instructions at{" "}
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--admin-gold)", textDecoration: "underline" }}
                >
                  /robots.txt
                </a>
                . Both sync with your canonical domain and indexing preferences above.
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SCHEMA.ORG STRUCTURED DATA (JSON-LD)
            ========================================================================= */}
        {activeSubTab === "schema" && (
          <div className="seo-tab-pane">
            <div className="admin-switch-card" style={{ marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <div className="switch-card-title">Schema.org JSON-LD Structured Data</div>
                <div className="switch-card-desc">
                  Injects rich Google snippets metadata (&lt;script type=&quot;application/ld+json&quot;&gt;) for commercial real estate, corporate address, and industrial premises.
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={seo.structuredDataEnabled}
                  onChange={(e) => setSeo({ ...seo, structuredDataEnabled: e.target.checked })}
                />
                <span className="slider round" />
              </label>
            </div>

            {/* Live Generated JSON-LD Code Block */}
            <div className="form-row">
              <label className="form-label">Live Generated JSON-LD Snippet Preview</label>
              <pre className="schema-code-preview">
                {JSON.stringify(generatedSchema, null, 2)}
              </pre>
              <div className="form-help">
                Automatically rendered into the public homepage &lt;head&gt; when enabled to qualify for Google Rich Snippets.
              </div>
            </div>
          </div>
        )}

        {/* Sticky Save Action Footer */}
        <div style={{ marginTop: "28px", paddingTop: "18px", borderTop: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn-gold"
            onClick={() => handleSave()}
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "Save SEO Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
