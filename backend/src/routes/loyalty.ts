import { Router } from "express";
import { pool, query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { uuidParam } from "../validators/common.js";
import { loyaltySchema } from "../validators/schemas.js";

const router = Router();
router.use(requireAuth);

async function mutatePoints(req: Parameters<Parameters<typeof asyncHandler>[0]>[0], res: Parameters<Parameters<typeof asyncHandler>[0]>[1], type: "add" | "deduct") {
  const body = loyaltySchema.parse(req.body);
  const client = await pool.connect();
  try {
    await client.query("begin");
    const ownerCheck = await client.query(
      `select c.id, c.loyalty_points from customers c join shops s on s.id = c.shop_id
       where c.id = $1 and s.owner_user_id = $2 for update`,
      [body.customerId, req.ownerUserId]
    );
    const customer = ownerCheck.rows[0] as { id: string; loyalty_points: number } | undefined;
    if (!customer) throw new HttpError(404, "Customer not found");
    const delta = type === "add" ? body.points : -body.points;
    if (customer.loyalty_points + delta < 0) throw new HttpError(400, "Insufficient loyalty points");
    const updated = await client.query(
      "update customers set loyalty_points = loyalty_points + $1, updated_at = now() where id = $2 returning *",
      [delta, body.customerId]
    );
    const transaction = await client.query(
      `insert into loyalty_transactions (customer_id, shop_id, points, transaction_type, reason, created_by)
       select c.id, c.shop_id, $2, $3, $4, $5 from customers c where c.id = $1 returning *`,
      [body.customerId, body.points, type, body.reason, req.ownerUserId]
    );
    await client.query("commit");
    res.json({ customer: updated.rows[0], transaction: transaction.rows[0] });
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

router.post("/add", asyncHandler(async (req, res) => mutatePoints(req, res, "add")));
router.post("/deduct", asyncHandler(async (req, res) => mutatePoints(req, res, "deduct")));

router.get("/customers/:id/transactions", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const transactions = await query(
    `select lt.* from loyalty_transactions lt
     join shops s on s.id = lt.shop_id
     where lt.customer_id = $1 and s.owner_user_id = $2
     order by lt.created_at desc`,
    [id, req.ownerUserId]
  );
  res.json({ transactions });
}));

export default router;
