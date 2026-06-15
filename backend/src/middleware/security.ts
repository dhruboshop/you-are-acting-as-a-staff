import compression from "compression";
import cors from "cors";
import type { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

function allowedOrigins() {
  const origins = [env.WEB_APP_URL, env.FRONTEND_URL, env.API_BASE_URL].filter((origin): origin is string => Boolean(origin));
  return origins.length > 0 ? origins : true;
}

export function applySecurity(app: Express) {
  app.disable("x-powered-by");
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false
  }));
  app.use(cors({
    origin: env.NODE_ENV === "production" ? allowedOrigins() : true,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }));
  app.use(compression());
  app.use(pinoHttp({ logger }));
  app.use(rateLimit({
    windowMs: 60_000,
    limit: env.NODE_ENV === "test" ? 1000 : 120,
    standardHeaders: "draft-8",
    legacyHeaders: false
  }));
}
