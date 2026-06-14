import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const startedAt = Date.now();
  await pool.query("select 1");
  res.json({ status: "ok", database: "ok", latencyMs: Date.now() - startedAt });
}));

export default router;
