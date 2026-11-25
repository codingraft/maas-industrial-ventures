"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const galleryFallback = "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82";

interface ViewerPhoto {
  src: string;
  caption: string;
  alt?: string;
  category?: string;
}

export function GalleryLightbox({ photos, initialIndex, onClose }: {
  photos: ViewerPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const dialog = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const photo = photos[index];

  useEffect(() => {
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("button")?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    };
  }, []);

  function step(delta: number) {
    setIndex(current => (current + delta + photos.length) % photos.length);
  }

  return createPortal(
    <div className="lightbox-overlay" ref={dialog} role="dialog" aria-modal="true" aria-label="Image viewer"
      onClick={onClose} onKeyDown={event => {
        if (event.key === "Escape") onClose();
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
        if (event.key !== "Tab") return;
        const buttons = event.currentTarget.querySelectorAll("button");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}>
      <div className="lightbox-content" onClick={event => event.stopPropagation()}
        onTouchStart={event => { touchX.current = event.changedTouches[0].clientX; }}
        onTouchCancel={() => { touchX.current = null; }}
        onTouchEnd={event => {
          if (touchX.current === null) return;
          const delta = event.changedTouches[0].clientX - touchX.current;
          if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
          touchX.current = null;
        }}>
        <div className="lightbox-image-wrap">
          <Image src={failed[photo.src] ? galleryFallback : photo.src} alt={photo.alt || photo.caption}
            fill sizes="95vw" style={{ objectFit: "contain" }}
            onError={() => { if (!failed[photo.src]) setFailed(previous => ({ ...previous, [photo.src]: true })); }} />
        </div>
        <div className="lightbox-caption-bar">
          <div>
            {photo.category && <span className="lightbox-tag">{photo.category.toUpperCase()}</span>}
            <p className="lightbox-title">{photo.caption}</p>
          </div>
          <span className="lightbox-counter" aria-live="polite">{index + 1} / {photos.length}</span>
        </div>
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close image viewer">✕</button>
        {photos.length > 1 && <>
          <button type="button" className="lightbox-arrow lightbox-prev" onClick={() => step(-1)} aria-label="Previous photo">‹</button>
          <button type="button" className="lightbox-arrow lightbox-next" onClick={() => step(1)} aria-label="Next photo">›</button>
        </>}
      </div>
    </div>, document.body
  );
}
