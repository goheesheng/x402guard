// API Request/Response Types

export type AuditTier = "quick" | "standard" | "deep";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recommendation = "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";
export type GateDecision = "allow" | "warn" | "deny";

export function recommendationToGateDecision(rec: Recommendation): GateDecision {
  switch (rec) {
    case "SAFE": return "allow";
    case "CAUTION": return "warn";
    case "DANGEROUS": return "deny";
    case "BLOCKED": return "deny";
  }
}

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

// EIP-712 Attestation Types
export interface AttestationMessage {
  audit_id: string;
  skill_url: string;
  risk_score: number;
  risk_level: string;
  timestamp: number;
}

export interface Attestation {
  message: AttestationMessage;
  signature: string | null;
  signer: string | null;
  domain: {
    name: string;
    version: string;
    chainId: number;
  };
  warning?: string;
}

export interface VerificationResult {
  valid: boolean;
  signer: string | null;
  expectedSigner: string | null;
  matches: boolean;
  error?: string;
}

export interface AuditResponse {
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: Recommendation;
  gate_decision: GateDecision;
  findings: AuditFindings;
  audit_id: string;
  timestamp: string;
  tier: AuditTier;
  attestation?: Attestation;
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

// SKILL.md Metadata Types (for AI agent integration)

export interface EndpointInfo {
  method: string;
  path: string;
  description: string;
  price_usdc: string;
}

export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  metadata: {
    openclaw: {
      requires: {
        env: string[];
        bins: string[];
      };
    };
  };
  endpoints: {
    audit_quick: EndpointInfo;
    audit_standard: EndpointInfo;
    audit_deep: EndpointInfo;
    health: EndpointInfo;
  };
  pricing: {
    network: string;
    asset: string;
    asset_name: string;
    decimals: number;
    tiers: {
      quick: string;
      standard: string;
      deep: string;
    };
  };
  documentation: {
    homepage: string;
    api_reference: string;
    skill_md: string;
  };
}
