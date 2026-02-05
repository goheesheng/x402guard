import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load .env file
dotenvConfig();

function parseCsvList(value: string): string[] {
  return [...new Set(
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  )];
}

const envSchema = z.object({
  // Base URL for resources
  BASE_URL: z.string().url().default("http://localhost:3001"),
  PORT: z.string().default("3001").transform(Number),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // x402 - MAINNET CONFIG
  X402_PAY_TO_ADDRESS: z.string().min(1),
  X402_FACILITATOR_URL: z.string().url().default("https://api.cdp.coinbase.com/platform/v2/x402"),
  // Force Base Mainnet - hardcoded to ensure mainnet payments
  X402_NETWORK: z.string().default("eip155:8453").transform(() => "eip155:8453"),

  // Coinbase CDP API Credentials (for x402 facilitator authentication)
  CDP_API_KEY_ID: z.string().optional(),
  CDP_API_KEY_SECRET: z.string().optional(),

  // x402scan Ownership Proof (optional - for "Verified" status on x402scan)
  // Option 1: Provide private key (NOT recommended for servers running untrusted code)
  OWNERSHIP_PROOF_PRIVATE_KEY: z.string().optional(),
  // Option 2: Provide pre-signed signature (RECOMMENDED - sign offline, deploy signature only)
  OWNERSHIP_PROOF_SIGNATURE: z.string().optional(),

  // Attestation Signing (optional - for cryptographically signed deep scan attestations)
  // Private key for EIP-712 attestation signing (0x-prefixed hex string)
  ATTESTATION_PRIVATE_KEY: z.string().optional(),
  // Optional trusted signer address used by /verify (defaults to X402_PAY_TO_ADDRESS)
  ATTESTATION_TRUSTED_SIGNER: z.string().optional(),

  // Pricing (USDC atomic units, 6 decimals)
  // $0.01 = 10000, $0.05 = 50000, $0.10 = 100000
  PRICE_QUICK: z.string().default("10000").transform(Number),
  PRICE_STANDARD: z.string().default("50000").transform(Number),
  PRICE_DEEP: z.string().default("100000").transform(Number),

  // Limits
  MAX_SKILL_SIZE: z.string().default("1048576").transform(Number),
  FETCH_TIMEOUT_MS: z.string().default("10000").transform(Number),
  RATE_LIMIT_WINDOW: z.string().default("60000").transform(Number),
  RATE_LIMIT_MAX: z.string().default("100").transform(Number),
  RATE_LIMIT_STORE: z.enum(["memory", "upstash"]).default("memory"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://127.0.0.1:3000")
    .transform(parseCsvList),
  TRUST_PROXY: z.string().optional(),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.format());
    throw new Error("Invalid configuration");
  }
  
  const data = parsed.data;

  // Always allow BASE_URL origin unless wildcard is explicitly used.
  if (!data.CORS_ALLOWED_ORIGINS.includes("*")) {
    try {
      const baseOrigin = new URL(data.BASE_URL).origin;
      if (!data.CORS_ALLOWED_ORIGINS.includes(baseOrigin)) {
        data.CORS_ALLOWED_ORIGINS.push(baseOrigin);
      }
    } catch {
      // Ignore malformed BASE_URL here since schema validation already handles it.
    }
  }

  if (data.RATE_LIMIT_STORE === "upstash") {
    if (!data.UPSTASH_REDIS_REST_URL || !data.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required when RATE_LIMIT_STORE=upstash"
      );
    }
  }

  if (!data.TRUST_PROXY) {
    data.TRUST_PROXY = data.NODE_ENV === "production" ? "1" : "0";
  }

  return data;
}

export const config = loadConfig();

export type Config = typeof config;
