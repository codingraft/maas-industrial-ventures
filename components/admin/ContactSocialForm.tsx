"use client";

import { useState } from "react";
import { SiteSettings } from "@/lib/types";

interface ContactSocialFormProps {
  initialSiteInfo: SiteSettings["site_info"];
  initialSocialLinks: SiteSettings["social_links"];
  onUpdate: (patch: Pick<SiteSettings, "site_info" | "social_links">) => Promise<void>;
}

export function ContactSocialForm({
  initialSiteInfo,
  initialSocialLinks,
  onUpdate,
}: ContactSocialFormProps) {
  const [siteInfo, setSiteInfo] = useState(initialSiteInfo);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");

    try {
      await onUpdate({ site_info: siteInfo, social_links: socialLinks });
      setStatusMessage("Contact info and social links saved successfully!");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch {
      setStatusMessage("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="admin-card-title">Corporate Contact & Physical Location</h2>
            <p className="admin-card-desc">
              These details appear in the sticky navigation header, enquiry section, footer, and floating contact widgets.
            </p>
          </div>
          {statusMessage && (
            <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: 600 }}>
              {statusMessage}
            </span>
          )}
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label">Primary Phone Number (Click-to-Call)</label>
            <input
              type="text"
              className="form-control"
              value={siteInfo.phone}
              onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
            <div className="form-help">Receives 1-tap calls from mobile ad visitors.</div>
          </div>

          <div className="form-row">
            <label className="form-label">WhatsApp Number (Floating Chat Button)</label>
            <input
              type="text"
              className="form-control"
              value={siteInfo.whatsapp}
              onChange={(e) => setSiteInfo({ ...siteInfo, whatsapp: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
            <div className="form-help">Powering high-converting 1-tap WhatsApp chat on mobile.</div>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label">Official Enquiries Email</label>
            <input
              type="email"
              className="form-control"
              value={siteInfo.email}
              onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
              placeholder="enquiry@maasventures.com"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">Brochure / Master Plan PDF Link</label>
            <input
              type="text"
              className="form-control"
              value={siteInfo.brochureUrl || ""}
              onChange={(e) => setSiteInfo({ ...siteInfo, brochureUrl: e.target.value })}
              placeholder="https://... or /brochure.pdf"
            />
            <div className="form-help">Provided to buyers upon submitting the brochure lead form.</div>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Physical Address / Project Location</label>
          <input
            type="text"
            className="form-control"
            value={siteInfo.address}
            onChange={(e) => setSiteInfo({ ...siteInfo, address: e.target.value })}
            placeholder="e.g. MAAS Industrial Township, Phase 1, National Highway 48 Corridor"
            required
          />
        </div>

        <div className="form-row">
          <label className="form-label">Executive Introduction Copy</label>
          <textarea
            className="form-control"
            rows={3}
            value={siteInfo.introduction}
            onChange={(e) => setSiteInfo({ ...siteInfo, introduction: e.target.value })}
            placeholder="A considered industrial address starts with..."
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Social Media & Corporate Profiles</h2>
          <p className="admin-card-desc">
            Direct buyers to your official verified corporate channels. Leave empty to hide the icon.
          </p>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label">LinkedIn Company Page</label>
            <input
              type="url"
              className="form-control"
              value={socialLinks.linkedin}
              onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/maas-industrial"
            />
          </div>

          <div className="form-row">
            <label className="form-label">Instagram Profile</label>
            <input
              type="url"
              className="form-control"
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              placeholder="https://instagram.com/maasindustrial"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label">Facebook Page</label>
            <input
              type="url"
              className="form-control"
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="form-row">
            <label className="form-label">X / Twitter</label>
            <input
              type="url"
              className="form-control"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              placeholder="https://x.com/..."
            />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">YouTube Channel / Video Tour</label>
          <input
            type="url"
            className="form-control"
            value={socialLinks.youtube}
            onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
            placeholder="https://youtube.com/..."
          />
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-gold" disabled={saving}>
            {saving ? "Saving Changes…" : "✓ Save All Contact & Social Information"}
          </button>
        </div>
      </div>
    </form>
  );
}
