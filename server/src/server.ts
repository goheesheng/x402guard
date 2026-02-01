import express, { Express } from "express";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import pricingRouter from "./routes/pricing.js";
import auditRouter from "./routes/audit.js";
import skillRouter from "./routes/skill.js";

export function createServer(): Express {
  const app: Express = express();
  
  // Middleware
  app.use(express.json({ limit: "2mb" }));
  
  // Request logging
  app.use((req: any, res: any, next: any) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
  
  // CORS - x402 requires exposing payment response headers
  app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Payment");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Expose-Headers", "X-Payment-Response, X-Payment-Required");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  // Routes (all under /api prefix)
  app.use("/api", healthRouter);
  app.use("/api", pricingRouter);
  app.use("/api", skillRouter);
  app.use("/api", auditRouter);
  
  // Error handler
  app.use(errorHandler);
  
  return app;
}
