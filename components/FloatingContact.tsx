"use client";

import { useState } from "react";
import { BrochureModal } from "./BrochureModal";

interface FloatingContactProps {
  phone: string;
  whatsapp: string;
  brochureUrl?: string;
}

export function FloatingContact({ phone, whatsapp, brochureUrl }: FloatingContactProps) {
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const cleanWaNumber = (num: string) => {
    const digits = num.replace(/\D/g, "");
    if (digits.length === 10) return "91" + digits;
    return digits;
  };

  const waLink = `https://wa.me/${cleanWaNumber(whatsapp)}?text=${encodeURIComponent(
    "Hello MAAS Industrial Ventures, I am interested in exploring industrial land and warehouse space opportunities. Please share project specifications."
  )}`;

  return (
    <>
      {/* When closed: Sleek floating launcher bubble */}
      {isClosed ? (
        <button
          type="button"
          onClick={() => setIsClosed(false)}
          className="float-launcher-btn"
          aria-label="Open contact shortcuts"
          title="Open quick contact options"
        >
          <span className="float-pulse-ring" />
          <span className="float-launcher-icon">💬</span>
          <span className="float-launcher-text">Contact Sales</span>
        </button>
      ) : (
        /* When open: Floating Action Stack with Close Button */
        <aside className="floating-contact-bar" aria-label="Quick contact actions">
          {/* Close / Minimize Button */}
          <div className="float-header-row">
            <button
              type="button"
              className="float-close-btn"
              onClick={() => setIsClosed(true)}
              aria-label="Close contact shortcuts"
              title="Close shortcuts"
            >
              ✕
            </button>
          </div>

          {/* Floating WhatsApp Action */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="float-btn float-whatsapp"
            aria-label="Chat directly on WhatsApp"
          >
            <span className="float-icon" aria-hidden="true">💬</span>
            <span className="float-text">
              <span className="label-desktop">WhatsApp Us</span>
              <span className="label-mobile">WhatsApp</span>
            </span>
          </a>

          {/* Floating Direct Call Action */}
          <a
            href={`tel:${phone}`}
            className="float-btn float-call"
            aria-label="Direct Phone Enquiry"
          >
            <span className="float-icon" aria-hidden="true">📞</span>
            <span className="float-text">
              <span className="label-desktop">Call Sales</span>
              <span className="label-mobile">Call</span>
            </span>
          </a>

          {/* Floating Brochure Download CTA */}
          <button
            type="button"
            onClick={() => setShowBrochureModal(true)}
            className="float-btn float-brochure"
            aria-label="Download Project Brochure"
          >
            <span className="float-icon" aria-hidden="true">📄</span>
            <span className="float-text">
              <span className="label-desktop">Get Brochure</span>
              <span className="label-mobile">Brochure</span>
            </span>
          </button>
        </aside>
      )}

      {/* Brochure Lead Magnet Modal */}
      {showBrochureModal && (
        <BrochureModal
          onClose={() => setShowBrochureModal(false)}
          brochureUrl={brochureUrl}
        />
      )}
    </>
  );
}
