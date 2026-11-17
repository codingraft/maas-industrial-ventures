import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllSettings, getProjects, getBlogPosts } from "@/lib/db";
import { MediaItem, MasterPlanItem } from "@/lib/types";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

function getFormatFromExt(ext: string): string {
  const clean = ext.replace(/^\./, "").toLowerCase();
  if (clean === "jpeg") return "jpg";
  return clean || "other";
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase().trim() || "";
    const category = searchParams.get("category") || "all";
    const format = searchParams.get("format") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(6, Math.min(100, parseInt(searchParams.get("pageSize") || "24", 10)));

    const mediaMap = new Map<string, MediaItem>();

    // 1. Scan public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      const files = await fs.readdir(uploadsDir, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile()) continue;
        const ext = path.extname(file.name).toLowerCase();
        if (!/\.(jpe?g|png|webp|avif|svg|gif|bmp|tiff|ico)$/i.test(ext)) continue;

        const filePath = path.join(uploadsDir, file.name);
        let sizeBytes = 0;
        let createdAt = new Date().toISOString();

        try {
          const stats = await fs.stat(filePath);
          sizeBytes = stats.size;
          createdAt = stats.mtime.toISOString();
        } catch {
          // ignore stat errors
        }

        const url = `/uploads/${file.name}`;
        mediaMap.set(url, {
          id: `upload-${file.name}`,
          url,
          fileName: file.name,
          source: "uploads",
          format: getFormatFromExt(ext),
          sizeBytes,
          createdAt,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          usageCount: 0,
        });
      }
    } catch {
      // uploads dir might not exist yet, ignore
    }

    // 2. Scan public/images directory for brand assets
    const imagesDir = path.join(process.cwd(), "public", "images");
    try {
      const imgFiles = await fs.readdir(imagesDir, { withFileTypes: true });
      for (const file of imgFiles) {
        if (!file.isFile()) continue;
        const ext = path.extname(file.name).toLowerCase();
        if (!/\.(jpe?g|png|webp|avif|svg|gif)$/i.test(ext)) continue;

        const filePath = path.join(imagesDir, file.name);
        let sizeBytes = 0;
        let createdAt = new Date().toISOString();
        try {
          const stats = await fs.stat(filePath);
          sizeBytes = stats.size;
          createdAt = stats.mtime.toISOString();
        } catch {}

        const url = `/images/${file.name}`;
        mediaMap.set(url, {
          id: `brand-${file.name}`,
          url,
          fileName: file.name,
          source: "branding",
          format: getFormatFromExt(ext),
          sizeBytes,
          createdAt,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          usageCount: 0,
        });
      }
    } catch {}

    // 3. Scan Settings media
    try {
      const settings = await getAllSettings();
      const sMedia = settings?.media;

      if (sMedia?.heroSlides) {
        sMedia.heroSlides.forEach((slide, idx) => {
          if (!slide.src) return;
          const existing = mediaMap.get(slide.src);
          if (existing) {
            existing.usageCount = (existing.usageCount || 0) + 1;
            if (slide.alt) existing.alt = slide.alt;
          } else {
            const ext = path.extname(slide.src) || ".webp";
            mediaMap.set(slide.src, {
              id: `hero-${slide.id || idx}`,
              url: slide.src,
              fileName: path.basename(slide.src) || `hero-slide-${idx + 1}.webp`,
              source: "hero",
              format: getFormatFromExt(ext),
              createdAt: new Date().toISOString(),
              alt: slide.alt || slide.title || "Hero Slide",
              usageCount: 1,
            });
          }
        });
      }

      if (sMedia?.overviewImage?.src) {
        const src = sMedia.overviewImage.src;
        const existing = mediaMap.get(src);
        if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
        else {
          mediaMap.set(src, {
            id: "overview-image",
            url: src,
            fileName: path.basename(src) || "overview.webp",
            source: "hero",
            format: getFormatFromExt(path.extname(src)),
            createdAt: new Date().toISOString(),
            alt: sMedia.overviewImage.alt || "Overview Visual",
            usageCount: 1,
          });
        }
      }

      if (sMedia?.infraImage?.src) {
        const src = sMedia.infraImage.src;
        const existing = mediaMap.get(src);
        if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
        else {
          mediaMap.set(src, {
            id: "infra-image",
            url: src,
            fileName: path.basename(src) || "infrastructure.webp",
            source: "hero",
            format: getFormatFromExt(path.extname(src)),
            createdAt: new Date().toISOString(),
            alt: sMedia.infraImage.alt || "Infrastructure Visual",
            usageCount: 1,
          });
        }
      }

      if (sMedia?.masterplanPlans) {
        sMedia.masterplanPlans.forEach((plan: MasterPlanItem, idx: number) => {
          if (!plan.src) return;
          const existing = mediaMap.get(plan.src);
          if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
          else {
            mediaMap.set(plan.src, {
              id: `plan-${plan.id || idx}`,
              url: plan.src,
              fileName: path.basename(plan.src) || `masterplan-${idx + 1}.webp`,
              source: "hero",
              format: getFormatFromExt(path.extname(plan.src)),
              createdAt: new Date().toISOString(),
              alt: plan.alt || plan.title || "Master Plan Graphic",
              usageCount: 1,
            });
          }
        });
      }

      if (sMedia?.gallery) {
        sMedia.gallery.forEach((g, idx) => {
          if (!g.src) return;
          const existing = mediaMap.get(g.src);
          if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
          else {
            mediaMap.set(g.src, {
              id: `gallery-${g.id || idx}`,
              url: g.src,
              fileName: path.basename(g.src) || `gallery-${idx + 1}.webp`,
              source: "gallery",
              format: getFormatFromExt(path.extname(g.src)),
              createdAt: new Date().toISOString(),
              alt: g.alt || g.caption || "Gallery Photo",
              usageCount: 1,
            });
          }
        });
      }
    } catch {}

    // 4. Scan Projects
    try {
      const projects = await getProjects();
      for (const p of projects) {
        if (p.coverImage) {
          const existing = mediaMap.get(p.coverImage);
          if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
          else {
            mediaMap.set(p.coverImage, {
              id: `project-${p.id}`,
              url: p.coverImage,
              fileName: path.basename(p.coverImage) || `${p.slug}-cover.webp`,
              source: "project",
              format: getFormatFromExt(path.extname(p.coverImage)),
              createdAt: new Date().toISOString(),
              alt: p.title || "Project Cover",
              usageCount: 1,
            });
          }
        }

        if (Array.isArray(p.galleryImages)) {
          p.galleryImages.forEach((gSrc: string, gIdx: number) => {
            if (!gSrc) return;
            const existing = mediaMap.get(gSrc);
            if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
            else {
              mediaMap.set(gSrc, {
                id: `project-gal-${p.id}-${gIdx}`,
                url: gSrc,
                fileName: path.basename(gSrc) || `${p.slug}-gallery-${gIdx}.webp`,
                source: "project",
                format: getFormatFromExt(path.extname(gSrc)),
                createdAt: new Date().toISOString(),
                alt: `${p.title} Gallery ${gIdx + 1}`,
                usageCount: 1,
              });
            }
          });
        }
      }
    } catch {}

    // 5. Scan Blog Posts
    try {
      const blogs = await getBlogPosts();
      for (const b of blogs) {
        if (b.coverImage) {
          const existing = mediaMap.get(b.coverImage);
          if (existing) existing.usageCount = (existing.usageCount || 0) + 1;
          else {
            mediaMap.set(b.coverImage, {
              id: `blog-${b.id}`,
              url: b.coverImage,
              fileName: path.basename(b.coverImage) || `${b.slug}-cover.webp`,
              source: "blog",
              format: getFormatFromExt(path.extname(b.coverImage)),
              createdAt: b.publishedAt || new Date().toISOString(),
              alt: b.title || "Blog Cover",
              usageCount: 1,
            });
          }
        }
      }
    } catch {}

    // Convert map to array
    let allMedia = Array.from(mediaMap.values());

    // Calculate overall stats before filtering
    const stats = {
      totalCount: allMedia.length,
      totalBytes: allMedia.reduce((acc, m) => acc + (m.sizeBytes || 0), 0),
      webpCount: allMedia.filter((m) => m.format === "webp").length,
      uploadsCount: allMedia.filter((m) => m.source === "uploads").length,
    };

    // Apply Search Filter
    if (q) {
      allMedia = allMedia.filter(
        (m) =>
          m.fileName.toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q) ||
          (m.alt && m.alt.toLowerCase().includes(q))
      );
    }

    // Apply Category Filter
    if (category && category !== "all") {
      allMedia = allMedia.filter((m) => m.source === category);
    }

    // Apply Format Filter
    if (format && format !== "all") {
      allMedia = allMedia.filter((m) => m.format === format);
    }

    // Apply Sorting
    allMedia.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === "name") {
        return a.fileName.localeCompare(b.fileName);
      }
      if (sort === "size") {
        return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      }
      // default "newest"
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const totalFiltered = allMedia.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedMedia = allMedia.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      ok: true,
      media: paginatedMedia,
      total: totalFiltered,
      page,
      pageSize,
      totalPages: Math.ceil(totalFiltered / pageSize) || 1,
      stats,
    });
  } catch (error) {
    console.error("GET /api/admin/media error:", error);
    return NextResponse.json({ message: "Failed to load media assets" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "Missing image url" }, { status: 400 });
    }

    // Only allow deleting local uploaded files in /uploads/
    if (url.startsWith("/uploads/")) {
      const fileName = path.basename(url);
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);

      try {
        await fs.unlink(filePath);
        return NextResponse.json({ ok: true, message: "File removed from uploads" });
      } catch (err: unknown) {
        const nodeErr = err as { code?: string };
        if (nodeErr.code === "ENOENT") {
          return NextResponse.json({ ok: true, message: "File was already removed" });
        }
        throw err;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "External or static asset unlinked from view",
    });
  } catch (error) {
    console.error("DELETE /api/admin/media error:", error);
    return NextResponse.json({ message: "Failed to delete asset" }, { status: 500 });
  }
}
