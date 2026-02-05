import express, { Express } from "express";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import pricingRouter from "./routes/pricing.js";
import auditRouter from "./routes/audit.js";
import skillRouter from "./routes/skill.js";
import discoveryRouter from "./routes/discovery.js";
import verifyRouter from "./routes/verify.js";
import { config } from "./config/index.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { createRateLimitMiddleware } from "./middleware/rateLimit.js";

export function createServer(): Express {
  const app: Express = express();
  
  // Middleware
  app.use(express.json({ limit: "2mb" }));
  
  // Request logging
  app.use((req: any, res: any, next: any) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
  
  app.use(createCorsMiddleware({ allowedOrigins: config.CORS_ALLOWED_ORIGINS }));
  
  // x402 Discovery endpoint (must be at root, not /api)
  app.use(discoveryRouter);

  // Basic global API request throttling
  app.use(
    "/api",
    createRateLimitMiddleware({
      windowMs: config.RATE_LIMIT_WINDOW,
      max: config.RATE_LIMIT_MAX,
    })
  );

  // Routes (all under /api prefix)
  app.use("/api", healthRouter);
  app.use("/api", pricingRouter);
  app.use("/api", skillRouter);
  app.use("/api", auditRouter);
  app.use("/api", verifyRouter);

  // Error handler
  app.use(errorHandler);
  
  return app;
}
