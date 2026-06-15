import express from "express";
import { applySecurity } from "./middleware/security.js";
import { errorHandler, notFound } from "./middleware/error.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import campaignRoutes from "./routes/campaigns.js";
import customerRoutes from "./routes/customers.js";
import healthRoutes from "./routes/health.js";
import aiRoutes from "./routes/ai.js";
import loyaltyRoutes from "./routes/loyalty.js";
import publicRoutes from "./routes/public.js";
import shopRoutes from "./routes/shops.js";
import whatsappRoutes from "./routes/whatsapp.js";

export function createApp() {
  const app = express();
  applySecurity(app);
  app.use(express.json({ limit: "1mb" }));
  app.use("/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/shops", shopRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/loyalty", loyaltyRoutes);
  app.use("/api/whatsapp", whatsappRoutes);
  app.use("/api/campaigns", campaignRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/ai", aiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
