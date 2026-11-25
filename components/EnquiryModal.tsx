"use client";

import { useState, useEffect } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { getCapturedUtm } from "@/lib/utm";

interface EnquiryModalData {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  requirement?: string;
  project?: string;
}

export function EnquiryModal() {
  const [modalData, setModalData] = useState<EnquiryModalData>({
    isOpen: false,
    title: "Register Your Requirement",
    subtitle: "Direct priority allocation and technical master documentation for enterprise investors.",
    requirement: "Industrial Land",
    project: "Gayatri Industrial Park (Bhojpur, Modinagar)",
  });

  const [selectedProject, setSelectedProject] = useState("Gayatri Industrial Park (Bhojpur, Modinagar)");
  const [selectedRequirement, setSelectedRequirement] = useState("500 to 1,000 Sq. Yards");

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync selected project and requirement when modalData updates
  useEffect(() => {
    if (modalData.project) {
      const p = modalData.project.toLowerCase();
      if (p.includes("balaji")) {
        setSelectedProject("Shri Balaji Industrial Park (Hapur-Modinagar Rd)");
      } else if (p.includes("gayatri")) {
        setSelectedProject("Gayatri Industrial Park (Bhojpur, Modinagar)");
      } else if (p.includes("residential")) {
        setSelectedProject("Residential Plotted Developments");
      } else {
        setSelectedProject(modalData.project);
      }
    }
    if (modalData.requirement) {
      setSelectedRequirement(modalData.requirement);
    }
  }, [modalData]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (modalData.isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [modalData.isOpen]);

  // Global click interception for all enquiry CTAs
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        'a[href="#enquire"], button[data-enquiry-trigger], a[data-enquiry-trigger], button[data-enquiry-project], a[data-enquiry-project]'
      );
      if (!target) return;

      // Allow clicks on links inside the modal itself or on the actual footer form
      if (target.closest(".enquiry-modal-card") || target.closest(".form-panel")) {
        return;
      }

      e.preventDefault();
      const rawText = target.innerText?.replace(/[↗→]/g, "").trim() || "Register Your Requirement";
      const customTitle = target.getAttribute("data-enquiry-title") || rawText;
      const customReq = target.getAttribute("data-enquiry-req") || "500 to 1,000 Sq. Yards";
      const customProject = target.getAttribute("data-enquiry-project") || "";

      let cleanTitle = customTitle;
      if (cleanTitle.toLowerCase().includes("master plan") || cleanTitle.toLowerCase().includes("brochure")) {
        cleanTitle = "Request Master Plan & Brochure Dossier";
      } else if (cleanTitle.toLowerCase().includes("priority")) {
        cleanTitle = "Priority Allocation Enquiry";
      } else if (cleanTitle.toLowerCase().includes("visit")) {
        cleanTitle = "Schedule Physical Site Visit";
      } else if (cleanTitle.toLowerCase().includes("touch")) {
        cleanTitle = "Direct Enterprise Consultation";
      } else if (!cleanTitle.startsWith("Request") && !cleanTitle.startsWith("Register") && !cleanTitle.startsWith("Enquiry")) {
        cleanTitle = `Enquiry: ${cleanTitle}`;
      }

      setModalData({
        isOpen: true,
        title: cleanTitle,
        subtitle: "Direct priority allocation and technical master documentation for enterprise investors.",
        requirement: customReq,
        project: customProject,
      });
      setStatus("idle");
      setErrorMessage("");
      setErrors({});
    }

    function handleCustomEvent(e: Event) {
      const customEvent = e as CustomEvent<{
        title?: string;
        subtitle?: string;
        requirement?: string;
        project?: string;
      }>;
      setModalData({
        isOpen: true,
        title: customEvent.detail?.title || "Register Your Requirement",
        subtitle: customEvent.detail?.subtitle || "Direct priority allocation and technical master documentation.",
        requirement: customEvent.detail?.requirement || "500 to 1,000 Sq. Yards",
        project: customEvent.detail?.project || "",
      });
      setStatus("idle");
      setErrorMessage("");
      setErrors({});
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModalData((prev) => ({ ...prev, isOpen: false }));
      }
    }

    document.addEventListener("click", handleGlobalClick);
    window.addEventListener("open-enquiry-modal", handleCustomEvent);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("open-enquiry-modal", handleCustomEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeModal() {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    const nextErrors: Record<string, string> = {};

    const phoneDigits = String(values.phone || "").replace(/\D/g, "");
    if (String(values.name || "").trim().length < 2) {
      nextErrors.name = "Enter your full name.";
    }
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || ""))) {
      nextErrors.email = "Enter a valid corporate email address.";
    }
    if (!values.consent) {
      nextErrors.consent = "Please confirm the privacy consent.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const utmData = getCapturedUtm();

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          consent: Boolean(values.consent),
          message: String(values.message || "").trim() || `Enquiry from modal: ${modalData.title}`,
          ...utmData,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "We could not send your enquiry.");
      }

      setStatus("success");
      form.reset();

      // Trigger ad conversion tracking
      if (typeof window !== "undefined") {
        const win = window as unknown as {
          gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
          fbq?: (command: string, event: string, params?: Record<string, unknown>) => void;
        };
        win.gtag?.("event", "generate_lead", {
          event_category: "ModalEnquiry",
          event_label: modalData.title,
        });
        win.fbq?.("track", "Lead", { content_name: modalData.title });
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
  }

  if (!modalData.isOpen) return null;

  return (
    <div
      className="enquiry-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      onClick={closeModal}
    >
      <div className="enquiry-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="enquiry-modal-close"
          onClick={closeModal}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="enquiry-success-view">
            <div className="success-icon-badge">✓</div>
            <h3 className="success-title">Dossier Request Received</h3>
            <p className="success-desc">
              Thank you. Your enquiry regarding <strong>{modalData.title}</strong> has been securely routed to the MAAS Industrial Ventures executive investment desk.
            </p>
            <p className="success-sub">
              Our project director will review your plot specifications and reach out with complete blueprint documentation within 2 business hours.
            </p>
            <button
              type="button"
              className="button button-gold"
              style={{ marginTop: "20px", width: "100%", justifyContent: "center" }}
              onClick={closeModal}
            >
              Done / Return to Site
            </button>
          </div>
        ) : (
          <>
            <div className="enquiry-modal-header">
              <span className="eyebrow eyebrow-light" style={{ marginBottom: "6px" }}>
                <span></span> PRIORITY ENTERPRISE DESK
              </span>
              <h2 id="enquiry-modal-title" className="enquiry-modal-heading">
                {modalData.title}
              </h2>
              <p className="enquiry-modal-sub">
                {modalData.subtitle || "Enter your contact details to receive technical zoning blueprints, plot demarcation sheets, and utility documentation."}
              </p>
            </div>

            {errorMessage && (
              <div className="enquiry-modal-alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="enquiry-modal-form">
              {/* Anti-spam honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                style={{ display: "none" }}
              />

              <div className="modal-form-grid">
                <div className="modal-field">
                  <label htmlFor="modal-name">Full Name *</label>
                  <input
                    id="modal-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    required
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="field-err">{errors.name}</span>}
                </div>

                <div className="modal-field">
                  <label htmlFor="modal-phone">Phone / WhatsApp *</label>
                  <input
                    id="modal-phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    required
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <span className="field-err">{errors.phone}</span>}
                </div>

                <div className="modal-field">
                  <label htmlFor="modal-email">Corporate Email *</label>
                  <input
                    id="modal-email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="field-err">{errors.email}</span>}
                </div>

                <div className="modal-field">
                  <label htmlFor="modal-industry">Industry Sector</label>
                  <select id="modal-industry" name="industry" defaultValue="Manufacturing">
                    <option value="Manufacturing">Manufacturing &amp; Engineering</option>
                    <option value="Warehousing">Warehousing &amp; 3PL Logistics</option>
                    <option value="Automobile">Automobile &amp; Ancillary</option>
                    <option value="Electronics">Electronics &amp; Semi-conductor</option>
                    <option value="Pharmaceutical">Pharmaceutical &amp; Chemicals</option>
                    <option value="Renewable Energy">Renewable &amp; Green Energy</option>
                    <option value="Other">Other Enterprise Sector</option>
                  </select>
                </div>

                <div className="modal-field modal-field-full">
                  <label htmlFor="modal-project">Project Interested In</label>
                  <select
                    id="modal-project"
                    name="project"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="Gayatri Industrial Park (Bhojpur, Modinagar)">
                      Gayatri Industrial Park (Bhojpur, Modinagar)
                    </option>
                    <option value="Shri Balaji Industrial Park (Hapur-Modinagar Rd)">
                      Shri Balaji Industrial Park (Hapur-Modinagar Rd)
                    </option>
                    <option value="Residential Plotted Developments">
                      Residential Plotted Developments
                    </option>
                    <option value="General Industrial Land Consultation">
                      General Industrial Land Consultation
                    </option>
                  </select>
                </div>

                <div className="modal-field modal-field-full">
                  <label htmlFor="modal-req">Plot Size / Space Requirement</label>
                  <select
                    id="modal-req"
                    name="requirement"
                    value={selectedRequirement}
                    onChange={(e) => setSelectedRequirement(e.target.value)}
                  >
                    <option value="500 to 1,000 Sq. Yards">500 to 1,000 Sq. Yards</option>
                    <option value="1,000 to 2,000 Sq. Yards">1,000 to 2,000 Sq. Yards</option>
                    <option value="2,000 to 3,000+ Sq. Yards">2,000 to 3,000+ Sq. Yards</option>
                    <option value="1 to 5 Acres (Industrial Hub)">1 to 5 Acres (Industrial Hub)</option>
                    <option value="Master Plan Blueprint Only">Master Plan Blueprint &amp; Zoning Only</option>
                  </select>
                </div>

                <div className="modal-field modal-field-full">
                  <label htmlFor="modal-message">Specific Requirements / Note (Optional)</label>
                  <textarea
                    id="modal-message"
                    name="message"
                    rows={1}
                    placeholder="Power (kVA/MVA), dimensions, timeline..."
                  />
                </div>
              </div>

              <div className="modal-consent">
                <label>
                  <input type="checkbox" name="consent" defaultChecked required />
                  <span>
                    I authorize MAAS Industrial Ventures to share project blueprints, plot sheets, and schedule an investment consultation.
                  </span>
                </label>
                {errors.consent && <span className="field-err">{errors.consent}</span>}
              </div>

              <button
                type="submit"
                className="button button-gold modal-submit-btn"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Transmitting Request…" : "Send Request & Access Blueprint Dossier"}
                <Arrow diagonal />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
