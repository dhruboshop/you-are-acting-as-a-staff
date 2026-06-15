import { Router } from "express";
import { queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createInstance,
  deleteInstance,
  disconnectInstance,
  getConnectionStatus,
  getPairingCode,
  type EvolutionConnectionStatus
} from "../services/evolution.service.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { whatsappConnectSchema, whatsappDisconnectSchema, whatsappStatusQuerySchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);

interface WhatsappConnectionRow {
  id: string;
  shop_id: string;
  instance_name: string;
  phone_number: string | null;
  status: EvolutionConnectionStatus;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

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

  const instance = await createInstance(body.shopId);
  const pairing = await getPairingCode(instance.instanceName);
  const connection = await queryOne<WhatsappConnectionRow>(
    `insert into whatsapp_connections (shop_id, instance_name, status, connected_at)
     values ($1, $2, 'connecting', null)
     on conflict (shop_id) do update set
       instance_name = excluded.instance_name,
       status = 'connecting',
       updated_at = now()
     returning *`,
    [body.shopId, instance.instanceName]
  );

  res.status(201).json({
    connection,
    pairingCode: pairing.pairingCode ?? null,
    qrCode: pairing.qrCode ?? null,
    evolution: {
      create: instance.raw,
      pairing: pairing.raw
    }
  });
}));

router.get("/status", asyncHandler(async (req, res) => {
  const { shopId } = whatsappStatusQuerySchema.parse(req.query);
  await assertShopOwner(shopId, req.ownerUserId);
  const connection = await queryOne<WhatsappConnectionRow>(
    "select * from whatsapp_connections where shop_id = $1",
    [shopId]
  );
  if (!connection) {
    res.json({ status: "not_connected", connection: null });
    return;
  }
  const statusResult = await getConnectionStatus(connection.instance_name);
  const status = statusResult.status;
  const updated = await queryOne<WhatsappConnectionRow>(
    `update whatsapp_connections
     set status = $2,
         phone_number = coalesce($3, phone_number),
         connected_at = case when $2 in ('open', 'connected') then coalesce(connected_at, now()) else connected_at end,
         updated_at = now()
     where shop_id = $1
     returning *`,
    [shopId, status, statusResult.phoneNumber ?? null]
  );
  res.json({ status, connection: updated, evolution: statusResult.raw });
}));

router.post("/disconnect", asyncHandler(async (req, res) => {
  const { shopId, deleteInstance: shouldDeleteInstance } = whatsappDisconnectSchema.parse(req.body);
  await assertShopOwner(shopId, req.ownerUserId);
  const connection = await queryOne<WhatsappConnectionRow>("select * from whatsapp_connections where shop_id = $1", [shopId]);
  if (!connection) throw new HttpError(404, "WhatsApp connection not found");

  await disconnectInstance(connection.instance_name);
  if (shouldDeleteInstance) {
    await deleteInstance(connection.instance_name);
  }

  const status = shouldDeleteInstance ? "deleted" : "disconnected";
  const updated = await queryOne<WhatsappConnectionRow>(
    `update whatsapp_connections
     set status = $2,
         connected_at = null,
         updated_at = now()
     where shop_id = $1
     returning *`,
    [shopId, status]
  );
  res.json({ status, connection: updated });
}));

export default router;
