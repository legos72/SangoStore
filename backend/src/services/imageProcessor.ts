/**
 * Smart image processing pipeline — 3 tiers of quality enhancement.
 *
 * Tier 1 (always active)  — Sharp:       square 800×800 canvas, warm-white padding,
 *                                         sharpening, WebP 85% → no crop ever.
 * Tier 2 (REMOVE_BG_API_KEY set) — remove.bg: AI background removal before Tier 1.
 * Tier 3 (CLOUDINARY_* set)      — Cloudinary: CDN upload with AI smart-crop,
 *                                         subject centering, auto enhancement.
 *
 * Priority: Tier 3 > Tier 2+1 > Tier 1 alone.
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Crée le dossier uploads s'il n'existe pas (absent sur serveur après git pull car ignoré par .gitignore)
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Tier 1 : Sharp ──────────────────────────────────────────────────────────

async function processWithSharp(buffer: Buffer): Promise<string> {
  const filename = `${uuidv4()}.webp`;
  const dest = path.join(UPLOADS_DIR, filename);

  // Step 1 — fix EXIF orientation
  const oriented = await sharp(buffer).rotate().toBuffer();

  // Step 2 — smart trim: remove near-background edges so the product fills
  // more of the frame. Works from every edge inward, stopping the moment it
  // hits a row/column that is NOT near-background, so the product itself is
  // never cropped. Fall back to the oriented buffer if trim goes wrong.
  let source = oriented;
  try {
    const { width: w0, height: h0 } = await sharp(oriented).metadata();
    const trimmed = await sharp(oriented).trim({ threshold: 30 }).toBuffer();
    const { width: w1, height: h1 } = await sharp(trimmed).metadata();
    // Accept only if at least 30% of original area is kept
    if (((w1 ?? 1) * (h1 ?? 1)) / ((w0 ?? 1) * (h0 ?? 1)) >= 0.30) {
      source = trimmed;
    }
  } catch { /* keep oriented */ }

  // Step 3 — pad to exactly 800×800 square with white background.
  // The subject is never cropped; CSS object-cover fills the card cleanly.
  await sharp(source)
    .resize(800, 800, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .sharpen({ sigma: 0.8 })
    .webp({ quality: 85, effort: 4 })
    .toFile(dest);

  return `/uploads/${filename}`;
}

// ─── Tier 2 : remove.bg background removal ───────────────────────────────────

async function removeBackground(buffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) return buffer;

  try {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "image/jpeg" });
    formData.append("image_file", blob, "image.jpg");
    formData.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });

    if (!res.ok) {
      console.warn(`[imageProcessor] remove.bg error ${res.status} — skipping background removal`);
      return buffer;
    }

    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.warn("[imageProcessor] remove.bg unreachable — skipping background removal", err);
    return buffer;
  }
}

// ─── Tier 3 : Cloudinary ─────────────────────────────────────────────────────

async function tryCloudinaryUpload(buffer: Buffer): Promise<string | null> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key:    CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "sangostore/products",
          transformation: [
            // Step 1 — smart pad: detect subject, center it, white square canvas
            {
              width: 800, height: 800,
              crop: "pad",
              background: "white",
              gravity: "auto",        // Cloudinary AI subject detection
            },
            // Step 2 — auto-enhance brightness / contrast
            { effect: "improve:50" },
            // Step 3 — subtle sharpening
            { effect: "sharpen:40" },
          ],
          format: "webp",
          quality: "auto:good",
        },
        (err: any, res: any) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    return result.secure_url as string;
  } catch (err) {
    console.warn("[imageProcessor] Cloudinary upload failed — falling back to Sharp", err);
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Process a raw image buffer through the best available pipeline.
 * Returns a URL (either absolute Cloudinary CDN URL or relative /uploads path).
 */
export async function processImage(buffer: Buffer): Promise<string> {
  // Tier 3 — Cloudinary handles everything (AI crop + enhance + CDN)
  const cloudinaryUrl = await tryCloudinaryUpload(buffer);
  if (cloudinaryUrl) return cloudinaryUrl;

  // Tier 2+1 — local: strip background then Sharp-normalise
  const cleaned = await removeBackground(buffer);
  return processWithSharp(cleaned);
}
