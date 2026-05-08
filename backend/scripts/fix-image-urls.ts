/**
 * Fix product image URLs after the reprocess-images migration.
 * Converts .jpg / .jpeg → .webp in the images[] array for all products.
 */

import { pool } from "../src/config/database";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const client = await pool.connect();
  try {
    // Preview what will change
    const preview = await client.query(`
      SELECT id, title, images
      FROM products
      WHERE EXISTS (
        SELECT 1 FROM unnest(images) AS img
        WHERE img ~* '\\.(jpg|jpeg)'
      )
    `);

    if (preview.rows.length === 0) {
      console.log("✅ Aucune URL à corriger — toutes les images sont déjà en .webp");
      return;
    }

    console.log(`\n🔍 ${preview.rows.length} produit(s) à corriger:\n`);
    for (const row of preview.rows) {
      console.log(`  [${row.id}] ${row.title}`);
      for (const img of row.images) {
        if (/\.(jpg|jpeg)/i.test(img)) {
          console.log(`    ✗ ${img}  →  ${img.replace(/\.(jpg|jpeg)$/i, ".webp")}`);
        }
      }
    }

    // Apply the fix
    const result = await client.query(`
      UPDATE products
      SET images = ARRAY(
        SELECT regexp_replace(img, '\\.(jpg|jpeg)$', '.webp', 'i')
        FROM unnest(images) AS img
      )
      WHERE EXISTS (
        SELECT 1 FROM unnest(images) AS img
        WHERE img ~* '\\.(jpg|jpeg)'
      )
    `);

    console.log(`\n✅ ${result.rowCount} produit(s) mis à jour.\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
