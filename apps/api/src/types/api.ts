// API Request/Response Types

export type AuditTier = "quick" | "standard" | "deep";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recommendation = "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";

export interface AuditRequest {
  skill_url?: string;
  skill_content?: string;
  tier?: AuditTier;
  format?: "json" | "markdown";
}

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
  uptime: number;
}

export interface PricingResponse {
  tiers: {
    name: AuditTier;
    price: string;
    priceUSD: number;
    features: string[];
  }[];
  network: string;
  asset: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  suggestion?: string;
}
