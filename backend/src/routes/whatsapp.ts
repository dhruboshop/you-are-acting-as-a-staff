import { Router } from "express";
import { queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { createInstance, disconnectInstance, connectionState } from "../services/evolutionApi.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { shopParam } from "../validators/common.js";
import { whatsappConnectSchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);

async function assertShopOwner(shopId: string, ownerUserId?: string) {
  const shop = await queryOne<{ id: string }>(
    "select id from shops where id = $1 and owner_user_id = $2 and deleted_at is null",
    [shopId, ownerUserId]
  );
  if (!shop) throw new HttpError(404, "Shop not found");
}

router.post("/connect", asyncHandler(async (req, res) => {
  const body = whatsappConnectSchema.parse(req.body);
  await assertShopOwner(body.shopId, req.ownerUserId);
  const evolution = await createInstance(body.instanceName);
  const session = await queryOne(
    `insert into whatsapp_sessions (shop_id, instance_name, status, qr_payload, connected_at)
     values ($1, $2, 'connecting', $3, null)
     on conflict (shop_id) do update set
       instance_name = excluded.instance_name,
       status = 'connecting',
       qr_payload = excluded.qr_payload,
       disconnected_at = null,
       updated_at = now()
     returning *`,
    [body.shopId, body.instanceName, evolution.qrcode ?? null]
  );
  res.status(201).json({ session, evolution });
}));

router.get("/shops/:shopId/status", asyncHandler(async (req, res) => {
  const { shopId } = shopParam.parse(req.params);
  await assertShopOwner(shopId, req.ownerUserId);
  const session = await queryOne<{ instance_name: string } & Record<string, unknown>>(
    "select * from whatsapp_sessions where shop_id = $1",
    [shopId]
  );
  if (!session) {
    res.json({ status: "not_connected", session: null });
    return;
  }
  const state = await connectionState(session.instance_name);
  const status = state.instance?.state ?? "unknown";
  const updated = await queryOne(
    "update whatsapp_sessions set status = $2, connected_at = case when $2 = 'open' then coalesce(connected_at, now()) else connected_at end, updated_at = now() where shop_id = $1 returning *",
    [shopId, status]
  );
  res.json({ status, session: updated });
}));

router.post("/shops/:shopId/disconnect", asyncHandler(async (req, res) => {
  const { shopId } = shopParam.parse(req.params);
  await assertShopOwner(shopId, req.ownerUserId);
  const session = await queryOne<{ instance_name: string }>("select instance_name from whatsapp_sessions where shop_id = $1", [shopId]);
  if (!session) throw new HttpError(404, "WhatsApp session not found");
  await disconnectInstance(session.instance_name);
  const updated = await queryOne(
    "update whatsapp_sessions set status = 'disconnected', disconnected_at = now(), updated_at = now() where shop_id = $1 returning *",
    [shopId]
  );
  res.json({ session: updated });
}));

export default router;
