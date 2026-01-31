import express from "express";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import pricingRouter from "./routes/pricing.js";
import auditRouter from "./routes/audit.js";

export function createServer() {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: "2mb" }));
  
  // Request logging
  app.use((req: any, res: any, next: any) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
  
  // CORS
  app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Payment");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  // Routes (free)
  app.use(healthRouter);
  app.use(pricingRouter);
  
  // Routes (paid - x402)
  app.use(auditRouter);
  
  // Error handler
  app.use(errorHandler);
  
  return app;
}
