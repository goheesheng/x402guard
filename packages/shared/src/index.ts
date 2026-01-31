// SkillGuard Shared Types
// Used by both @skillguard/web and @skillguard/api

// =============================================================================
// Core Types
// =============================================================================

export type AuditTier = "quick" | "standard" | "deep";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recommendation = "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";

// =============================================================================
// Findings Types
// =============================================================================

export interface YaraMatch {
  rule: string;
  severity: RiskLevel;
  description: string;
  offset: number;
  length: number;
}

export interface CredentialAccess {
  type: string;
  pattern: string;
  risk: RiskLevel;
}

export interface NetworkCall {
  url: string;
  external: boolean;
  method?: string;
}

export interface Permission {
  type: "filesystem" | "network" | "credential" | "system";
  action: "read" | "write" | "execute" | "transmit";
  target: string;
  risk: RiskLevel;
}

export interface AuditFindings {
  malware: YaraMatch[];
  credentials: CredentialAccess[];
  network: NetworkCall[];
  permissions: Permission[];
}

export interface RiskBreakdown {
  malware: number;
  credentials: number;
  network: number;
  permissions: number;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface AuditRequest {
  skill_url?: string;
  skill_content?: string;
  tier?: AuditTier;
  format?: "json" | "markdown";
}

export interface AuditResponse {
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: Recommendation;
  findings: AuditFindings;
  audit_id: string;
  timestamp: string;
  tier: AuditTier;
  attestation?: {
    signature: string;
    signer: string;
    chain: string;
  };
}

export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  version: string;
  uptime?: number;
}

export interface PricingTier {
  name: AuditTier;
  price: string;
  priceUSD: number;
  features: string[];
}

export interface PricingResponse {
  tiers: PricingTier[];
  network: string;
  asset: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  suggestion?: string;
}

// =============================================================================
// x402 Payment Types
// =============================================================================

export interface X402Config {
  network: string;
  facilitator: string;
  payTo: string;
}

export interface APIInfo {
  name: string;
  version: string;
  description: string;
  endpoints: {
    free: string[];
    paid: Record<string, { price: string; description: string }>;
  };
  payment: X402Config;
}

// =============================================================================
// Constants
// =============================================================================

export const PRICING = {
  quick: { price: 50000, usd: 0.05 },      // $0.05
  standard: { price: 150000, usd: 0.15 },  // $0.15
  deep: { price: 500000, usd: 0.50 },      // $0.50
} as const;

export const NETWORKS = {
  mainnet: "eip155:8453",
  testnet: "eip155:84532",
} as const;

export const USDC = {
  mainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  testnet: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;
