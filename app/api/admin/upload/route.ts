import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import sharp from "sharp";
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

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const fileExt = (path.extname(file.name) || "").toLowerCase();
    const isAllowedImage =
      ALLOWED_MIME_TYPES.has(file.type) &&
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

    let buffer: Buffer;
    try {
      buffer = await sharp(Buffer.from(await file.arrayBuffer()), {
        animated: true,
        limitInputPixels: 40_000_000,
      }).rotate().webp({ quality: 85 }).toBuffer();
    } catch {
      return NextResponse.json({ message: "This image could not be decoded safely." }, { status: 400 });
    }

    // 1. Cloudinary upload if configured (production CDN)
    if (isCloudinaryConfigured()) {
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

    if (isVercel) {
      return NextResponse.json({ message: "Configure Cloudinary for hosted uploads." }, { status: 503 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = path.extname(file.name) || ".jpg";
    const sanitizedBase = path
      .basename(file.name, rawExt)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const fileName = `${sanitizedBase}_${Date.now()}.webp`;
    const destinationPath = path.join(uploadsDir, fileName);

    await fs.writeFile(destinationPath, buffer);

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
