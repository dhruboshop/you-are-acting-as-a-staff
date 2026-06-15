import { z } from "zod";

export const shopCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(24).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional().default({})
});

export const shopUpdateSchema = shopCreateSchema.partial();

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  whatsappNumber: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, "Use an E.164-like WhatsApp number"),
  birthday: z.string().date().optional().nullable(),
  anniversary: z.string().date().optional().nullable(),
  feedbackRating: z.number().int().min(1).max(5).optional().nullable(),
  feedbackText: z.string().trim().max(500).optional().nullable(),
  consent: z.literal(true)
});

export const customerUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  whatsappNumber: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/).optional(),
  consent: z.boolean().optional()
});

export const loyaltySchema = z.object({
  customerId: z.string().uuid(),
  points: z.number().int().positive().max(100000),
  reason: z.string().trim().min(2).max(180)
});

export const campaignSchema = z.object({
  shopId: z.string().uuid(),
  templateKey: z.enum(["durga_puja", "diwali", "eid", "christmas", "new_year"]),
  title: z.string().trim().min(2).max(140),
  message: z.string().trim().min(2).max(1000),
  target: z.enum(["all", "loyalty_members"]).default("all")
});

export const whatsappConnectSchema = z.object({
  shopId: z.string().uuid(),
  instanceName: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_-]+$/)
});
