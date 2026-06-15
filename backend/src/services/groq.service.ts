import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

type MessageContext = {
  customerName: string;
  businessName: string;
  businessCategory?: string;
  city?: string;
  offerDetails?: string;
  festivalName?: string;
};

type MvpCampaignKind = "birthday" | "anniversary" | "festival" | "winback";

function fallbackVariants(context: MessageContext, kind: MvpCampaignKind) {
  const customer = context.customerName;
  const business = context.businessName;
  const offer = context.offerDetails ? ` ${context.offerDetails}` : "";
  if (kind === "birthday") {
    return [
      `Happy birthday, ${customer}! ${business} wishes you a wonderful day.${offer}`,
      `${customer}, warm birthday wishes from ${business}. Visit us this week for a small surprise.`,
      `Many happy returns, ${customer}! Your friends at ${business} hope to see you soon.`
    ];
  }
  if (kind === "festival") {
    const festival = context.festivalName ?? "the festive season";
    return [
      `Hi ${customer}, ${business} wishes you a joyful ${festival}.${offer}`,
      `${customer}, celebrate ${festival} with warm wishes from ${business}.`,
      `Happy ${festival}, ${customer}! Thank you for being part of the ${business} family.`
    ];
  }
  if (kind === "anniversary") {
    return [
      `Happy anniversary, ${customer}! ${business} sends warm wishes for your special day.${offer}`,
      `${customer}, wishing you a beautiful anniversary from all of us at ${business}.`,
      `Warm anniversary wishes, ${customer}! Thank you for being part of the ${business} family.`
    ];
  }
  return [
    `Hi ${customer}, we have missed you at ${business}.${offer}`,
    `${customer}, it has been a while. ${business} would love to welcome you back this week.`,
    `Hello ${customer}, your next visit to ${business} has a little surprise waiting.`
  ];
}

function parseVariants(content: string, context: MessageContext, kind: MvpCampaignKind) {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (Array.isArray(parsed)) {
      const variants = parsed.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
      if (variants.length) return variants.slice(0, 3);
    }
  } catch {
    // Fall back below for non-JSON model responses.
  }
  return fallbackVariants(context, kind);
}

async function generateMessageVariants(kind: MvpCampaignKind, context: MessageContext) {
  if (!env.GROQ_API_KEY) {
    return fallbackVariants(context, kind);
  }

  const prompt = [
    "Generate exactly 3 short WhatsApp message variants for a local retail shop.",
    "Return only a JSON array of strings.",
    "Keep each message under 240 characters.",
    "Use a warm merchant voice. Avoid spammy claims, heavy emoji, and markdown.",
    `Campaign type: ${kind}`,
    `Customer: ${context.customerName}`,
    `Business: ${context.businessName}`,
    `Category: ${context.businessCategory ?? "local retail"}`,
    `City: ${context.city ?? "local area"}`,
    `Festival: ${context.festivalName ?? "none"}`,
    `Offer: ${context.offerDetails ?? "none"}`
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 280
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(response.status >= 500 ? 502 : response.status, payload.error?.message ?? "Groq request failed", payload);
  }

  const content = payload.choices?.[0]?.message?.content;
  return parseVariants(typeof content === "string" ? content : "[]", context, kind);
}

export function generateBirthdayMessage(context: MessageContext) {
  return generateMessageVariants("birthday", context);
}

export function generateAnniversaryMessage(context: MessageContext) {
  return generateMessageVariants("anniversary", context);
}

export function generateFestivalMessage(context: MessageContext) {
  return generateMessageVariants("festival", context);
}

export function generateWinbackMessage(context: MessageContext) {
  return generateMessageVariants("winback", context);
}
