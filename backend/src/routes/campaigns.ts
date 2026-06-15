import { Router } from "express";
import { pool, query, queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { campaignTemplates, renderTemplate } from "../services/campaignTemplates.js";
import { sendText } from "../services/evolution.service.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { shopParam, uuidParam } from "../validators/common.js";
import { campaignSchema } from "../validators/schemas.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

type MerchantStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "BLOCKED";

function assertCampaignAllowed(merchantStatus?: MerchantStatus) {
  if (merchantStatus === "EXPIRED") {
    throw new HttpError(402, "Your trial has expired. Activate your shop to send campaigns.");
  }
  if (merchantStatus === "BLOCKED") {
    throw new HttpError(403, "Campaign sending is blocked for this shop. Contact support.");
  }
}

router.get("/templates", asyncHandler(async (_req, res) => {
  res.json({ templates: campaignTemplates });
}));

router.get("/shops/:shopId", asyncHandler(async (req, res) => {
  const { shopId } = shopParam.parse(req.params);
  const campaigns = await query(
    `select ca.* from campaigns ca join shops s on s.id = ca.shop_id
     where ca.shop_id = $1 and s.owner_user_id = $2
     order by ca.created_at desc`,
    [shopId, req.ownerUserId]
  );
  res.json({ campaigns });
}));

router.post("/preview", asyncHandler(async (req, res) => {
  const body = campaignSchema.parse(req.body);
  const shop = await queryOne<{ name: string }>("select name from shops where id = $1 and owner_user_id = $2", [body.shopId, req.ownerUserId]);
  if (!shop) throw new HttpError(404, "Shop not found");
  res.json({ preview: renderTemplate(body.message, shop.name, "Customer Name") });
}));

router.post("/", asyncHandler(async (req, res) => {
  const body = campaignSchema.parse(req.body);
  const shop = await queryOne<{ id: string; merchant_status: MerchantStatus }>(
    "select id, merchant_status from shops where id = $1 and owner_user_id = $2",
    [body.shopId, req.ownerUserId]
  );
  if (!shop) throw new HttpError(404, "Shop not found");
  assertCampaignAllowed(shop.merchant_status);
  const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  const status = scheduledAt && scheduledAt.getTime() > Date.now() ? "scheduled" : "draft";
  const campaign = await queryOne(
    `insert into campaigns (shop_id, template_key, title, message, target, status, scheduled_at, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
    [body.shopId, body.templateKey, body.title, body.message, body.target, status, scheduledAt, req.ownerUserId]
  );
  res.status(201).json({ campaign });
}));

router.post("/:id/send", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const client = await pool.connect();
  try {
    const campaignResult = await client.query(
      `select ca.*, s.name as shop_name, s.merchant_status, wc.instance_name, wc.status as whatsapp_status
       from campaigns ca
       join shops s on s.id = ca.shop_id
       left join whatsapp_connections wc on wc.shop_id = s.id
       where ca.id = $1 and s.owner_user_id = $2`,
      [id, req.ownerUserId]
    );
    const campaign = campaignResult.rows[0] as { id: string; shop_id: string; shop_name: string; merchant_status: MerchantStatus; message: string; target: string; instance_name?: string; whatsapp_status?: string; retry_count?: number; max_retries?: number } | undefined;
    if (!campaign) throw new HttpError(404, "Campaign not found");
    assertCampaignAllowed(campaign.merchant_status);
    if (!campaign.instance_name || !["open", "connected"].includes(campaign.whatsapp_status ?? "")) {
      throw new HttpError(400, "Connect WhatsApp before sending");
    }

    const customerResult = await client.query(
      `select id, name, whatsapp_number from customers
       where shop_id = $1 and consent_given = true ${campaign.target === "loyalty_members" ? "and loyalty_points > 0" : ""}
       order by created_at asc`,
      [campaign.shop_id]
    );
    await client.query("update campaigns set status = 'sending', sent_at = now(), updated_at = now() where id = $1", [id]);

    let sent = 0;
    let failed = 0;
    for (const customer of customerResult.rows as Array<{ id: string; name: string; whatsapp_number: string }>) {
      const message = renderTemplate(campaign.message, campaign.shop_name, customer.name);
      try {
        await sendText(campaign.instance_name, customer.whatsapp_number, message);
        await client.query(
          "insert into campaign_logs (campaign_id, customer_id, whatsapp_number, status, sent_at) values ($1, $2, $3, 'sent', now())",
          [id, customer.id, customer.whatsapp_number]
        );
        sent += 1;
      } catch (error) {
        await client.query(
          "insert into campaign_logs (campaign_id, customer_id, whatsapp_number, status, error_message) values ($1, $2, $3, 'failed', $4)",
          [id, customer.id, customer.whatsapp_number, error instanceof Error ? error.message : "Unknown error"]
        );
        const retryCount = Number(campaign.retry_count ?? 0);
        const maxRetries = Number(campaign.max_retries ?? 1);
        if (retryCount < maxRetries) {
          try {
            await sendText(campaign.instance_name, customer.whatsapp_number, message);
            await client.query(
              "insert into campaign_logs (campaign_id, customer_id, whatsapp_number, status, sent_at) values ($1, $2, $3, 'sent', now())",
              [id, customer.id, customer.whatsapp_number]
            );
            sent += 1;
            continue;
          } catch {
            // Record the original send error below; this keeps retry behavior simple for MVP.
          }
        }
        failed += 1;
      }
    }
    const status = failed > 0 ? "partial" : "sent";
    const updated = await queryOne(
      "update campaigns set status = $2, sent_count = $3, failed_count = $4, retry_count = retry_count + case when $4 > 0 then 1 else 0 end, updated_at = now() where id = $1 returning *",
      [id, status, sent, failed]
    );
    res.json({ campaign: updated, sent, failed });
  } finally {
    client.release();
  }
}));

router.post("/scheduled/send-due", asyncHandler(async (req, res) => {
  const shopId = z.object({ shopId: z.string().uuid() }).parse(req.body).shopId;
  const dueCampaign = await queryOne<{ id: string }>(
    `select ca.id
     from campaigns ca
     join shops s on s.id = ca.shop_id
     where ca.shop_id = $1
       and s.owner_user_id = $2
       and s.merchant_status in ('TRIAL', 'ACTIVE')
       and ca.status = 'scheduled'
       and ca.scheduled_at <= now()
     order by ca.scheduled_at asc
     limit 1`,
    [shopId, req.ownerUserId]
  );
  if (!dueCampaign) {
    res.json({ sent: 0, campaign: null });
    return;
  }
  res.json({ sent: 0, campaign: dueCampaign, nextAction: `POST /api/campaigns/${dueCampaign.id}/send` });
}));

router.get("/:id/logs", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const logs = await query(
    `select cl.* from campaign_logs cl
     join campaigns ca on ca.id = cl.campaign_id
     join shops s on s.id = ca.shop_id
     where cl.campaign_id = $1 and s.owner_user_id = $2
     order by cl.created_at desc`,
    [id, req.ownerUserId]
  );
  res.json({ logs });
}));

export default router;
