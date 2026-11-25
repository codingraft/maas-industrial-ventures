"use client";

import Image from "next/image";
import { useState } from "react";
import { GalleryLightbox } from "./GalleryLightbox";

export function ProjectPhotoGrid({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="gallery-compact-grid">
      {images.map((src, index) => (
        <button key={index} type="button" className="gallery-thumb-wrap image-frame"
          onClick={() => setActive(index)} aria-label={`Open project photo ${index + 1}`}>
          <Image src={src} alt={`${title}, photo ${index + 1}`} fill
            sizes="(max-width: 640px) 45vw, 23vw" className="gallery-thumb-img" style={{ objectFit: "cover" }} />
        </button>
      ))}
      {active !== null && <GalleryLightbox initialIndex={active} onClose={() => setActive(null)}
        photos={images.map((src, index) => ({ src, caption: title, alt: `${title}, photo ${index + 1}` }))} />}
    </div>
  );
}
