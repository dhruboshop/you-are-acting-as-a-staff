import { Router } from "express";
import { queryOne } from "../db/pool.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", asyncHandler(async (_req, res) => {
  const stats = await queryOne(
    `select
      (select count(*)::int from shops where deleted_at is null) as shops_count,
      (select count(*)::int from customers) as customers_count,
      (select count(*)::int from shops s join whatsapp_connections wc on wc.shop_id = s.id where wc.status in ('open', 'connected')) as active_shops`
  );
  res.json({ stats });
}));

export default router;
