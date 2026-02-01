/**
 * @x402guard/shared-types
 *
 * Shared TypeScript types for x402guard packages.
 * These types are used across the server, client SDK, and web frontend.
 */

// =============================================================================
// Audit Types
// =============================================================================

/** Audit tier determines the depth of analysis and pricing */
export type AuditTier = "quick" | "standard" | "deep";

/** Risk level classification */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Final recommendation for the skill */
export type Recommendation = "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";

/** YARA rule match result */
export interface YaraMatch {
  /** Name of the matched YARA rule */
  rule: string;
  /** Severity of the match */
  severity: RiskLevel;
  /** Human-readable description of the threat */
  description: string;
  /** Byte offset where match was found */
  offset: number;
  /** Length of the matched content */
  length: number;
}

/** Detected network call in the skill */
export interface NetworkCall {
  /** Target URL */
  url: string;
  /** Whether the URL is external (not same-origin) */
  external: boolean;
  /** HTTP method if detectable */
  method?: string;
}

/** Permission required by the skill */
export interface Permission {
  /** Type of permission */
  type: "filesystem" | "network" | "credential" | "system";
  /** Action being performed */
  action: "read" | "write" | "execute" | "transmit";
  /** Target resource (file path, URL, etc.) */
  target: string;
  /** Risk level of this permission */
  risk: RiskLevel;
}

/** Credential pattern detected in the skill */
export interface CredentialMatch {
  /** Type of credential (api_key, private_key, etc.) */
  type: string;
  /** Pattern that matched */
  pattern: string;
  /** Risk level of exposing this credential */
  risk: RiskLevel;
}

/** Complete audit findings */
export interface AuditFindings {
  /** YARA malware detections */
  malware: YaraMatch[];
  /** Detected credential patterns */
  credentials: CredentialMatch[];
  /** Network calls found */
  network: NetworkCall[];
  /** Permission requirements */
  permissions: Permission[];
}

/** On-chain attestation for audit result */
export interface AuditAttestation {
  /** Cryptographic signature */
  signature: string;
  /** Signer address */
  signer: string;
  /** Blockchain network */
  chain: string;
}

/** Complete audit result */
export interface AuditResult {
  /** Risk score from 0-100 */
  risk_score: number;
  /** Categorized risk level */
  risk_level: RiskLevel;
  /** Final recommendation */
  recommendation: Recommendation;
  /** Detailed findings */
  findings: AuditFindings;
  /** Unique audit identifier */
  audit_id: string;
  /** ISO timestamp of audit */
  timestamp: string;
  /** Tier used for this audit */
  tier: AuditTier;
  /** Optional on-chain attestation */
  attestation?: AuditAttestation;
}

// =============================================================================
// API Types
// =============================================================================

/** Request body for audit endpoints */
export interface AuditRequest {
  /** URL to fetch the skill from */
  skill_url?: string;
  /** Raw skill content (alternative to URL) */
  skill_content?: string;
}

/** Health check response */
export interface HealthResponse {
  /** Service status */
  status: "ok" | "degraded" | "down";
  /** API version */
  version: string;
  /** Optional status message */
  message?: string;
}

/** Error response format */
export interface ErrorResponse {
  /** Error message */
  error: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

// =============================================================================
// Skill Metadata Types
// =============================================================================

/** Endpoint information in skill.json */
export interface EndpointInfo {
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "DELETE";
  /** Endpoint path */
  path: string;
  /** Description of what this endpoint does */
  description: string;
  /** Whether this endpoint requires x402 payment */
  paid?: boolean;
  /** Price in USDC (if paid) */
  price?: string;
}

/** OpenClaw protocol requirements */
export interface OpenClawRequirements {
  /** Required environment variables */
  env: string[];
  /** Required binary tools */
  bins: string[];
}

/** Pricing information */
export interface PricingInfo {
  /** Currency (e.g., "USDC") */
  currency: string;
  /** Blockchain network */
  network: string;
  /** Price tiers */
  tiers: Record<AuditTier, string>;
}

/** Documentation links */
export interface DocumentationInfo {
  /** URL to main documentation */
  url: string;
  /** URL to API reference */
  api?: string;
  /** URL to SDK documentation */
  sdk?: string;
}

/** Complete skill metadata (skill.json format) */
export interface SkillMetadata {
  /** Skill name */
  name: string;
  /** Short description */
  description: string;
  /** Semantic version */
  version: string;
  /** Author name or organization */
  author: string;
  /** Homepage URL */
  homepage: string;
  /** Protocol-specific metadata */
  metadata: {
    openclaw: {
      requires: OpenClawRequirements;
    };
  };
  /** Available API endpoints */
  endpoints: Record<string, EndpointInfo>;
  /** Pricing information */
  pricing: PricingInfo;
  /** Documentation links */
  documentation: DocumentationInfo;
}

// =============================================================================
// Constants
// =============================================================================

/** Pricing in microdollars (for x402 protocol) */
export const PRICING = {
  quick: { price: 10000, usd: 0.01 },
  standard: { price: 50000, usd: 0.05 },
  deep: { price: 100000, usd: 0.1 },
} as const;

/** Default API URL */
export const DEFAULT_API_URL = "https://x402guard.xyz";

/** Risk score thresholds */
export const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
} as const;
