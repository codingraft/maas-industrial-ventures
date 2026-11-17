import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  "image/x-icon",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".svg",
  ".gif",
  ".bmp",
  ".tiff",
  ".heic",
  ".heif",
  ".ico",
]);

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const fileExt = (path.extname(file.name) || "").toLowerCase();
    const isAllowedImage =
      file.type.startsWith("image/") ||
      ALLOWED_MIME_TYPES.has(file.type) ||
      ALLOWED_EXTENSIONS.has(fileExt);

    if (!isAllowedImage) {
      return NextResponse.json(
        { message: "Invalid file type. Only image files (JPG, PNG, WEBP, AVIF, SVG, GIF, etc.) are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "File exceeds 15MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    // 1. Cloudinary upload if configured (production CDN)
    if (isCloudinaryConfigured()) {
      const buffer = Buffer.from(bytes);
      const rawExt = path.extname(file.name) || ".jpg";
      const sanitizedBase = path
        .basename(file.name, rawExt)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const publicId = `${sanitizedBase}_${Date.now()}`;

      const uploaded = await uploadToCloudinary(buffer, {
        folder: "maas_ventures",
        public_id: publicId,
      });

      return NextResponse.json({
        ok: true,
        url: uploaded.secure_url,
        fileName: file.name,
      });
    }

    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    // 2. Fallback on Vercel serverless when Cloudinary is not yet configured:
    // Return base64 data URL so uploads still work without external setup
    if (isVercel) {
      const mime = file.type || "image/jpeg";
      const base64 = Buffer.from(bytes).toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({
        ok: true,
        url: dataUrl,
        fileName: file.name,
      });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = path.extname(file.name) || ".jpg";
    const sanitizedBase = path
      .basename(file.name, rawExt)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const fileName = `${sanitizedBase}_${Date.now()}${rawExt.toLowerCase()}`;
    const destinationPath = path.join(uploadsDir, fileName);

    await fs.writeFile(destinationPath, Buffer.from(bytes));

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
