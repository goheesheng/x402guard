import express, { Express } from "express";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import pricingRouter from "./routes/pricing.js";
import auditRouter from "./routes/audit.js";
import skillRouter from "./routes/skill.js";
import discoveryRouter from "./routes/discovery.js";
import verifyRouter from "./routes/verify.js";

export function createServer(): Express {
  const app: Express = express();
  
  // Middleware
  app.use(express.json({ limit: "2mb" }));
  
  // Request logging
  app.use((req: any, res: any, next: any) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
  
  /**
   * CORS Configuration for x402 Payment Protocol
   *
   * IMPORTANT: The x402 payment flow requires specific CORS headers:
   *
   * 1. Access-Control-Allow-Headers MUST include:
   *    - PAYMENT-SIGNATURE: The signed payment proof sent by the client
   *    - X-PAYMENT: Alternative payment header (v1 compatibility)
   *    - Access-Control-Expose-Headers: The x402 client sets this on retry requests
   *
   * 2. Access-Control-Expose-Headers MUST include:
   *    - PAYMENT-REQUIRED: Server sends this with 402 response (base64 encoded payment requirements)
   *    - PAYMENT-RESPONSE: Server sends this after successful payment verification
   *
   * Common issues fixed:
   * - "Failed to parse payment requirements: Invalid payment required response"
   *   → PAYMENT-REQUIRED header not exposed to browser (missing from Expose-Headers)
   *
   * - "Request header field access-control-expose-headers is not allowed"
   *   → x402 client sends Access-Control-Expose-Headers on retry, must be in Allow-Headers
   *
   * - "Failed to fetch" with 402 status
   *   → CORS blocking the response headers, check both Allow-Headers and Expose-Headers
   */
  app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    // Allow all x402 payment headers (the client sends Access-Control-Expose-Headers on retry)
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Payment, PAYMENT-SIGNATURE, X-PAYMENT, Access-Control-Expose-Headers");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    // Expose all x402 payment headers (both v1 and v2 formats)
    res.header("Access-Control-Expose-Headers", "PAYMENT-REQUIRED, PAYMENT-RESPONSE, X-Payment-Response, X-Payment-Required");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  // x402 Discovery endpoint (must be at root, not /api)
  app.use(discoveryRouter);

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
