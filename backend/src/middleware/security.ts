import compression from "compression";
import cors from "cors";
import type { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function applySecurity(app: Express) {
  app.disable("x-powered-by");
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false
  }));
  app.use(cors({
    origin: env.NODE_ENV === "production" ? [env.API_BASE_URL] : true,
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
