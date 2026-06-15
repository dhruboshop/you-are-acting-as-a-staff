import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { generateAnniversaryMessage, generateBirthdayMessage, generateFestivalMessage, generateWinbackMessage } from "../services/groq.service.js";
import { asyncHandler } from "../utils/http.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

const messageSchema = z.object({
  customerName: z.string().min(1).max(120),
  businessName: z.string().min(1).max(120),
  businessCategory: z.string().min(1).max(80).optional(),
  city: z.string().min(1).max(80).optional(),
  campaignType: z.enum(["birthday", "anniversary", "festival", "winback"]),
  festivalName: z.string().max(80).optional(),
  offerDetails: z.string().max(240).optional()
});

router.post("/message-variants", asyncHandler(async (req, res) => {
  const body = messageSchema.parse(req.body);
  const variants =
    body.campaignType === "birthday"
      ? await generateBirthdayMessage(body)
      : body.campaignType === "anniversary"
        ? await generateAnniversaryMessage(body)
      : body.campaignType === "festival"
        ? await generateFestivalMessage(body)
        : await generateWinbackMessage(body);
  res.json({ variants });
}));

export default router;
