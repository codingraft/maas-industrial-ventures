import { useState } from "react";
import Image from "next/image";
import { MediaPickerModal } from "./MediaPickerModal";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProjectGalleryField({ images, onChange }: Props) {
  const [target, setTarget] = useState<number | "new" | null>(null);

  function move(index: number, offset: number) {
    const next = [...images];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }

  return (
    <section className="admin-field admin-field-full" aria-labelledby="project-gallery-label">
      <h3 id="project-gallery-label">Site progress gallery images</h3>
      <p className="label-hint">Photos appear on the project page in this order. Save the project to publish your changes.</p>
      <div className="project-gallery-editor">
        {images.map((src, index) => (
          <div className="project-gallery-entry" key={index} role="group" aria-label={`Photo ${index + 1}`}>
            <Image src={src} alt={`Project gallery photo ${index + 1}`} width={180} height={110} />
            <div className="project-gallery-tools">
              <button type="button" className="btn-minimal" onClick={() => setTarget(index)}>Replace</button>
              <button type="button" className="btn-minimal" onClick={() => onChange(images.filter((_, i) => i !== index))}>Remove</button>
              <button type="button" className="btn-minimal" aria-label="Move earlier" disabled={index === 0} onClick={() => move(index, -1)}>←</button>
              <button type="button" className="btn-minimal" aria-label="Move later" disabled={index === images.length - 1} onClick={() => move(index, 1)}>→</button>
            </div>
          </div>
        ))}
      </div>
      <div><button type="button" className="admin-btn admin-btn-outline" onClick={() => setTarget("new")}>Add gallery photo</button></div>
      {target !== null && (
        <MediaPickerModal isOpen onClose={() => setTarget(null)}
          title={target === "new" ? "Add gallery photo" : "Replace gallery photo"}
          currentUrl={typeof target === "number" ? images[target] : undefined}
          onSelect={url => onChange(target === "new" ? [...images, url] : images.map((src, i) => i === target ? url : src))}
        />
      )}
    </section>
  );
}
