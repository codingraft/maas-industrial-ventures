"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";
import { HeroSlide } from "@/lib/types";

interface HeroSliderProps {
  slides: HeroSlide[];
  locationText?: string;
  brandShortName?: string;
}

export function HeroSlider({
  slides,
  locationText = "Project Location",
  brandShortName = "MAAS Industrial Ventures",
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer (6 seconds)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, total, nextSlide]);

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentIndex];

  return (
    <section
      className="hero hero-slider"
      aria-label="Hero Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
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
            quality={85}
          />
        </div>
      ))}

      <div className="hero-shade" />

      {/* Side Navigation Arrows (Desktop / Tablet) */}
      {total > 1 && (
        <>
          <button
            type="button"
            className="slider-side-arrow slider-side-prev"
            onClick={prevSlide}
            aria-label="Previous Slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="slider-side-arrow slider-side-next"
            onClick={nextSlide}
            aria-label="Next Slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Main Slide Content - Clean, unobstructed flow */}
      <div className="hero-content page-wrap">
        <p className="eyebrow eyebrow-light">
          <span /> {activeSlide.eyebrow || `${brandShortName} / High-Capacity Infrastructure`}
        </p>

        <h1 id="hero-title" key={`title-${currentIndex}`} className="hero-slider-heading">
          {activeSlide.title || (
            <>
              Built for industry.<br />
              <em>Designed for what’s next.</em>
            </>
          )}
        </h1>

        <p key={`desc-${currentIndex}`} className="hero-copy hero-slider-copy">
          {activeSlide.subtitle}
        </p>

        <div className="hero-actions">
          <a className="button button-gold" href="#enquire">
            Register For Priority Allocation <Arrow diagonal />
          </a>
          <a className="text-link text-link-light" href="#overview">
            Explore Infrastructure Scope <Arrow />
          </a>
        </div>
      </div>

      {/* Hero Bottom Meta Strip with Integrated Non-Overlapping Slider Dock */}
      <div className="hero-bottom page-wrap">
        {/* Left: Location Pin */}
        <span className="hero-location">
          <span className="pin">⌖</span>
          {locationText}
        </span>

        {/* Center: Integrated Slider Navigation Dock */}
        {total > 1 && (
          <div className="slider-dock" role="tablist" aria-label="Slide Selection">
            <button
              type="button"
              className="slider-dock-btn"
              onClick={prevSlide}
              aria-label="Previous Slide"
            >
              ‹
            </button>

            <div className="slider-dock-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  className={`slider-dock-dot ${idx === currentIndex ? "is-active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <span className="dot-progress" />
                </button>
              ))}
            </div>

            <button
              type="button"
              className="slider-dock-btn"
              onClick={nextSlide}
              aria-label="Next Slide"
            >
              ›
            </button>

            <span className="slider-dock-counter">
              0{currentIndex + 1} <span style={{ opacity: 0.4 }}>/</span> 0{total}
            </span>
          </div>
        )}

        {/* Right: Scroll to explore with right-padding clearance for floating buttons */}
        <div className="hero-bottom-right">
          <a className="scroll-cue" href="#overview">
            <span /> Scroll to explore
          </a>
        </div>
      </div>
    </section>
  );
}
