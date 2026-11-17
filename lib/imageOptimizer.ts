/**
 * Client-side Image Optimization Utility
 * Automatically converts any standard image (JPEG, PNG, AVIF, BMP, TIFF, HEIC, etc.)
 * into high-performance, compressed WebP format before uploading to the server.
 *
 * Benefits:
 * - Accepts all image types from user devices (camera photos, DSLR, screenshots, web images)
 * - Drastically reduces upload bandwidth & time (e.g. 8MB PNG -> 180KB WebP)
 * - Preserves crisp quality while protecting server/CDN storage and memory
 * - Preserves vector SVGs and animated GIFs as-is without rasterizing
 */

export interface ImageOptimizationOptions {
  maxDimension?: number;
  quality?: number;
}

export async function optimizeImageBeforeUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const { maxDimension = 2560, quality = 0.85 } = options;

  // 1. Keep SVGs and animated GIFs in original form
  const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
  if (isSvg || isGif) {
    return file;
  }

  // 2. Ensure running in browser environment with Canvas support
  if (typeof window === "undefined" || !window.HTMLCanvasElement) {
    return file;
  }

  // 3. Ensure file is an image
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|avif|bmp|tiff|heic|heif)$/i.test(file.name)) {
    return file;
  }

  try {
    return await new Promise<File>((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { naturalWidth: width, naturalHeight: height } = img;
        if (!width || !height) {
          width = img.width;
          height = img.height;
        }

        // Proportionally scale down if exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        // Apply high-quality bicubic resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas rendering to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // Derive safe filename with .webp extension
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const optimizedFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            // If the original file was already smaller WebP, keep original
            if (file.type === "image/webp" && file.size <= optimizedFile.size) {
              return resolve(file);
            }

            resolve(optimizedFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback to original file on decode error
        resolve(file);
      };

      img.src = objectUrl;
    });
  } catch (err) {
    console.warn("Image optimization fallback:", err);
    return file;
  }
}

/**
 * Universal upload helper that optimizes the image to WebP before sending to /api/admin/upload
 */
export async function uploadImage(file: File, options: ImageOptimizationOptions = {}): Promise<string> {
  const optimizedFile = await optimizeImageBeforeUpload(file, options);

  const formData = new FormData();
  formData.append("file", optimizedFile);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to upload image");
  }

  return data.url;
}
