import fs from "fs";
import path from "path";
import { pool } from "./database";

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "migrate_promotions.sql"), "utf-8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("✅  Promotions migration complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌  Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
