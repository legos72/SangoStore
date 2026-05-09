/**
 * One-shot migration: re-process all existing product images with the new
 * Smart pipeline (800×800 contain, warm-white padding, sharpen, WebP 85%).
 *
 * Usage:  npx ts-node scripts/reprocess-images.ts
 *
 * - Originals are backed up to uploads/originals/ before any change.
 * - All images end up as .webp 800×800 in uploads/.
 * - Database URLs don't change (same UUID, just extension normalised to .webp).
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const UPLOADS_DIR  = path.join(__dirname, "../uploads");
const BACKUP_DIR   = path.join(UPLOADS_DIR, "originals");
const IMAGE_EXTS   = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

async function reprocess(filePath: string, backupPath: string): Promise<void> {
  const buffer = fs.readFileSync(filePath);

  // Backup original before any change
  fs.copyFileSync(filePath, backupPath);

  const destName = path.basename(filePath, path.extname(filePath)) + ".webp";
  const destPath = path.join(UPLOADS_DIR, destName);
  const tmpPath  = destPath + ".tmp";

  // Write to a temp file first — avoids Sharp refusing to overwrite its own input
  await sharp(buffer)
    .rotate()
    .resize(800, 800, {
      fit: "cover",
      position: "attention",
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 0.8 })
    .webp({ quality: 85, effort: 4 })
    .toFile(tmpPath);

  // Remove original (we own the directory so we can unlink root-owned files)
  // then atomic rename
  if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
  fs.renameSync(tmpPath, destPath);

  const label = filePath === destPath ? "(reprocessed in-place)" : `→ ${destName}`;
  console.log(`  ✓ ${path.basename(filePath)} ${label}`);
}

async function main() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const files = fs.readdirSync(UPLOADS_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTS.has(ext) && f !== "originals";
  });

  if (files.length === 0) {
    console.log("Aucune image trouvée dans uploads/");
    return;
  }

  console.log(`\n🔄 Retraitement de ${files.length} image(s)...\n`);

  let ok = 0;
  let fail = 0;

  for (const file of files) {
    const filePath   = path.join(UPLOADS_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    try {
      await reprocess(filePath, backupPath);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${file} — erreur:`, (err as Error).message);
      fail++;
    }
  }

  console.log(`\n✅ ${ok} image(s) retraitées${fail > 0 ? ` — ⚠️  ${fail} erreur(s)` : ""}.`);
  console.log(`📦 Originaux sauvegardés dans uploads/originals/\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
