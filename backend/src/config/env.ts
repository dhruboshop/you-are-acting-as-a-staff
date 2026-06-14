import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  EVOLUTION_API_URL: z.string().url(),
  EVOLUTION_API_KEY: z.string().min(1),
  API_BASE_URL: z.string().url(),
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
  API_BASE_URL: "http://localhost:8080"
};

const input = process.env.NODE_ENV === "test" ? { ...fallbackForTests, ...process.env } : process.env;
export const env = envSchema.parse(input);
