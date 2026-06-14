import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "../db/pool.js";
import { logger } from "../config/logger.js";

const migrationPath = join(process.cwd(), "..", "supabase", "migrations", "001_initial_schema.sql");

try {
  const sql = await readFile(migrationPath, "utf8");
  await pool.query(sql);
  logger.info({ migrationPath }, "Migration applied");
} finally {
  await pool.end();
}
