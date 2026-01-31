import { Router } from "express";
import { config } from "../config/index.js";
import type { PricingResponse } from "../types/api.js";

const router = Router();

router.get("/pricing", (_req: any, res: any) => {
  const response: PricingResponse = {
    tiers: [
      {
        name: "quick",
        price: `${config.PRICE_QUICK}`,
        priceUSD: config.PRICE_QUICK / 1_000_000,
        features: [
          "YARA malware scanning",
          "Basic risk score (0-100)",
          "Risk level classification",
          "Recommendation",
        ],
      },
      {
        name: "standard",
        price: `${config.PRICE_STANDARD}`,
        priceUSD: config.PRICE_STANDARD / 1_000_000,
        features: [
          "All Quick features",
          "Permission analysis",
          "Network call detection",
          "Detailed findings",
        ],
      },
      {
        name: "deep",
        price: `${config.PRICE_DEEP}`,
        priceUSD: config.PRICE_DEEP / 1_000_000,
        features: [
          "All Standard features",
          "Behavioral sandbox",
          "Signed attestation",
          "Full audit trail",
        ],
      },
    ],
    network: config.X402_NETWORK,
    asset: "USDC",
  };
  
  res.json(response);
});

export default router;
