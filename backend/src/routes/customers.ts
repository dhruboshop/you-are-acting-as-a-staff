import { Router } from "express";
import { stringify } from "csv-stringify/sync";
import { query, queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { offset, paginationQuery, shopParam, uuidParam } from "../validators/common.js";
import { customerUpdateSchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);

router.get("/shops/:shopId", asyncHandler(async (req, res) => {
  const { shopId } = shopParam.parse(req.params);
  const { page, pageSize, search } = paginationQuery.parse(req.query);
  const params: unknown[] = [shopId, req.ownerUserId, pageSize, offset(page, pageSize)];
  const searchClause = search ? "and (c.name ilike $5 or c.whatsapp_number ilike $5)" : "";
  if (search) params.push(`%${search}%`);
  const customers = await query(
    `select c.* from customers c
     join shops s on s.id = c.shop_id
     where c.shop_id = $1 and s.owner_user_id = $2 ${searchClause}
     order by c.created_at desc
     limit $3 offset $4`,
    params
  );
  const total = await queryOne<{ count: string }>(
    `select count(*) from customers c join shops s on s.id = c.shop_id
     where c.shop_id = $1 and s.owner_user_id = $2 ${search ? "and (c.name ilike $3 or c.whatsapp_number ilike $3)" : ""}`,
    search ? [shopId, req.ownerUserId, `%${search}%`] : [shopId, req.ownerUserId]
  );
  res.json({ customers, page, pageSize, total: Number(total?.count ?? 0) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const customer = await queryOne(
    `select c.* from customers c join shops s on s.id = c.shop_id
     where c.id = $1 and s.owner_user_id = $2`,
    [id, req.ownerUserId]
  );
  if (!customer) throw new HttpError(404, "Customer not found");
  const transactions = await query(
    "select * from loyalty_transactions where customer_id = $1 order by created_at desc limit 50",
    [id]
  );
  res.json({ customer, transactions });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const body = customerUpdateSchema.parse(req.body);
  const customer = await queryOne(
    `update customers c set
       name = coalesce($3, c.name),
       whatsapp_number = coalesce($4, c.whatsapp_number),
       consent_given = coalesce($5, c.consent_given),
       updated_at = now()
     from shops s
     where c.shop_id = s.id and c.id = $1 and s.owner_user_id = $2
     returning c.*`,
    [id, req.ownerUserId, body.name ?? null, body.whatsappNumber ?? null, body.consent ?? null]
  );
  if (!customer) throw new HttpError(404, "Customer not found");
  res.json({ customer });
}));

router.get("/shops/:shopId/export.csv", asyncHandler(async (req, res) => {
  const { shopId } = shopParam.parse(req.params);
  const customers = await query(
    `select c.name, c.whatsapp_number, c.loyalty_points, c.consent_given, c.created_at
     from customers c join shops s on s.id = c.shop_id
     where c.shop_id = $1 and s.owner_user_id = $2
     order by c.created_at desc`,
    [shopId, req.ownerUserId]
  );
  res.header("content-type", "text/csv");
  res.attachment(`customers-${shopId}.csv`);
  res.send(stringify(customers, { header: true }));
}));

export default router;
