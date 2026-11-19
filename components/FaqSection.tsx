"use client";

import { useState } from "react";
import { FaqItem } from "@/lib/types";
import { Arrow } from "@/components/ui/Arrow";

interface FaqSectionProps {
  faqs: FaqItem[];
  eyebrow?: string;
  headline?: string;
  description?: string;
  sectionNumber?: string;
  phone?: string;
  whatsapp?: string;
}

export function FaqSection({
  faqs = [],
  eyebrow = "Clear Answers for Enterprise Buyers",
  headline = "Frequently Asked Questions.",
  description = "Key statutory, operational, and commercial questions answered for manufacturing enterprises and land investors.",
  sectionNumber = "06",
  phone,
  whatsapp,
}: FaqSectionProps) {
  // Keep first item open by default for immediate preview
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || "faq-1");

  function toggleFaq(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  if (!faqs || faqs.length === 0) return null;

  const cleanWaNumber = (num?: string) => {
    if (!num) return "";
    const digits = num.replace(/\D/g, "");
    if (digits.length === 10) return "91" + digits;
    return digits;
  };

  const waLink = whatsapp
    ? `https://wa.me/${cleanWaNumber(whatsapp)}?text=${encodeURIComponent(
        "Hello MAAS Industrial Ventures, I have an enquiry regarding plot availability, infrastructure, and policy subsidies."
      )}`
    : undefined;

  return (
    <section className="faq-section section-pad" id="faq" aria-label="Frequently Asked Questions">
      <div className="page-wrap">
        <div className="faq-layout-split">
          {/* Left Column: Section Header & Direct Developer Advisory Card */}
          <div className="faq-sidebar-col">
            <div className="section-label">
              <span>{sectionNumber}</span> / Common Inquiries
            </div>

            <p className="eyebrow">{eyebrow}</p>

            <h2 className="faq-heading">
              {headline === "Frequently Asked Questions." ? (
                <>
                  Frequently Asked <span className="gold-script">Questions.</span>
                </>
              ) : (
                headline
              )}
            </h2>

            <p className="faq-lead">{description}</p>

            {/* Direct Developer Advisory Help Card */}
            <div className="faq-advisory-box">
              <div className="advisory-box-badge">Direct Developer Advisory</div>
              <h3 className="advisory-box-title">Need custom zoning or plot specifications?</h3>
              <p className="advisory-box-lead">
                Our principal industrial planners provide unit sizing, road clearance, and state subsidy evaluations directly.
              </p>

              <div className="advisory-box-actions">
                <button
                  type="button"
                  className="button button-gold faq-cta-button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("open-enquiry-modal", {
                          detail: {
                            title: "Ask a Specific Project Question",
                            requirement: "Industrial Land",
                          },
                        })
                      );
                    }
                  }}
                  data-enquiry-trigger
                  data-enquiry-title="Ask a Specific Project Question"
                >
                  Speak to Advisory Desk <Arrow diagonal />
                </button>

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faq-whatsapp-link"
                    title="Direct WhatsApp Chat"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.44 7.66 20.3 9.72 20.3 11.92C20.29 16.46 16.6 20.16 12.05 20.16Z" />
                    </svg>
                    <span>Instant WhatsApp Chat</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Accordion System */}
          <div className="faq-accordion-col" role="region" aria-label="FAQ Accordion">
            <div className="faq-accordion-container">
              {faqs.map((faq, index) => {
                const isOpen = openId === (faq.id || `faq-${index}`);
                const faqId = faq.id || `faq-${index}`;
                const itemNum = index < 9 ? `0${index + 1}` : `${index + 1}`;

                return (
                  <div
                    key={faqId}
                    className={`faq-accordion-item ${isOpen ? "is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="faq-accordion-trigger"
                      onClick={() => toggleFaq(faqId)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faqId}`}
                      id={`faq-trigger-${faqId}`}
                    >
                      <span className="faq-item-num">{itemNum}</span>
                      <span className="faq-item-question">{faq.question}</span>
                      <span className="faq-item-icon" aria-hidden="true">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`faq-chevron ${isOpen ? "is-rotated" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>

                    <div
                      id={`faq-answer-${faqId}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${faqId}`}
                      className={`faq-accordion-content ${isOpen ? "is-expanded" : ""}`}
                    >
                      <div className="faq-accordion-inner">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
