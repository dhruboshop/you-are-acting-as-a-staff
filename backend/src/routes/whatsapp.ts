import { Router } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createInstance,
  deleteInstance,
  disconnectInstance,
  getConnectionStatus,
  getPairingCode,
  normalizeEvolutionStatus,
  type EvolutionConnectionStatus
} from "../services/evolution.service.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { whatsappConnectSchema, whatsappDisconnectSchema, whatsappStatusQuerySchema } from "../validators/schemas.js";

const router = Router();

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

function toObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readNestedString(source: unknown, path: string[]) {
  let current: unknown = source;
  for (const key of path) {
    current = toObject(current)[key];
  }
  return typeof current === "string" && current.trim().length > 0 ? current.trim() : undefined;
}

function findNestedString(source: unknown, keys: string[]): string | undefined {
  if (typeof source === "string" && source.trim()) return source.trim();
  if (!source || typeof source !== "object") return undefined;
  if (Array.isArray(source)) {
    for (const value of source) {
      const result = findNestedString(value, keys);
      if (result) return result;
    }
    return undefined;
  }
  const object = source as Record<string, unknown>;
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  for (const value of Object.values(object)) {
    const result = findNestedString(value, keys);
    if (result) return result;
  }
  return undefined;
}

function normalizePhoneNumber(value: string | undefined) {
  if (!value) return undefined;
  const local = value.split("@")[0] ?? "";
  if (!local) return undefined;
  const digits = local.startsWith("+") ? `+${local.slice(1).replace(/\D/g, "")}` : local.replace(/\D/g, "");
  return /^\+?[1-9]\d{7,14}$/.test(digits) ? digits : undefined;
}

function parseWebhookPayload(payload: unknown) {
  const instanceName =
    readNestedString(payload, ["instance"]) ??
    readNestedString(payload, ["instanceName"]) ??
    readNestedString(payload, ["data", "instance"]) ??
    readNestedString(payload, ["data", "instanceName"]) ??
    readNestedString(payload, ["instance", "instanceName"]) ??
    readNestedString(payload, ["instance", "name"]);
  const rawState =
    readNestedString(payload, ["state"]) ??
    readNestedString(payload, ["status"]) ??
    readNestedString(payload, ["connectionStatus"]) ??
    readNestedString(payload, ["data", "state"]) ??
    readNestedString(payload, ["data", "status"]) ??
    readNestedString(payload, ["data", "connectionStatus"]) ??
    readNestedString(payload, ["instance", "state"]) ??
    readNestedString(payload, ["instance", "status"]) ??
    readNestedString(payload, ["instance", "connectionStatus"]) ??
    findNestedString(payload, ["state", "status", "connectionStatus"]);
  const phoneNumber = normalizePhoneNumber(
    readNestedString(payload, ["data", "owner"]) ??
    readNestedString(payload, ["data", "ownerJid"]) ??
    readNestedString(payload, ["instance", "owner"]) ??
    readNestedString(payload, ["instance", "ownerJid"]) ??
    readNestedString(payload, ["owner"]) ??
    readNestedString(payload, ["ownerJid"])
  );

  return {
    event: readNestedString(payload, ["event"]) ?? readNestedString(payload, ["type"]),
    instanceName,
    status: normalizeEvolutionStatus(rawState),
    phoneNumber
  };
}

async function assertShopOwner(shopId: string, ownerUserId?: string) {
  const shop = await queryOne<{ id: string }>(
    "select id from shops where id = $1 and owner_user_id = $2 and deleted_at is null",
    [shopId, ownerUserId]
  );
  if (!shop) throw new HttpError(404, "Shop not found");
}

router.post("/webhook", asyncHandler(async (req, res) => {
  if (env.EVOLUTION_WEBHOOK_SECRET) {
    const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;
    const token = req.header("x-webhook-secret") ?? queryToken;
    if (token !== env.EVOLUTION_WEBHOOK_SECRET) {
      throw new HttpError(401, "Invalid webhook token");
    }
  }

  const parsed = parseWebhookPayload(req.body);
  logger.info({ event: parsed.event, instanceName: parsed.instanceName, status: parsed.status }, "Evolution webhook received");

  if (!parsed.instanceName) {
    res.status(202).json({ success: true, ignored: true, reason: "missing_instance" });
    return;
  }
  if (parsed.status === "unknown") {
    res.status(202).json({ success: true, ignored: true, reason: "unknown_status", instanceName: parsed.instanceName });
    return;
  }

  const updated = await queryOne<WhatsappConnectionRow>(
    `update whatsapp_connections
     set status = $2,
         phone_number = coalesce($3, phone_number),
         connected_at = case
           when $2 in ('open', 'connected') then coalesce(connected_at, now())
           when $2 in ('disconnected', 'deleted') then null
           else connected_at
         end,
         updated_at = now()
     where instance_name = $1
     returning *`,
    [parsed.instanceName, parsed.status, parsed.phoneNumber ?? null]
  );

  res.json({ success: true, updated: Boolean(updated), status: parsed.status, connection: updated });
}));

router.use(requireAuth);

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
