/**
 * x402 Payment Middleware
 * 
 * This middleware gates the /audit endpoint behind x402 payments.
 * Supports tiered pricing: quick ($0.05), standard ($0.15), deep ($0.50)
 */

import { paymentMiddleware } from "@x402/express";
import { config } from "../config/index.js";

// Pricing in USDC atomic units (6 decimals)
// $0.05 = 50000, $0.15 = 150000, $0.50 = 500000
export const TIER_PRICES = {
  quick: 50000n,    // $0.05 USDC
  standard: 150000n, // $0.15 USDC  
  deep: 500000n,     // $0.50 USDC
} as const;

export type AuditTier = keyof typeof TIER_PRICES;

// USDC contract address on Base
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Get USDC address based on network
const getUsdcAddress = () => {
  return config.X402_NETWORK.includes("8453") ? USDC_BASE : USDC_BASE_SEPOLIA;
};

/**
 * Create x402 payment configuration for the audit endpoint
 */
export function createPaymentConfig(tier: AuditTier = "quick") {
  const price = TIER_PRICES[tier];
  
  return {
    maxAmountRequired: price.toString(),
    resource: `${config.BASE_URL}/audit`,
    payTo: config.X402_PAY_TO_ADDRESS,
    network: config.X402_NETWORK,
    asset: getUsdcAddress(),
    description: `SkillGuard security audit (${tier} tier)`,
  };
}

/**
 * Express middleware factory for x402-protected routes
 * Uses the standard @x402/express middleware
 */
export function createX402Middleware(): any {
  return paymentMiddleware(
    config.X402_PAY_TO_ADDRESS as any,
    {
      "POST /audit": createPaymentConfig("quick"),
    } as any,
    {
      url: config.X402_FACILITATOR_URL,
    } as any
  );
}

/**
 * Get pricing info for all tiers
 */
export function getPricingInfo() {
  return {
    quick: {
      price: "$0.05",
      description: "YARA scan only",
      features: ["Malware signature detection", "Basic pattern matching"],
    },
    standard: {
      price: "$0.15", 
      description: "YARA + permissions + network analysis",
      features: ["All quick features", "Permission analysis", "Network call detection", "Dependency scanning"],
    },
    deep: {
      price: "$0.50",
      description: "Full analysis + detailed report",
      features: ["All standard features", "Deep code analysis", "Risk scoring", "Remediation suggestions"],
    },
  };
}
