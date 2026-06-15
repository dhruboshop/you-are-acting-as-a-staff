import { Router } from "express";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

const messageSchema = z.object({
  customerName: z.string().min(1).max(120),
  businessName: z.string().min(1).max(120),
  businessCategory: z.string().min(1).max(80),
  city: z.string().min(1).max(80),
  campaignType: z.enum(["birthday", "anniversary", "festival", "feedback", "promotional"]),
  festivalName: z.string().max(80).optional(),
  offerDetails: z.string().max(240).optional(),
  tone: z.enum(["friendly", "professional", "premium", "luxury", "local_business"]).default("friendly")
});

router.post("/message-variants", asyncHandler(async (req, res) => {
  const body = messageSchema.parse(req.body);
  if (!env.GROQ_API_KEY) {
    res.json({
      variants: [
        `Hi ${body.customerName}, ${body.businessName} has something special for you. Visit us in ${body.city} this week.`,
        `Dear ${body.customerName}, thank you for being part of ${body.businessName}. We would love to see you again soon.`,
        `${body.customerName}, a warm note from ${body.businessName}: your next visit has a small surprise waiting.`
      ]
    });
    return;
  }

  const prompt = `Generate 3 concise WhatsApp message variants. Avoid spammy wording and excessive emoji. Context: customer=${body.customerName}, business=${body.businessName}, category=${body.businessCategory}, city=${body.city}, campaign=${body.campaignType}, festival=${body.festivalName ?? "none"}, offer=${body.offerDetails ?? "none"}, tone=${body.tone}. Return only a JSON array of strings.`;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(response.status, payload.error?.message ?? "Groq request failed", payload);
  const content = payload.choices?.[0]?.message?.content ?? "[]";
  const variants = JSON.parse(content) as string[];
  res.json({ variants });
}));

export default router;
