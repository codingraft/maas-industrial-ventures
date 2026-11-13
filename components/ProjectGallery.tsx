"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { GalleryItem, GalleryCategory } from "@/lib/types";
import { Pagination } from "@/components/ui/Pagination";

interface ProjectGalleryProps {
  images?: GalleryItem[];
  categories?: GalleryCategory[];
}

export function ProjectGallery({ images = [], categories = [] }: ProjectGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const pageSize = 6;

  // Filter out any categories that have ZERO images
  const visibleCategories = useMemo(() => {
    const baseCats = categories && categories.length > 0
      ? categories
      : [
          { id: "manufacturing", label: "Manufacturing" },
          { id: "warehousing", label: "Warehousing" },
          { id: "infrastructure", label: "Infrastructure" },
          { id: "logistics", label: "Logistics" },
        ];

    // Only render tabs that have at least 1 image
    return baseCats.filter((cat) =>
      images.some((img) => (img.category || "").toLowerCase() === cat.id.toLowerCase())
    );
  }, [categories, images]);

  // If current activeCategory has no images, reset to 'all'
  useEffect(() => {
    if (activeCategory !== "all") {
      const exists = visibleCategories.some((c) => c.id.toLowerCase() === activeCategory.toLowerCase());
      if (!exists) {
        setActiveCategory("all");
      }
    }
  }, [activeCategory, visibleCategories]);

  // Filter items by selected category
  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return images;
    return images.filter(
      (img) => (img.category || "").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [images, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / pageSize));

  // Slice paginated items
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredImages.slice(start, start + pageSize);
  }, [filteredImages, currentPage, pageSize]);

  // Reset page when category changes
  function handleCategoryChange(catId: string) {
    setActiveCategory(catId);
    setCurrentPage(1);
    setLightboxIndex(null);
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight")
        setLightboxIndex((prev) => (prev! + 1) % filteredImages.length);
      if (event.key === "ArrowLeft")
        setLightboxIndex((prev) => (prev! - 1 + filteredImages.length) % filteredImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, filteredImages.length]);

  return (
    <>
      <section className="gallery section-pad" id="gallery">
        <div className="page-wrap gallery-head">
          <div>
            <p className="eyebrow">An industrial point of view</p>
            <h2>
              Space to see<br />
              <em>possibility.</em>
            </h2>
          </div>
          <p>
            Visual references for high-capacity industrial settings, logistics typologies, and operational infrastructure.
          </p>
        </div>

        {/* Category Filter Pills (Only categories with images are visible) */}
        <div className="page-wrap gallery-filter-bar" role="tablist" aria-label="Sector filter tabs">
          {images.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              className={`gallery-filter-pill ${activeCategory === "all" ? "is-active" : ""}`}
              onClick={() => handleCategoryChange("all")}
            >
              All Sectors ({images.length})
            </button>
          )}

          {visibleCategories.map((cat) => {
            const count = images.filter(
              (img) => (img.category || "").toLowerCase() === cat.id.toLowerCase()
            ).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`gallery-filter-pill ${activeCategory === cat.id ? "is-active" : ""}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Paginated Gallery Grid - Auto-flowing without empty gaps */}
        <div className="gallery-grid page-wrap">
          {paginatedImages.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              No visual references found.
            </div>
          ) : (
            paginatedImages.map((image, index) => {
              const globalIndex = (currentPage - 1) * pageSize + index;
              return (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  className="gallery-item"
                  onClick={() => setLightboxIndex(globalIndex)}
                  aria-label={`Open image: ${image.caption}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || "MAAS Industrial Infrastructure"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <span className="gallery-open" aria-hidden="true">
                    ↗
                  </span>
                  <div className="gallery-item-info">
                    <span className="gallery-tag">{image.category}</span>
                    <span className="gallery-caption">{image.caption}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="page-wrap" style={{ marginTop: "28px" }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredImages.length}
              pageSize={pageSize}
            />
          </div>
        )}

        <div className="page-wrap gallery-foot">
          <span>
            Showing {filteredImages.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, filteredImages.length)} of {filteredImages.length} assets
          </span>
          <span style={{ textTransform: "capitalize" }}>
            Active Filter: {activeCategory === "all" ? "All Sectors" : activeCategory}
          </span>
        </div>
      </section>

      {/* Enhanced Lightbox */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Gallery View"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close presentation"
          >
            ✕
          </button>

          {filteredImages.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (prev) => (prev! - 1 + filteredImages.length) % filteredImages.length
                  );
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! + 1) % filteredImages.length);
                }}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          <figure onClick={(e) => e.stopPropagation()}>
            <Image
              src={filteredImages[lightboxIndex].src}
              alt={filteredImages[lightboxIndex].alt || "MAAS asset"}
              fill
              sizes="90vw"
              priority
              style={{ objectFit: "contain" }}
            />
            <figcaption>
              <span className="gallery-tag" style={{ display: "inline-block", marginRight: "10px" }}>
                {filteredImages[lightboxIndex].category}
              </span>
              <strong>{filteredImages[lightboxIndex].caption}</strong>
              <span style={{ opacity: 0.7, marginLeft: "10px" }}>
                (Image {lightboxIndex + 1} of {filteredImages.length})
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
