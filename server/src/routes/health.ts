import { Router } from "express";
import type { Router as RouterType } from "express";
import type { HealthResponse } from "../types/api.js";

const router: RouterType = Router();
const startTime = Date.now();

router.get("/health", (_req: any, res: any) => {
  const response: HealthResponse = {
    status: "ok",
    version: "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
  
  res.json(response);
});

export default router;
