"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { GalleryItem, GalleryCategory } from "@/lib/types";
import { Pagination } from "@/components/ui/Pagination";

import { GalleryLightbox, galleryFallback } from "./GalleryLightbox";

interface ProjectGalleryProps {
  images?: GalleryItem[];
  categories?: GalleryCategory[];
  eyebrow?: string;
  headline?: string;
  description?: string;
  pageSize?: number;
}

export function ProjectGallery({
  images = [],
  categories = [],
  eyebrow = "Project Visuals & Site Progress",
  headline = "Project Gallery & Site Progress.",
  description = "Real site photographs and clearly identified illustrative images of Gayatri Industrial Park, Shri Balaji Industrial Park, concrete road networks, and manufacturing operations.",
  pageSize = 6,
}: ProjectGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Filter out any categories that have ZERO matching images
  const visibleCategories = useMemo(() => {
    const baseCats =
      categories && categories.length > 0
        ? categories.filter((c) => c.id !== "all")
        : [
            { id: "gayatri", label: "Gayatri Industrial Park" },
            { id: "shri-balaji", label: "Shri Balaji Industrial Park" },
            { id: "infrastructure", label: "Infrastructure & Roads" },
            { id: "manufacturing", label: "Manufacturing & Logistics" },
          ];

    return baseCats.filter((cat) => {
      const catId = cat.id.toLowerCase();
      return images.some((img) => {
        const c = (img.category || "").toLowerCase();
        const pid = (img.projectId || "").toLowerCase();
        const cap = (img.caption || "").toLowerCase();
        return (
          c === catId ||
          pid === catId ||
          (catId === "gayatri" && (pid.includes("gayatri") || cap.includes("gayatri"))) ||
          (catId === "shri-balaji" && (pid.includes("balaji") || cap.includes("balaji")))
        );
      });
    });
  }, [categories, images]);

  // If current activeCategory has no images, reset to 'all'
  useEffect(() => {
    if (activeCategory !== "all") {
      const exists = visibleCategories.some(
        (c) => c.id.toLowerCase() === activeCategory.toLowerCase()
      );
      if (!exists) {
        setActiveCategory("all");
      }
    }
  }, [activeCategory, visibleCategories]);

  // Filter items by selected category or project
  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return images;
    const catId = activeCategory.toLowerCase();
    return images.filter((img) => {
      const c = (img.category || "").toLowerCase();
      const pid = (img.projectId || "").toLowerCase();
      const cap = (img.caption || "").toLowerCase();
      return (
        c === catId ||
        pid === catId ||
        (catId === "gayatri" && (pid.includes("gayatri") || cap.includes("gayatri"))) ||
        (catId === "shri-balaji" && (pid.includes("balaji") || cap.includes("balaji")))
      );
    });
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

  return (
    <>
      <section className="gallery section-pad" id="gallery">
        <div className="page-wrap section-label" style={{ marginBottom: "20px" }}>
          <span>04</span> / Project Gallery
        </div>
        <div className="page-wrap gallery-head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{headline}</h2>
          </div>
          <p>{description}</p>
        </div>

        {/* Category Filter Pills */}
        <div className="page-wrap gallery-filter-bar" role="tablist" aria-label="Sector and Project filter tabs">
          {images.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              className={`gallery-filter-pill ${activeCategory === "all" ? "is-active" : ""}`}
              onClick={() => handleCategoryChange("all")}
            >
              All Photos ({images.length})
            </button>
          )}

          {visibleCategories.map((cat) => {
            const catId = cat.id.toLowerCase();
            const count = images.filter((img) => {
              const c = (img.category || "").toLowerCase();
              const pid = (img.projectId || "").toLowerCase();
              const cap = (img.caption || "").toLowerCase();
              return (
                c === catId ||
                pid === catId ||
                (catId === "gayatri" && (pid.includes("gayatri") || cap.includes("gayatri"))) ||
                (catId === "shri-balaji" && (pid.includes("balaji") || cap.includes("balaji")))
              );
            }).length;

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

        {/* Paginated Gallery Grid */}
        <div className="gallery-grid page-wrap">
          {paginatedImages.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              No visual references found for this filter.
            </div>
          ) : (
            paginatedImages.map((image, index) => {
              const globalIndex = (currentPage - 1) * pageSize + index;
              return (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  className={`gallery-item ${image.className || ""}`}
                  onClick={() => setLightboxIndex(globalIndex)}
                  aria-label={`Open photo: ${image.caption}`}
                >
                  <Image
                    src={failedImages[image.src] ? galleryFallback : image.src}
                    alt={image.alt || image.caption}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="gallery-item-image"
                    onError={() => {
                      if (!failedImages[image.src]) {
                        setFailedImages((previous) => ({ ...previous, [image.src]: true }));
                      }
                    }}
                  />

                  {/* Dark scrim gradient behind typography */}
                  <div className="gallery-item-info">
                    <span className="gallery-category-badge">
                      {image.category.toUpperCase()}
                    </span>
                    <strong className="gallery-caption-text">
                      {image.caption}
                    </strong>
                  </div>

                  <span className="gallery-item-zoom" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="gallery-pagination page-wrap">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                const galleryEl = document.getElementById("gallery");
                if (galleryEl) {
                  galleryEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          </div>
        )}
      </section>

      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <GalleryLightbox photos={filteredImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
