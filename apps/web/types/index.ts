// Audit tier types
export type AuditTier = "quick" | "standard" | "deep";

export interface TierConfig {
  id: AuditTier;
  name: string;
  price: string;
  priceNum: number;
  description: string;
  features: string[];
  popular?: boolean;
}

// API types
export interface AuditRequest {
  skill_url?: string;
  skill_content?: string;
}

// Server returns objects, not strings - we need to handle both formats
export interface YaraMatch {
  rule: string;
  severity: RiskLevel;
  description: string;
  offset?: number;
  length?: number;
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
  malware: (string | YaraMatch)[];
  credentials: (string | CredentialAccess)[];
  network: (string | NetworkCall)[];
  permissions: (string | Permission)[];
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recommendation = "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";

export interface AuditAttestation {
  signature: string;
  signer: string;
  chain: string;
}

export interface AuditResult {
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: Recommendation;
  findings: AuditFindings;
  audit_id: string;
  timestamp: string;
  tier: AuditTier;
  attestation?: AuditAttestation;
}

export interface PaymentRequired {
  description?: string;
  accepts?: {
    chain: string;
    token: string;
    amount: string;
    recipient: string;
  };
}

// FAQ types
export interface FAQItem {
  question: string;
  answer: string;
}

// Risk scenario types
export interface RiskScenario {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

// Trust stack layer types
export interface TrustLayer {
  layer: string;
  name: string;
  status: string;
  color: string;
  highlight?: boolean;
}
