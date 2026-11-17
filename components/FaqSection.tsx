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
}

export function FaqSection({
  faqs = [],
  eyebrow = "Clear Answers for Enterprise Buyers",
  headline = "Frequently Asked Questions.",
  description = "Key statutory, operational, and commercial questions answered for manufacturing enterprises and land investors.",
  sectionNumber = "05",
}: FaqSectionProps) {
  // Keep first item open by default for immediate preview
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || "faq-1");

  function toggleFaq(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="faq-section section-pad" id="faq" aria-label="Frequently Asked Questions">
      <div className="page-wrap">
        {/* Section Header */}
        <div className="section-label" style={{ marginBottom: "20px" }}>
          <span>{sectionNumber}</span> / Common Inquiries
        </div>

        <div className="faq-head">
          <div className="faq-head-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="faq-heading">
              Frequently Asked <span className="gold-script">Questions.</span>
            </h2>
            <p className="faq-lead">{description}</p>
          </div>

          <div className="faq-head-action">
            <button
              type="button"
              className="text-link faq-enquire-link"
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
            >
              Have a specific question? Speak to Advisory <Arrow diagonal />
            </button>
          </div>
        </div>

        {/* Interactive Accordion List */}
        <div className="faq-accordion-container" role="region" aria-label="FAQ Accordion">
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
                      width="16"
                      height="16"
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
    </section>
  );
}
