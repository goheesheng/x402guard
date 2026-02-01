import "dotenv/config";
import type { Express } from "express";
import { createServer } from "./server.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";

const app: Express = createServer();

// Start server (for both local and production)
// Vercel will ignore this and use the exported app directly
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

if (!isVercel) {
  app.listen(config.PORT, () => {
    logger.info(`x402guard API running on port ${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`x402 Network: ${config.X402_NETWORK}`);
  });
}

// Export for Vercel serverless
export default app;
