"use client";

import { useState } from "react";
import { SiteSettings } from "@/lib/types";

interface TrackingConfigProps {
  initialTracking: SiteSettings["tracking"];
  onUpdate: (updated: SiteSettings["tracking"]) => Promise<void>;
}

export function TrackingConfig({ initialTracking, onUpdate }: TrackingConfigProps) {
  const [tracking, setTracking] = useState(initialTracking);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");

    try {
      await onUpdate(tracking);
      setStatusMessage("Ad tracking tags saved successfully!");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch {
      setStatusMessage("Failed to save tracking tags.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="admin-card-title">Paid Ads Tracking & Conversion Pixels</h2>
            <p className="admin-card-desc">
              Connect Google Ads, Meta (Facebook/Instagram) Ads, and Google Tag Manager. When configured, conversion events fire automatically when leads are submitted.
            </p>
          </div>
          {statusMessage && (
            <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: 600 }}>
              {statusMessage}
            </span>
          )}
        </div>

        <div className="form-row">
          <label className="form-label">Google Tag Manager (GTM) Container ID</label>
          <input
            type="text"
            className="form-control"
            value={tracking.gtmId}
            onChange={(e) => setTracking({ ...tracking, gtmId: e.target.value.trim() })}
            placeholder="e.g. GTM-XXXXXXX"
          />
          <div className="form-help">
            Deploy conversion tags, GA4 events, and custom marketing scripts without altering source code.
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Google Ads / GA4 Measurement ID</label>
          <input
            type="text"
            className="form-control"
            value={tracking.googleAdsId}
            onChange={(e) => setTracking({ ...tracking, googleAdsId: e.target.value.trim() })}
            placeholder="e.g. AW-123456789 or G-XXXXXXXXXX"
          />
          <div className="form-help">
            Triggers a <code>generate_lead</code> / <code>conversion</code> event upon enquiry submission.
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Meta (Facebook/Instagram) Pixel ID</label>
          <input
            type="text"
            className="form-control"
            value={tracking.metaPixelId}
            onChange={(e) => setTracking({ ...tracking, metaPixelId: e.target.value.trim() })}
            placeholder="e.g. 123456789012345"
          />
          <div className="form-help">
            Triggers a standard <code>fbq(&apos;track&apos;, &apos;Lead&apos;)</code> event to optimize your ad spend toward verified leads.
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div
          style={{
            background: "#11151f",
            border: "1px solid #1e2636",
            borderRadius: "6px",
            padding: "16px",
            marginTop: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 8px", color: "#d4af37", fontSize: "13px" }}>
            🎯 Automatic Ad Campaign UTM Attribution Active
          </h4>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
            When running Google or Meta ads, include UTM parameters in your destination URLs (e.g.,{" "}
            <code>?utm_source=google&amp;utm_campaign=industrial_plots&amp;gclid=...</code>). The website automatically captures these parameters upon visit and links them to each enquiry in your Leads Hub!
          </p>
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-gold" disabled={saving}>
            {saving ? "Saving…" : "✓ Save Tracking Configuration"}
          </button>
        </div>
      </div>
    </form>
  );
}
