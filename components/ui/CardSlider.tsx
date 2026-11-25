"use client";

import { Children, CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface CardSliderProps {
  children: ReactNode;
  ariaLabel: string;
  desktopCols?: number;
  tabletCols?: number;
  mobileCols?: number;
  gap?: number;
  className?: string;
  tabLabels?: string[];
  controlsPosition?: "bottom" | "top";
}

export function CardSlider({
  children,
  ariaLabel,
  desktopCols = 3,
  tabletCols = 2,
  mobileCols = 1,
  gap = 20,
  className = "",
  tabLabels,
  controlsPosition = "bottom",
}: CardSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const total = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const syncMetrics = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const overflow = maxScroll > 4;
    setHasOverflow(overflow);

    if (!overflow) {
      setCanPrev(false);
      setCanNext(false);
      setActiveIndex(0);
      setPageCount(1);
      return;
    }

    const slides = Array.from(el.children) as HTMLElement[];
    const firstSlideWidth = slides[0]?.offsetWidth || el.clientWidth;
    const perView = Math.max(1, Math.round((el.clientWidth + gap) / (firstSlideWidth + gap)));
    const maxStep = Math.max(1, total - perView);
    setPageCount(maxStep + 1);

    const scrollLeft = el.scrollLeft;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft < maxScroll - 4);

    // Find closest slide index to current scrollLeft
    let closest = 0;
    let minDiff = Infinity;
    for (let i = 0; i <= maxStep && i < slides.length; i++) {
      const diff = Math.abs(slides[i].offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    }
    setActiveIndex(closest);
  }, [gap, total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    syncMetrics();

    const ro = new ResizeObserver(() => {
      syncMetrics();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, [syncMetrics, total]);

  const scrollToSlide = (targetIdx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    const clamped = Math.max(0, Math.min(targetIdx, pageCount - 1));
    const targetSlide = slides[clamped];
    if (targetSlide) {
      el.scrollTo({ left: targetSlide.offsetLeft, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    scrollToSlide(activeIndex - 1);
  };

  const handleNext = () => {
    scrollToSlide(activeIndex + 1);
  };

  const styleVars = {
    "--slider-cols-desktop": desktopCols,
    "--slider-cols-tablet": tabletCols,
    "--slider-cols-mobile": mobileCols,
    "--slider-gap": `${gap}px`,
  } as CSSProperties;

  const controlsBar = hasOverflow ? (
    <div className={`card-slider-controls ${controlsPosition === "top" ? "is-top" : "is-bottom"}`}>
      {tabLabels && tabLabels.length > 0 ? (
        <div className="card-slider-tabs" role="tablist" aria-label={ariaLabel}>
          {tabLabels.slice(0, total).map((label, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              className={`card-slider-tab ${idx === activeIndex ? "is-active" : ""}`}
              onClick={() => scrollToSlide(idx)}
            >
              <span className="slider-tab-idx">{String(idx + 1).padStart(2, "0")}</span>
              <span className="slider-tab-text">{label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="card-slider-dots" role="tablist" aria-label={`${ariaLabel} pages`}>
          {Array.from({ length: pageCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Slide ${idx + 1} of ${pageCount}`}
              className={`card-slider-dot ${idx === activeIndex ? "is-active" : ""}`}
              onClick={() => scrollToSlide(idx)}
            />
          ))}
        </div>
      )}

      <div className="card-slider-nav">
        <span className="card-slider-counter" aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")}
          <span className="counter-sep"> / </span>
          {String(pageCount).padStart(2, "0")}
        </span>
        <div className="card-slider-arrows">
          <button
            type="button"
            className="card-slider-arrow"
            onClick={handlePrev}
            disabled={!canPrev}
            aria-label={`Previous ${ariaLabel}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="card-slider-arrow"
            onClick={handleNext}
            disabled={!canNext}
            aria-label={`Next ${ariaLabel}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`card-slider ${className}`} style={styleVars}>
      {controlsPosition === "top" && controlsBar}
      <div
        ref={trackRef}
        className={`card-slider-track ${!hasOverflow ? "is-fit" : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        onScroll={() => {
          window.requestAnimationFrame(syncMetrics);
        }}
      >
        {items.map((child, idx) => (
          <div key={idx} className="card-slider-slide">
            {child}
          </div>
        ))}
      </div>
      {controlsPosition === "bottom" && controlsBar}
    </div>
  );
}
