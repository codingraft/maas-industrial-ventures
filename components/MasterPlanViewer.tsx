"use client";

import { useState } from "react";
import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";
import { MasterPlanItem } from "@/lib/types";

interface MasterPlanViewerProps {
  plans: MasterPlanItem[];
}

export function MasterPlanViewer({ plans }: MasterPlanViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!plans || plans.length === 0) return null;

  const activePlan = plans[activeIndex] || plans[0];

  return (
    <section className="masterplan section-pad" id="master-plan">
      <div className="page-wrap">
        {/* Header Section */}
        <div className="masterplan-header-wrap">
          <div className="section-label">
            <span>03</span> / The Master Plan
          </div>
          <div className="masterplan-intro-content">
            <p className="eyebrow eyebrow-light">
              <span></span> A CLEARER PICTURE STARTS HERE
            </p>
            <h2 className="masterplan-title">
              See the plan.<br />
              <em>Understand the place.</em>
            </h2>
            <p className="masterplan-lead">
              Comprehensive master layout blueprints detailing plot zoning, utility corridors, green buffers, and dedicated freight access points are shared with prospective enterprise partners.
            </p>
          </div>
        </div>

        {/* Plan Switcher Tabs (When multiple plans are configured) */}
        {plans.length > 1 && (
          <div className="masterplan-tabs-bar" role="tablist" aria-label="Master Plan Views">
            {plans.map((plan, idx) => (
              <button
                key={plan.id || idx}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                className={`masterplan-tab-pill ${idx === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(idx)}
              >
                <span className="tab-pill-num">0{idx + 1}</span>
                <span className="tab-pill-text">{plan.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Master Plan Showcase Card */}
        <div className="masterplan-showcase-card">
          {/* Blueprint Image Preview Frame */}
          <div
            className="masterplan-view-frame"
            onClick={() => setLightboxOpen(true)}
            title="Click to expand high-resolution blueprint"
          >
            <Image
              src={activePlan.src}
              alt={activePlan.alt || activePlan.title}
              fill
              loading="lazy"
              sizes="(max-width: 900px) 100vw, 60vw"
              style={{ objectFit: "contain", padding: "16px" }}
            />
            <span className="plan-tag">
              {activePlan.tag || "VERIFIED MASTER LAYOUT"}
            </span>
            <button
              type="button"
              className="masterplan-expand-hint"
              aria-label="Expand blueprint"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <span>Click to Expand High-Res Blueprint</span>
            </button>
          </div>

          {/* Blueprint Specifications & Details */}
          <div className="masterplan-details-panel">
            <div className="plan-badge-row">
              <span className="plan-active-indicator">● Active Perspective</span>
              <span className="plan-counter">View {activeIndex + 1} of {plans.length}</span>
            </div>

            <h3 className="plan-active-title">{activePlan.title}</h3>
            {activePlan.subtitle && (
              <p className="plan-active-subtitle">{activePlan.subtitle}</p>
            )}
            <p className="plan-active-desc">
              {activePlan.description ||
                "Official zoning division blueprint showing engineered internal road circulation, dedicated utility corridors, clear perimeter green buffers, and modular plot footprints."}
            </p>

            {/* Technical Zoning Metrics */}
            <div className="blueprint-specs-grid">
              <div className="blueprint-spec-item">
                <span className="spec-lbl">Land Parcel Area</span>
                <strong className="spec-val" style={{ color: "var(--white)" }}>150+ Acres Master Planned</strong>
              </div>
              <div className="blueprint-spec-item">
                <span className="spec-lbl">Permissible FAR / FSI</span>
                <strong className="spec-val" style={{ color: "var(--white)" }}>Up to 2.0 (High-Cube Ready)</strong>
              </div>
              <div className="blueprint-spec-item">
                <span className="spec-lbl">Internal Road Spines</span>
                <strong className="spec-val" style={{ color: "var(--white)" }}>45m Arterial / 30m Secondary</strong>
              </div>
              <div className="blueprint-spec-item">
                <span className="spec-lbl">Power Grid Feed</span>
                <strong className="spec-val" style={{ color: "var(--white)" }}>Dedicated 33/11 kV Substation</strong>
              </div>
              <div className="blueprint-spec-item">
                <span className="spec-lbl">Eco Perimeter Setback</span>
                <strong className="spec-val" style={{ color: "var(--white)" }}>15% Green Buffer Zone</strong>
              </div>
              <div className="blueprint-spec-item">
                <span className="spec-lbl">Zoning Compliance</span>
                <strong className="spec-val" style={{ color: "var(--white)" }}>Pre-Approved Industrial Clearances</strong>
              </div>
            </div>

            {/* Action Bar */}
            <div className="masterplan-actions-bar">
              <button
                type="button"
                className="button button-gold"
                data-enquiry-trigger
                data-enquiry-title="Request Master Plan Dossier"
                data-enquiry-req="Master Plan Blueprint & Zoning"
              >
                Request Master Plan Dossier <Arrow diagonal />
              </button>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setLightboxOpen(true)}
              >
                Inspect Layout Zoom <Arrow />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Master Plan Layout"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close presentation"
          >
            ✕
          </button>

          <figure onClick={(e) => e.stopPropagation()} style={{ height: "85vh", width: "min(1280px, 92vw)" }}>
            <Image
              src={activePlan.src}
              alt={activePlan.alt || activePlan.title}
              fill
              loading="lazy"
              sizes="95vw"
              style={{ objectFit: "contain" }}
            />
            <figcaption>
              <span className="plan-tag" style={{ position: "static", marginRight: "12px", display: "inline-block" }}>
                {activePlan.tag || "VERIFIED MASTER LAYOUT"}
              </span>
              <strong>{activePlan.title}</strong> — {activePlan.subtitle || "MAAS Industrial Ventures"}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
