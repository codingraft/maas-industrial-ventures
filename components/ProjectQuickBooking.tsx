"use client";

import { useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { getCapturedUtm } from "@/lib/utm";

interface ProjectQuickBookingProps {
  projectTitle: string;
  phone: string;
  whatsapp: string;
}

export function ProjectQuickBooking({
  projectTitle,
  phone,
  whatsapp,
}: ProjectQuickBookingProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cleanWa = whatsapp.replace(/\D/g, "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phoneInput = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();

    const nextErrors: Record<string, string> = {};
    const digits = phoneInput.replace(/\D/g, "");

    if (name.length < 2) {
      nextErrors.name = "Enter your full name.";
    }
    if (digits.length < 8 || digits.length > 15) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const utm = getCapturedUtm();
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phoneInput,
          email,
          project: projectTitle,
          industry: "Industrial / Enterprise Buyer",
          requirement: "Site Visit & Layout Blueprint",
          message: `Inbound site visit booking for ${projectTitle}.`,
          consent: true,
          ...utm,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.message || "Failed to submit booking. Please call our sales desk.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please call our sales desk directly.");
    }
  }

  return (
    <div className="quick-booking-card">
      <div className="booking-card-head">
        <span className="booking-status-tag">
          <span className="live-pulse-dot" /> Direct Developer Allocation
        </span>
        <h3 className="booking-card-title">Book Private Site Visit</h3>
        <p className="booking-card-sub">
          Physical site inspection of demarcated plots, road network &amp; masterplan blueprints.
        </p>
      </div>

      {status === "success" ? (
        <div className="booking-success-box" role="status">
          <div className="success-icon-wrap" aria-hidden="true">✓</div>
          <h4>Site Visit Confirmed!</h4>
          <p>
            Thank you. Our senior project lead will contact you within <strong>15 minutes</strong> to coordinate your physical site visit and share layout blueprints.
          </p>
          <div className="success-quick-actions">
            <a
              href={`https://wa.me/${cleanWa}?text=Hi,%20I%20just%20booked%20a%20site%20visit%20for%20${encodeURIComponent(projectTitle)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-wa-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Confirm on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form className="quick-booking-form" onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div className="booking-error-banner" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="booking-field">
            <label htmlFor="qb-name">Full Name</label>
            <input
              id="qb-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              aria-invalid={!!errors.name}
            />
            {errors.name && <small className="field-error-text">{errors.name}</small>}
          </div>

          <div className="booking-field">
            <label htmlFor="qb-phone">Phone / WhatsApp</label>
            <input
              id="qb-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <small className="field-error-text">{errors.phone}</small>}
          </div>

          <div className="booking-field">
            <label htmlFor="qb-email">Corporate Email</label>
            <input
              id="qb-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="rahul@company.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <small className="field-error-text">{errors.email}</small>}
          </div>

          <button
            type="submit"
            className="button button-gold booking-submit-btn"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Submitting..." : "Schedule Site Inspection"} <Arrow diagonal />
          </button>

          <p className="booking-privacy-hint">
            Direct developer desk · Zero brokerage · Immediate possession assistance
          </p>
        </form>
      )}

      {/* Direct Contact Buttons */}
      <div className="booking-contact-strip">
        <a href={`tel:${phone}`} className="booking-pill-link" title="Call Sales Hotline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{phone}</span>
        </a>

        <a
          href={`https://wa.me/${cleanWa}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(projectTitle)}.%20Please%20share%20the%20master%20layout.`}
          target="_blank"
          rel="noopener noreferrer"
          className="booking-pill-link booking-wa-pill"
          title="WhatsApp project desk"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          <span>WhatsApp Desk</span>
        </a>
      </div>

      <div className="booking-custom-scroll-hint">
        <a href="#detailed-enquiry">
          Looking for custom plot sizing or detailed tender? Fill full form ↓
        </a>
      </div>
    </div>
  );
}
