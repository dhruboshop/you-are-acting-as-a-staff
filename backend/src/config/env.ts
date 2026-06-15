import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalString = (schema: z.ZodString) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(z.string().min(1)),
  GOOGLE_CLIENT_ID: optionalString(z.string().min(1)),
  JWT_SECRET: optionalString(z.string().min(16)),
  EVOLUTION_API_URL: optionalString(z.string().url()),
  EVOLUTION_API_KEY: optionalString(z.string().min(1)),
  EVOLUTION_WEBHOOK_SECRET: optionalString(z.string().min(16)),
  GROQ_API_KEY: optionalString(z.string().min(1)),
  API_BASE_URL: optionalString(z.string().url()),
  WEB_APP_URL: optionalString(z.string().url()),
  FRONTEND_URL: optionalString(z.string().url()),
  RENDER_EXTERNAL_URL: optionalString(z.string().url()),
  APP_NAME: z.string().min(1).default("Retail Loyalty"),
  LOG_LEVEL: z.string().default("info")
});

const fallbackForTests = {
  DATABASE_URL: "postgresql://user:password@example.invalid:5432/retail_loyalty_test",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  JWT_SECRET: "test-secret-that-is-long-enough",
  EVOLUTION_API_URL: "http://localhost:8081",
  EVOLUTION_API_KEY: "test-evolution-api-key",
  EVOLUTION_WEBHOOK_SECRET: "test-evolution-webhook-secret",
  GROQ_API_KEY: "test-groq-api-key",
  API_BASE_URL: "http://localhost:8080",
  WEB_APP_URL: "http://localhost:3000"
};

const input = process.env.NODE_ENV === "test" ? { ...fallbackForTests, ...process.env } : process.env;
export const env = envSchema.parse(input);

export function getPublicApiBaseUrl() {
  const baseUrl = env.API_BASE_URL ?? env.RENDER_EXTERNAL_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL or RENDER_EXTERNAL_URL is required to generate shop QR links");
  }
  return baseUrl;
}

export function getEvolutionConfig() {
  if (!env.EVOLUTION_API_URL || !env.EVOLUTION_API_KEY) {
    throw new Error("EVOLUTION_API_URL and EVOLUTION_API_KEY are required for WhatsApp messaging");
  }
  return {
    apiUrl: env.EVOLUTION_API_URL,
    apiKey: env.EVOLUTION_API_KEY
  };
}
