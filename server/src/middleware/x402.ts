/**
 * x402 Payment Middleware
 *
 * This middleware gates the /audit endpoint behind x402 payments.
 * Supports tiered pricing: quick ($0.01), standard ($0.05), deep ($0.10)
 */

import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { createFacilitatorConfig } from "@coinbase/x402";
import { config } from "../config/index.js";

// Pricing in USDC atomic units (6 decimals)
// $0.01 = 10000, $0.05 = 50000, $0.10 = 100000
export const TIER_PRICES = {
  quick: 10000n,    // $0.01 USDC
  standard: 50000n, // $0.05 USDC
  deep: 100000n,    // $0.10 USDC
} as const;

export type AuditTier = keyof typeof TIER_PRICES;

// Create facilitator config with CDP credentials
const facilitatorConfig = createFacilitatorConfig(
  config.CDP_API_KEY_ID,
  config.CDP_API_KEY_SECRET
);

// Create HTTP facilitator client with authenticated config
const facilitatorClient = new HTTPFacilitatorClient(facilitatorConfig);

// Create x402 resource server with authenticated facilitator client
const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);

/**
 * Express middleware factory for x402-protected routes
 * Uses the standard @x402/express middleware
 */
export function createX402Middleware(): any {
  const PAY_TO = config.X402_PAY_TO_ADDRESS;
  const NETWORK = config.X402_NETWORK as `${string}:${string}`;

  return paymentMiddleware(
    {
      "POST /audit/quick": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Quick YARA malware scan",
        mimeType: "application/json",
      },
      "POST /audit/standard": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.05",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Standard security analysis with permissions and network detection",
        mimeType: "application/json",
      },
      "POST /audit/deep": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.10",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Deep comprehensive security audit with behavioral sandbox",
        mimeType: "application/json",
      },
      "POST /audit": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Security audit (default: quick tier)",
        mimeType: "application/json",
      },
    },
    x402Server,
  );
}

/**
 * Get pricing info for all tiers
 */
export function getPricingInfo() {
  return {
    quick: {
      price: "$0.01",
      description: "YARA scan only",
      features: ["Malware signature detection", "Basic pattern matching"],
    },
    standard: {
      price: "$0.05",
      description: "YARA + permissions + network analysis",
      features: ["All quick features", "Permission analysis", "Network call detection", "Dependency scanning"],
    },
    deep: {
      price: "$0.10",
      description: "Full analysis + detailed report",
      features: ["All standard features", "Deep code analysis", "Risk scoring", "Remediation suggestions"],
    },
  };
}
