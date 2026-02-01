import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load .env file
dotenvConfig();

const envSchema = z.object({
  // Base URL for resources
  BASE_URL: z.string().url().default("http://localhost:3001"),
  PORT: z.string().default("3001").transform(Number),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // x402 - MAINNET CONFIG
  X402_PAY_TO_ADDRESS: z.string().min(1),
  X402_FACILITATOR_URL: z.string().url().default("https://api.cdp.coinbase.com/platform/v2/x402"),
  // Force Base Mainnet - hardcoded to ensure mainnet payments
  X402_NETWORK: z.string().transform(() => "eip155:8453"),

  // Coinbase CDP API Credentials (for x402 facilitator authentication)
  CDP_API_KEY_ID: z.string().optional(),
  CDP_API_KEY_SECRET: z.string().optional(),

  // Pricing (USDC atomic units, 6 decimals)
  PRICE_QUICK: z.string().default("50000").transform(Number),
  PRICE_STANDARD: z.string().default("150000").transform(Number),
  PRICE_DEEP: z.string().default("500000").transform(Number),

  // Limits
  MAX_SKILL_SIZE: z.string().default("1048576").transform(Number),
  RATE_LIMIT_WINDOW: z.string().default("60000").transform(Number),
  RATE_LIMIT_MAX: z.string().default("100").transform(Number),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.format());
    throw new Error("Invalid configuration");
  }
  
  return parsed.data;
}

export const config = loadConfig();

export type Config = typeof config;
