"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";
import { HeroSlide } from "@/lib/types";

interface HeroSliderProps {
  slides: HeroSlide[];
  locationText?: string;
  brandShortName?: string;
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroDescription?: string;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  bottomHighlights?: string[];
}

export function HeroSlider({
  slides,
  locationText = "Industrial & Residential Land Development | India",
  brandShortName = "MAAS Industrial Ventures",
  heroEyebrow,
  heroHeadline,
  heroSubheadline,
  heroDescription,
  primaryBtnText = "Explore Our Projects",
  secondaryBtnText = "Get in Touch",
  bottomHighlights = [
    "Industrial Hub Development",
    "Industrial Plot Development",
    "Residential Land Development",
    "Real Estate Development",
  ],
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = slides?.length || 0;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentIndex];

  const displayEyebrow =
    currentIndex === 0 && heroEyebrow
      ? heroEyebrow
      : activeSlide.eyebrow || heroEyebrow || `${brandShortName} · Land & Real Estate Developers`;

  const displayTitle =
    currentIndex === 0 && heroHeadline
      ? heroHeadline
      : activeSlide.title || heroHeadline || "Developing Land. Building Opportunities.";

  const displaySubtitle =
    currentIndex === 0 && heroSubheadline
      ? heroSubheadline
      : activeSlide.subtitle || heroSubheadline || "Creating Industrial Hubs & Residential Developments for a Better Tomorrow.";

  const displayDesc =
    currentIndex === 0
      ? heroDescription || "We are land and real estate developers focused on creating thoughtfully planned industrial hubs, industrial plots and residential developments. Transforming land into destinations for enterprise growth."
      : undefined;

  return (
    <section className="hero hero-slider" aria-label="MAAS Industrial Ventures Hero Banner">
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`hero-slide-layer ${idx === currentIndex ? "is-active" : ""}`}
          aria-hidden={idx !== currentIndex}
        >
          <Image
            className="hero-image"
            src={slide.src}
            alt={slide.alt || "MAAS Industrial Infrastructure"}
            fill
            priority={idx === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Cinematic Architectural Scrim */}
      <div className="hero-shade" />

      {/* Hero Content Area */}
      <div className="hero-main">
        <div className="page-wrap hero-main-wrap">
          <div className="hero-copy-column">
            <div className="hero-eyebrow-badge">
              <span className="eyebrow-dot" />
              <span className="eyebrow-text">{displayEyebrow}</span>
            </div>

            <h1 id="hero-title" key={`title-${currentIndex}`} className="hero-slider-heading">
              {displayTitle.split(".").map((part, i, arr) => {
                const trimmed = part.trim();
                if (!trimmed) return null;
                return (
                  <span key={i} className="heading-line">
                    {i === 1 ? <span className="hero-gold-accent">{trimmed}.</span> : `${trimmed}. `}
                  </span>
                );
              })}
            </h1>

            <p key={`subtitle-${currentIndex}`} className="hero-subheadline">
              {displaySubtitle}
            </p>

            {displayDesc && (
              <p key={`desc-${currentIndex}`} className="hero-desc-narrative">
                {displayDesc}
              </p>
            )}

            <div className="hero-actions">
              <a className="button button-gold hero-cta-primary" href="#projects">
                {primaryBtnText} <Arrow diagonal />
              </a>
              <button
                type="button"
                className="button button-outline-light hero-cta-secondary"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("open-enquiry-modal", {
                        detail: {
                          title: "Priority Project Allocation Consultation",
                          requirement: "Industrial Land",
                        },
                      })
                    );
                  }
                }}
                data-enquiry-trigger
                data-enquiry-title="Priority Project Allocation Consultation"
              >
                {secondaryBtnText} <Arrow />
              </button>
            </div>

            {/* 4 Highlights Strip */}
            {bottomHighlights && bottomHighlights.length > 0 && (
              <div className="hero-highlights-strip" aria-label="Development Verticals">
                {bottomHighlights.map((hl, idx) => (
                  <span key={idx} className="hero-highlight-chip">
                    <span className="chip-num">0{idx + 1}</span>
                    <span className="chip-label">{hl}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Bottom Architectural Status Bar */}
      <div className="hero-dock-bar">
        <div className="hero-dock-inner">
          <div className="hero-dock-location">
            <span className="dock-pin-icon" aria-hidden="true">📍</span>
            <span>{locationText}</span>
          </div>

          {total > 1 && (
            <div className="hero-dock-controls" role="tablist" aria-label="Slide Selection">
              <button
                type="button"
                className="dock-arrow-btn"
                onClick={prevSlide}
                aria-label="Previous Slide"
              >
                ‹
              </button>

              <div className="dock-progress-dots">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    className={`dock-dot ${idx === currentIndex ? "is-active" : ""}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-selected={idx === currentIndex}
                    aria-label={`Slide ${idx + 1}`}
                  >
                    <span className="dock-dot-fill" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="dock-arrow-btn"
                onClick={nextSlide}
                aria-label="Next Slide"
              >
                ›
              </button>

              <span className="dock-counter">
                0{currentIndex + 1} <span style={{ opacity: 0.35 }}>/</span> 0{total}
              </span>
            </div>
          )}

          <div className="hero-dock-scroll">
            <a href="#overview" className="dock-scroll-link">
              <span className="dock-scroll-line" />
              <span>Scroll to explore</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
