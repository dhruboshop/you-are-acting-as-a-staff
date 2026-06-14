import { Router } from "express";
import { pool, query, queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { campaignTemplates, renderTemplate } from "../services/campaignTemplates.js";
import { sendText } from "../services/evolutionApi.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { shopParam, uuidParam } from "../validators/common.js";
import { campaignSchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);

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
  const shop = await queryOne<{ id: string }>("select id from shops where id = $1 and owner_user_id = $2", [body.shopId, req.ownerUserId]);
  if (!shop) throw new HttpError(404, "Shop not found");
  const campaign = await queryOne(
    `insert into campaigns (shop_id, template_key, title, message, target, status, created_by)
     values ($1, $2, $3, $4, $5, 'draft', $6) returning *`,
    [body.shopId, body.templateKey, body.title, body.message, body.target, req.ownerUserId]
  );
  res.status(201).json({ campaign });
}));

router.post("/:id/send", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const client = await pool.connect();
  try {
    const campaignResult = await client.query(
      `select ca.*, s.name as shop_name, ws.instance_name, ws.status as whatsapp_status
       from campaigns ca
       join shops s on s.id = ca.shop_id
       left join whatsapp_sessions ws on ws.shop_id = s.id
       where ca.id = $1 and s.owner_user_id = $2`,
      [id, req.ownerUserId]
    );
    const campaign = campaignResult.rows[0] as { id: string; shop_id: string; shop_name: string; message: string; target: string; instance_name?: string; whatsapp_status?: string } | undefined;
    if (!campaign) throw new HttpError(404, "Campaign not found");
    if (!campaign.instance_name || campaign.whatsapp_status === "disconnected") throw new HttpError(400, "Connect WhatsApp before sending");

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
        failed += 1;
      }
    }
    const status = failed > 0 ? "partial" : "sent";
    const updated = await queryOne("update campaigns set status = $2, sent_count = $3, failed_count = $4, updated_at = now() where id = $1 returning *", [id, status, sent, failed]);
    res.json({ campaign: updated, sent, failed });
  } finally {
    client.release();
  }
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
