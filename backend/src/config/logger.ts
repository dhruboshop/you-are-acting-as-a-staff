import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: ["req.headers.authorization", "SUPABASE_SERVICE_ROLE_KEY", "EVOLUTION_API_KEY"]
});
