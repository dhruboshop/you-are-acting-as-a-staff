import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/pool.js";
import { createApp } from "./app.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "API listening");
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});
