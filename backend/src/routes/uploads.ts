import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { authenticate } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export const uploadsRouter = Router();

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Store in memory first so sharp can process before saving to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760") }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError("Type de fichier non autorisé. Formats acceptés : jpg, png, webp", 400));
    }
    cb(null, true);
  },
});

/**
 * Process an image buffer through sharp:
 * - Convert to WebP for better compression and compatibility
 * - Resize to max 1200px on the longest side (preserving aspect ratio)
 * - Compress at 82% quality
 * Returns the final filename and writes to disk.
 */
async function processAndSave(buffer: Buffer): Promise<string> {
  const filename = `${uuidv4()}.webp`;
  const dest = path.join(UPLOADS_DIR, filename);

  await sharp(buffer)
    .rotate()                    // auto-orient from EXIF
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,  // never upscale
    })
    .webp({ quality: 82 })
    .toFile(dest);

  return filename;
}

// POST /api/uploads/image
uploadsRouter.post("/image", authenticate, upload.single("image"), async (req, res) => {
  if (!req.file) throw new AppError("Aucun fichier reçu", 400);

  const filename = await processAndSave(req.file.buffer);
  const url = `/uploads/${filename}`;

  res.json({ status: "success", url, filename, size: req.file.size });
});

// POST /api/uploads/images (multiple, max 5)
uploadsRouter.post("/images", authenticate, upload.array("images", 5), async (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError("Aucun fichier reçu", 400);
  }

  const filenames = await Promise.all(req.files.map(f => processAndSave(f.buffer)));
  const urls = filenames.map(f => `/uploads/${f}`);

  res.json({ status: "success", urls });
});
