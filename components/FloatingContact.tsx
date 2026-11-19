"use client";

import { useState, useEffect, useRef } from "react";
import { BrochureModal } from "./BrochureModal";

interface FloatingContactProps {
  phone: string;
  whatsapp: string;
  brochureUrl?: string;
}

export function FloatingContact({ phone, whatsapp, brochureUrl }: FloatingContactProps) {
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-hide when user approaches the contact / enquiry form section or near page bottom
  // Throttled via requestAnimationFrame to eliminate forced synchronous reflows & 60fps jank
  useEffect(() => {
    let rafId: number | null = null;
    let contactEl: HTMLElement | null = null;

    const checkScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. Hide on hero fold (top of page) to avoid overlapping hero controls & glance bar
      if (window.scrollY < 240) {
        setIsHidden(true);
        setIsOpen(false);
        return;
      }

      // 2. If within 550px of page bottom (in or near contact form/footer), hide
      if (docHeight - scrollPos < 550) {
        setIsHidden(true);
        setIsOpen(false);
        return;
      }

      // 3. Check contact section bounding rect (lazy lookup with cache)
      if (!contactEl) {
        contactEl = document.getElementById("contact") || document.querySelector<HTMLElement>(".enquire");
      }

      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        // If the contact section is entering viewport (top < viewport height + 80)
        if (rect.top <= window.innerHeight + 80 && rect.bottom >= 0) {
          setIsHidden(true);
          setIsOpen(false);
          return;
        }
      }

      setIsHidden(false);
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        checkScroll();
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    checkScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Close speed dial when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
      <div
        ref={menuRef}
        className={`floating-advisory-widget ${isHidden ? "is-hidden" : ""} ${isOpen ? "is-expanded" : ""}`}
        aria-label="MAAS Quick Contact Concierge"
      >
        {/* Speed-dial Popup Card */}
        {isOpen && (
          <div className="advisory-speed-dial" role="menu">
            <div className="speed-dial-header">
              <div className="speed-dial-title-wrap">
                <span className="live-status-dot" aria-hidden="true" />
                <span className="speed-dial-title">MAAS Advisory Concierge</span>
              </div>
              <button
                type="button"
                className="speed-dial-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close concierge"
              >
                ✕
              </button>
            </div>

            <p className="speed-dial-lead">
              Direct connection to our industrial land allocation desk.
            </p>

            <div className="speed-dial-actions">
              {/* WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="dial-item dial-whatsapp"
                onClick={() => setIsOpen(false)}
              >
                <div className="dial-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.44 7.66 20.3 9.72 20.3 11.92C20.29 16.46 16.6 20.16 12.05 20.16Z" />
                  </svg>
                </div>
                <div className="dial-item-info">
                  <strong>Chat on WhatsApp</strong>
                  <small>Immediate assistance &amp; plot details</small>
                </div>
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:${phone}`}
                className="dial-item dial-call"
                onClick={() => setIsOpen(false)}
              >
                <div className="dial-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="dial-item-info">
                  <strong>Call Sales Desk</strong>
                  <small>{phone}</small>
                </div>
              </a>

              {/* Request Master Plan & Brochure */}
              <button
                type="button"
                className="dial-item dial-brochure"
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("open-enquiry-modal", {
                        detail: {
                          title: "Request Master Plan & Technical Dossier",
                          requirement: "Industrial Land",
                        },
                      })
                    );
                  }
                }}
              >
                <div className="dial-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="dial-item-info">
                  <strong>Get Master Plan &amp; Brochure</strong>
                  <small>Detailed maps, layouts &amp; policy subsidies</small>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Minimalist Floating Action Button (FAB) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="concierge-fab"
          aria-expanded={isOpen}
          aria-label="Toggle MAAS advisory concierge"
          title="Speak with Advisory"
        >
          <span className="fab-pulse-halo" />
          <span className="fab-icon-wrap">
            {isOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="12" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
            )}
          </span>
          <span className="fab-label">Enquire</span>
        </button>
      </div>

      {showBrochureModal && (
        <BrochureModal
          onClose={() => setShowBrochureModal(false)}
          brochureUrl={brochureUrl}
        />
      )}
    </>
  );
}
