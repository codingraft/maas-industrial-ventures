"use client";

import { useState } from "react";
import { getCapturedUtm } from "@/lib/utm";

interface BrochureModalProps {
  onClose: () => void;
  brochureUrl?: string;
}

export function BrochureModal({ onClose, brochureUrl }: BrochureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requirement, setRequirement] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const utmData = getCapturedUtm();

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          requirement: requirement || "Requested Project Master Plan & Brochure",
          message: "Lead submitted via Instant Brochure Download modal.",
          consent: true,
          ...utmData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit request.");
      }

      setStatus("success");

      // Trigger conversion event for Google Ads / Meta Pixel if present
      if (typeof window !== "undefined") {
        const win = window as unknown as {
          gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
          fbq?: (command: string, event: string) => void;
        };
        win.gtag?.("event", "generate_lead", { event_category: "Brochure" });
        win.fbq?.("track", "Lead");
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Submission error");
    }
  }

  return (
    <div
      className="brochure-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download Project Brochure"
    >
      <div className="brochure-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="brochure-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span style={{ fontSize: "40px" }}>✓</span>
            <h3 style={{ fontSize: "20px", color: "var(--gold)", margin: "12px 0 6px" }}>
              Brochure Unlocked!
            </h3>
            <p style={{ fontSize: "13px", color: "var(--on-dark)", marginBottom: "20px" }}>
              Thank you for your interest. Our executive team has also received your details.
            </p>
            {brochureUrl ? (
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-gold"
                style={{ width: "100%", justifyContent: "center" }}
              >
                📥 Open / Download Master Plan (PDF)
              </a>
            ) : (
              <div
                style={{
                  background: "var(--obsidian-card)",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--on-dark-muted)",
                }}
              >
                Project specifications will be transmitted to your email and WhatsApp shortly.
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "18px" }}>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                MAAS Industrial Ventures
              </span>
              <h3 style={{ margin: "6px 0 4px", fontSize: "20px", color: "var(--white)" }}>
                Request Verified Master Plan &amp; Brochure
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--on-dark-muted)" }}>
                Receive zoning layouts, power/water capacities, and commercial pricing schedules.
              </p>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: "var(--danger-dark)",
                  color: "var(--danger-light)",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  marginBottom: "14px",
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label
                    htmlFor="bm-name"
                    style={{ display: "block", fontSize: "11px", color: "var(--on-dark)", marginBottom: "4px" }}
                  >
                    Full Name *
                  </label>
                  <input
                    id="bm-name"
                    type="text"
                    className="form-control"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bm-phone"
                    style={{ display: "block", fontSize: "11px", color: "var(--on-dark)", marginBottom: "4px" }}
                  >
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="bm-phone"
                    type="tel"
                    className="form-control"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bm-email"
                    style={{ display: "block", fontSize: "11px", color: "var(--on-dark)", marginBottom: "4px" }}
                  >
                    Corporate Email *
                  </label>
                  <input
                    id="bm-email"
                    type="email"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bm-req"
                    style={{ display: "block", fontSize: "11px", color: "var(--on-dark)", marginBottom: "4px" }}
                  >
                    Required Plot Size or Industry
                  </label>
                  <input
                    id="bm-req"
                    type="text"
                    className="form-control"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. 5 Acres / Warehousing"
                  />
                </div>

                <button
                  type="submit"
                  className="button button-gold"
                  style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Processing…" : "Download Master Plan Now ➔"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
