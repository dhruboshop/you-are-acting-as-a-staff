import { Router } from "express";
import QRCode from "qrcode";
import { env } from "../config/env.js";
import { query, queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { uuidParam } from "../validators/common.js";
import { shopCreateSchema, shopUpdateSchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const shops = await query(
    `select s.*,
      (select count(*)::int from customers c where c.shop_id = s.id) as total_customers,
      (select count(*)::int from campaigns ca where ca.shop_id = s.id) as total_campaigns,
      (select count(*)::int from customers c where c.shop_id = s.id and c.loyalty_points > 0) as total_loyalty_members
     from shops s
     where s.owner_user_id = $1 and s.deleted_at is null
     order by s.created_at desc`,
    [req.ownerUserId]
  );
  res.json({ shops });
}));

router.post("/", asyncHandler(async (req, res) => {
  const body = shopCreateSchema.parse(req.body);
  const shop = await queryOne(
    `insert into shops (owner_user_id, name, phone, address, logo_url, settings)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [req.ownerUserId, body.name, body.phone ?? null, body.address ?? null, body.logoUrl ?? null, body.settings]
  );
  res.status(201).json({ shop });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const shop = await queryOne(
    `select s.*,
      (select count(*)::int from customers c where c.shop_id = s.id) as total_customers,
      (select count(*)::int from campaigns ca where ca.shop_id = s.id) as total_campaigns,
      (select count(*)::int from customers c where c.shop_id = s.id and c.loyalty_points > 0) as total_loyalty_members
     from shops s where s.id = $1 and s.owner_user_id = $2 and s.deleted_at is null`,
    [id, req.ownerUserId]
  );
  if (!shop) throw new HttpError(404, "Shop not found");
  res.json({ shop });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const body = shopUpdateSchema.parse(req.body);
  const current = await queryOne<{ id: string }>(
    "select id from shops where id = $1 and owner_user_id = $2 and deleted_at is null",
    [id, req.ownerUserId]
  );
  if (!current) throw new HttpError(404, "Shop not found");
  const shop = await queryOne(
    `update shops set
       name = coalesce($3, name),
       phone = coalesce($4, phone),
       address = coalesce($5, address),
       logo_url = coalesce($6, logo_url),
       settings = coalesce($7, settings),
       updated_at = now()
     where id = $1 and owner_user_id = $2
     returning *`,
    [id, req.ownerUserId, body.name ?? null, body.phone ?? null, body.address ?? null, body.logoUrl ?? null, body.settings ?? null]
  );
  res.json({ shop });
}));

router.get("/:id/qr", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const shop = await queryOne<{ id: string; name: string }>(
    "select id, name from shops where id = $1 and owner_user_id = $2 and deleted_at is null",
    [id, req.ownerUserId]
  );
  if (!shop) throw new HttpError(404, "Shop not found");
  const registrationUrl = `${env.API_BASE_URL}/register/${shop.id}`;
  const png = await QRCode.toDataURL(registrationUrl, { margin: 2, width: 1024 });
  res.json({ registrationUrl, pngDataUrl: png });
}));

export default router;
