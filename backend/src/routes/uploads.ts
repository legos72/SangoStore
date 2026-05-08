import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { processImage } from "../services/imageProcessor";

export const uploadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760") },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError("Type de fichier non autorisé. Formats acceptés : jpg, png, webp, heic", 400));
    }
    cb(null, true);
  },
});

// POST /api/uploads/image
uploadsRouter.post("/image", authenticate, upload.single("image"), async (req, res) => {
  if (!req.file) throw new AppError("Aucun fichier reçu", 400);

  const url = await processImage(req.file.buffer);
  const filename = url.split("/").pop() ?? url;

  res.json({ status: "success", url, filename, size: req.file.size });
});

// POST /api/uploads/images (multiple, max 5)
uploadsRouter.post("/images", authenticate, upload.array("images", 5), async (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError("Aucun fichier reçu", 400);
  }

  const urls = await Promise.all(req.files.map(f => processImage(f.buffer)));
  res.json({ status: "success", urls });
});
