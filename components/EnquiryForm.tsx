"use client";

import { useState, useEffect } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { getCapturedUtm } from "@/lib/utm";

interface EnquiryFormProps {
  defaultProject?: string;
}

export function EnquiryForm({ defaultProject }: EnquiryFormProps = {}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProject, setSelectedProject] = useState(
    defaultProject || "Gayatri Industrial Park (Bhojpur, Modinagar)"
  );

  useEffect(() => {
    if (defaultProject) {
      const text = defaultProject.toLowerCase();
      if (text.includes("balaji")) {
        setSelectedProject("Shri Balaji Industrial Park (Hapur-Modinagar Rd)");
      } else if (text.includes("gayatri")) {
        setSelectedProject("Gayatri Industrial Park (Bhojpur, Modinagar)");
      } else if (text.includes("residential")) {
        setSelectedProject("Residential Plotted Developments");
      } else {
        setSelectedProject(defaultProject);
      }
    }
  }, [defaultProject]);

  useEffect(() => {
    function handleSelect(e: Event) {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        const text = custom.detail.toLowerCase();
        if (text.includes("balaji")) {
          setSelectedProject("Shri Balaji Industrial Park (Hapur-Modinagar Rd)");
        } else if (text.includes("gayatri")) {
          setSelectedProject("Gayatri Industrial Park (Bhojpur, Modinagar)");
        } else if (text.includes("residential")) {
          setSelectedProject("Residential Plotted Developments");
        } else {
          setSelectedProject(custom.detail);
        }
      }
    }
    window.addEventListener("maas-select-project", handleSelect);
    return () => window.removeEventListener("maas-select-project", handleSelect);
  }, []);

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
    if (String(values.message || "").trim().length < 4) {
      nextErrors.message = "Please share a brief description of your requirement.";
    }
    if (!values.consent) {
      nextErrors.consent = "Please confirm the privacy consent.";
    }

    setErrors(nextErrors);
    setStatus("idle");

    if (Object.keys(nextErrors).length) {
      setMessage("Please complete all required fields.");
      const firstErrorKey = Object.keys(nextErrors)[0];
      document.getElementById(firstErrorKey)?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");

    // Grab UTM parameters captured from current session or URL
    const utmData = getCapturedUtm();

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          project: values.project || selectedProject,
          consent: Boolean(values.consent),
          ...utmData,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "We could not send your enquiry.");
      }

      setStatus("success");
      setMessage(
        "Thank you. Your enquiry has been received by MAAS Industrial Ventures. Our project director will follow up with you shortly."
      );
      form.reset();

      // Trigger Ad Conversion Events (Google Ads / GA4 / Meta Pixel)
      if (typeof window !== "undefined") {
        const win = window as unknown as {
          gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
          fbq?: (command: string, event: string) => void;
        };
        win.gtag?.("event", "generate_lead", {
          event_category: "LeadForm",
          event_label: "Landing Page Enquiry",
        });
        win.fbq?.("track", "Lead");
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not send your enquiry. Please try calling directly."
      );
    }
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {/* Project Selector */}
        <div className="field field-wide">
          <label htmlFor="project">
            Project Interested In <b>*</b>
          </label>
          <select
            id="project"
            name="project"
            className="form-select"
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

        <div className="field">
          <label htmlFor="name">
            Full name <b>*</b>
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <small id="name-error" className="field-error">
              {errors.name}
            </small>
          )}
        </div>

        <div className="field">
          <label htmlFor="phone">
            Phone / WhatsApp <b>*</b>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 00000 00000"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <small id="phone-error" className="field-error">
              {errors.phone}
            </small>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">
            Official email <b>*</b>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <small id="email-error" className="field-error">
              {errors.email}
            </small>
          )}
        </div>

        <div className="field">
          <label htmlFor="industry">Industry / Sector</label>
          <input
            id="industry"
            name="industry"
            autoComplete="organization"
            placeholder="e.g. Manufacturing, Logistics, Engineering"
          />
        </div>

        <div className="field field-wide">
          <label htmlFor="requirement">Required Plot Size / Dimensions</label>
          <input
            id="requirement"
            name="requirement"
            placeholder="e.g. 500 sq. yards, 1,000 sq. yards, 3,000 sq. yards"
          />
        </div>

        <div className="field field-wide">
          <label htmlFor="message">
            Specific Requirements &amp; Timelines <b>*</b>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Share details on power requirements, intended manufacturing usage, or site visit request"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <small id="message-error" className="field-error">
              {errors.message}
            </small>
          )}
        </div>

        {/* Anti-spam honeypot */}
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <label className="consent" htmlFor="consent">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          defaultChecked
          aria-invalid={!!errors.consent}
        />
        <span>
          I authorize MAAS Industrial Ventures to contact me via phone, email, or WhatsApp regarding this project enquiry.
        </span>
      </label>
      {errors.consent && (
        <small className="field-error consent-error">{errors.consent}</small>
      )}

      <div className="form-submit">
        <button
          className="button button-gold"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Submitting…" : "Submit Project Enquiry"}
          <Arrow diagonal />
        </button>
        <p>Verified project schedules &amp; specifications will be shared directly.</p>
      </div>

      <p className={`form-feedback ${status}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
