/**
 * x402guard Client SDK
 *
 * x402-powered security auditing for AI agent skills.
 *
 * @example
 * ```ts
 * import { X402GuardClient } from 'x402guard-client';
 *
 * const client = new X402GuardClient({
 *   apiUrl: 'https://x402guard.vercel.app',
 *   privateKey: process.env.PRIVATE_KEY,
 * });
 *
 * const result = await client.auditSkill({
 *   skillUrl: 'https://clawdhub.com/skills/weather',
 *   tier: 'standard',
 * });
 *
 * console.log(result.risk_level); // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
 * ```
 */

// =============================================================================
// Types
// =============================================================================

export type AuditTier = 'quick' | 'standard' | 'deep';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Recommendation = 'SAFE' | 'CAUTION' | 'DANGEROUS' | 'BLOCKED';

export interface X402GuardConfig {
  /** x402guard API URL (default: https://x402guard.vercel.app) */
  apiUrl?: string;
  /** Private key for x402 payments (hex string with 0x prefix) */
  privateKey: string;
  /** Network: 'mainnet' or 'testnet' (default: mainnet) */
  network?: 'mainnet' | 'testnet';
}

export interface AuditRequest {
  /** URL to the skill (e.g., ClawdHub skill URL) */
  skillUrl?: string;
  /** Raw skill content (alternative to skillUrl) */
  skillContent?: string;
  /** Audit tier: quick ($0.05), standard ($0.15), deep ($0.50) */
  tier?: AuditTier;
}

export interface YaraMatch {
  rule: string;
  severity: RiskLevel;
  description: string;
  offset: number;
  length: number;
}

export interface NetworkCall {
  url: string;
  external: boolean;
  method?: string;
}

export interface Permission {
  type: 'filesystem' | 'network' | 'credential' | 'system';
  action: 'read' | 'write' | 'execute' | 'transmit';
  target: string;
  risk: RiskLevel;
}

export interface AuditFindings {
  malware: YaraMatch[];
  credentials: { type: string; pattern: string; risk: RiskLevel }[];
  network: NetworkCall[];
  permissions: Permission[];
}

export interface AuditResult {
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
  status: 'ok' | 'degraded' | 'down';
  version: string;
}

// =============================================================================
// Constants
// =============================================================================

export const PRICING = {
  quick: { price: 50000, usd: 0.05 },
  standard: { price: 150000, usd: 0.15 },
  deep: { price: 500000, usd: 0.50 },
} as const;

export const DEFAULT_API_URL = 'https://x402guard.vercel.app';

// =============================================================================
// Client
// =============================================================================

export class X402GuardClient {
  private apiUrl: string;
  private privateKey: string;
  private network: 'mainnet' | 'testnet';
  private fetchWithPayment: typeof fetch | null = null;

  constructor(config: X402GuardConfig) {
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
    this.privateKey = config.privateKey;
    this.network = config.network || 'mainnet';
  }

  /**
   * Initialize x402 payment wrapper (lazy loaded)
   */
  private async initPayment(): Promise<typeof fetch> {
    if (this.fetchWithPayment) return this.fetchWithPayment;

    // Dynamic import to avoid bundling issues
    const { wrapFetchWithPayment } = await import('@x402/fetch');
    const { x402Client } = await import('@x402/core/client');
    const { registerExactEvmScheme } = await import('@x402/evm/exact/client');
    const { privateKeyToAccount } = await import('viem/accounts');

    const signer = privateKeyToAccount(this.privateKey as `0x${string}`);
    const client = new x402Client();
    registerExactEvmScheme(client, { signer });

    this.fetchWithPayment = wrapFetchWithPayment(fetch, client);
    return this.fetchWithPayment;
  }

  /**
   * Check API health (free endpoint)
   */
  async health(): Promise<HealthResponse> {
    const response = await fetch(`${this.apiUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json() as Promise<HealthResponse>;
  }

  /**
   * Audit a skill for security issues
   *
   * @param request - Audit request with skill URL/content and tier
   * @returns Audit result with risk score, findings, and recommendation
   *
   * @example
   * ```ts
   * const result = await client.auditSkill({
   *   skillUrl: 'https://clawdhub.com/skills/weather',
   *   tier: 'standard',
   * });
   *
   * if (result.recommendation === 'SAFE') {
   *   console.log('Safe to install');
   * } else {
   *   console.log('Review findings:', result.findings);
   * }
   * ```
   */
  async auditSkill(request: AuditRequest): Promise<AuditResult> {
    const tier = request.tier || 'standard';
    const fetchFn = await this.initPayment();

    const response = await fetchFn(`${this.apiUrl}/api/audit/${tier}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill_url: request.skillUrl,
        skill_content: request.skillContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Audit failed (${response.status}): ${error}`);
    }

    return response.json() as Promise<AuditResult>;
  }

  /**
   * Quick audit - YARA malware scan only ($0.05)
   */
  async quickAudit(skillUrl: string): Promise<AuditResult> {
    return this.auditSkill({ skillUrl, tier: 'quick' });
  }

  /**
   * Standard audit - Full analysis + permissions + network ($0.15)
   */
  async standardAudit(skillUrl: string): Promise<AuditResult> {
    return this.auditSkill({ skillUrl, tier: 'standard' });
  }

  /**
   * Deep audit - Complete audit + behavioral sandbox ($0.50)
   */
  async deepAudit(skillUrl: string): Promise<AuditResult> {
    return this.auditSkill({ skillUrl, tier: 'deep' });
  }

  /**
   * Check if a skill is safe to install
   *
   * @returns true if recommendation is SAFE or CAUTION with low risk
   */
  async isSafe(skillUrl: string, tier: AuditTier = 'standard'): Promise<boolean> {
    const result = await this.auditSkill({ skillUrl, tier });
    return result.recommendation === 'SAFE' ||
           (result.recommendation === 'CAUTION' && result.risk_score < 30);
  }
}

// =============================================================================
// Convenience function
// =============================================================================

/**
 * Quick one-shot audit without creating a client instance
 *
 * @example
 * ```ts
 * import { auditSkill } from 'x402guard-client';
 *
 * const result = await auditSkill({
 *   skillUrl: 'https://clawdhub.com/skills/weather',
 *   privateKey: process.env.PRIVATE_KEY!,
 * });
 * ```
 */
export async function auditSkill(options: {
  skillUrl?: string;
  skillContent?: string;
  tier?: AuditTier;
  privateKey: string;
  apiUrl?: string;
}): Promise<AuditResult> {
  const client = new X402GuardClient({
    privateKey: options.privateKey,
    apiUrl: options.apiUrl,
  });

  return client.auditSkill({
    skillUrl: options.skillUrl,
    skillContent: options.skillContent,
    tier: options.tier,
  });
}

// Backward compatibility alias (deprecated)
/** @deprecated Use X402GuardClient instead */
export const SkillGuardClient = X402GuardClient;
/** @deprecated Use X402GuardConfig instead */
export type SkillGuardConfig = X402GuardConfig;

// Default export
export default X402GuardClient;
