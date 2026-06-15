import { Router } from "express";
import { queryOne } from "../db/pool.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { uuidParam } from "../validators/common.js";
import { customerCreateSchema } from "../validators/schemas.js";

const router = Router();

router.get("/shops/:id", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const shop = await queryOne(
    "select id, name, logo_url, address from shops where id = $1 and deleted_at is null",
    [id]
  );
  if (!shop) throw new HttpError(404, "Shop not found");
  res.json({ shop });
}));

router.post("/shops/:id/customers", asyncHandler(async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const body = customerCreateSchema.parse(req.body);
  const shop = await queryOne<{ id: string }>("select id from shops where id = $1 and deleted_at is null", [id]);
  if (!shop) throw new HttpError(404, "Shop not found");
  const customer = await queryOne(
    `insert into customers (shop_id, name, whatsapp_number, birthday, anniversary, feedback_rating, feedback_text, consent_given, consent_at)
     values ($1, $2, $3, $4, $5, $6, $7, true, now())
     on conflict (shop_id, whatsapp_number) do update set
       name = excluded.name,
       birthday = excluded.birthday,
       anniversary = excluded.anniversary,
       feedback_rating = excluded.feedback_rating,
       feedback_text = excluded.feedback_text,
       consent_given = true,
       consent_at = now(),
       updated_at = now()
     returning id, shop_id, name, whatsapp_number, birthday, anniversary, feedback_rating, feedback_text, created_at`,
    [id, body.name, body.whatsappNumber, body.birthday ?? null, body.anniversary ?? null, body.feedbackRating ?? null, body.feedbackText ?? null]
  );
  res.status(201).json({ customer });
}));

export default router;
