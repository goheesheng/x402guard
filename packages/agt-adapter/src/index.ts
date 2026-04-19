/**
 * x402guard Adapter for Microsoft Agent Governance Toolkit
 *
 * Implements a PolicyProvider that scans agent tools/skills via x402guard
 * before allowing execution. Integrates with AGT's ToolCallInterceptor
 * and PolicyProviderInterface.
 *
 * @example
 * ```ts
 * import { X402GuardPolicyProvider } from '@x402guard/agt-adapter';
 *
 * const provider = new X402GuardPolicyProvider({
 *   privateKey: process.env.WALLET_PRIVATE_KEY!,
 *   tier: 'quick',
 *   onDeny: 'block',
 * });
 *
 * // Register with AGT
 * agentOS.registerPolicyProvider(provider);
 * ```
 */

import { X402GuardClient, type AuditResult, type AuditTier } from 'x402guard-client';

// AGT PolicyProvider interface (compatible with @microsoft/agentmesh-sdk)
// Defined inline to avoid hard dependency on the SDK at compile time
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface PolicyEvaluationRequest {
  action: string;
  resource: string;
  context?: Record<string, unknown>;
}

export interface PolicyProvider {
  name: string;
  evaluate(request: PolicyEvaluationRequest): Promise<PolicyDecision>;
}

// x402guard adapter config
export interface X402GuardAdapterConfig {
  /** Wallet private key for x402 payments (0x-prefixed hex) */
  privateKey: string;
  /** x402guard API URL (default: https://x402guard.xyz) */
  apiUrl?: string;
  /** Scan tier: quick ($0.10), standard ($0.50), deep ($1.00) */
  tier?: AuditTier;
  /** What to do when scan returns deny: 'block' stops execution, 'warn' logs and continues */
  onDeny?: 'block' | 'warn';
  /** Timeout in ms for scan requests (default: 10000) */
  timeoutMs?: number;
  /** What to do on scan failure/timeout: 'allow' lets it through, 'block' stops it */
  onError?: 'allow' | 'block';
}

/**
 * x402guard PolicyProvider for Microsoft Agent Governance Toolkit
 *
 * Scans tool/skill content via x402guard before allowing execution.
 * Pays per scan via x402 protocol (USDC on Base).
 */
export class X402GuardPolicyProvider implements PolicyProvider {
  public readonly name = 'x402guard';

  private client: X402GuardClient;
  private tier: AuditTier;
  private onDeny: 'block' | 'warn';
  private timeoutMs: number;
  private onError: 'allow' | 'block';

  constructor(config: X402GuardAdapterConfig) {
    this.client = new X402GuardClient({
      privateKey: config.privateKey,
      apiUrl: config.apiUrl || 'https://x402guard.xyz',
    });
    this.tier = config.tier || 'quick';
    this.onDeny = config.onDeny || 'block';
    this.timeoutMs = config.timeoutMs || 10000;
    this.onError = config.onError || 'allow';
  }

  /**
   * Evaluate a tool/skill installation or execution request.
   *
   * AGT calls this before allowing a tool to execute.
   * The adapter scans the tool content via x402guard and returns allow/deny.
   */
  async evaluate(request: PolicyEvaluationRequest): Promise<PolicyDecision> {
    const { action, resource, context } = request;

    // Only scan tool installations and executions
    if (action !== 'tool.install' && action !== 'tool.execute' && action !== 'plugin.install') {
      return { allowed: true, reason: 'Action not in scan scope' };
    }

    // Extract tool content from the request
    const toolContent = (context?.content as string) ||
                        (context?.source as string) ||
                        resource;

    if (!toolContent) {
      return { allowed: true, reason: 'No tool content to scan' };
    }

    try {
      const result = await this.scanWithTimeout(toolContent);
      return this.decisionFromResult(result, resource);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown scan error';
      console.error(`[x402guard] Scan failed for ${resource}: ${message}`);

      if (this.onError === 'block') {
        return {
          allowed: false,
          reason: `x402guard scan failed: ${message}. Blocking per onError policy.`,
          metadata: { error: message, policy: 'onError:block' },
        };
      }

      return {
        allowed: true,
        reason: `x402guard scan failed: ${message}. Allowing per onError policy.`,
        metadata: { error: message, policy: 'onError:allow' },
      };
    }
  }

  private async scanWithTimeout(content: string): Promise<AuditResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.client.auditSkill({
        skillContent: content,
        tier: this.tier,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private decisionFromResult(result: AuditResult, resource: string): PolicyDecision {
    const gateDecision = (result as any).gate_decision as string | undefined;
    const recommendation = result.recommendation;

    // Use gate_decision if available (new API), fall back to recommendation
    const decision = gateDecision || recommendation;

    const metadata: Record<string, unknown> = {
      audit_id: result.audit_id,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      recommendation: result.recommendation,
      gate_decision: gateDecision,
      tier: result.tier,
      findings_count: result.findings.malware.length + result.findings.credentials.length + result.findings.network.length + result.findings.permissions.length,
    };

    if (decision === 'allow' || decision === 'SAFE') {
      return { allowed: true, reason: `x402guard: SAFE (score: ${result.risk_score})`, metadata };
    }

    if (decision === 'warn' || decision === 'CAUTION') {
      return {
        allowed: true,
        reason: `x402guard: CAUTION (score: ${result.risk_score}). Review findings for ${resource}.`,
        metadata,
      };
    }

    // deny (DANGEROUS or BLOCKED)
    if (this.onDeny === 'warn') {
      return {
        allowed: true,
        reason: `x402guard: ${recommendation} (score: ${result.risk_score}). WARNING: onDeny=warn, allowing despite deny recommendation.`,
        metadata,
      };
    }

    return {
      allowed: false,
      reason: `x402guard: ${recommendation} (score: ${result.risk_score}). Tool blocked.`,
      metadata,
    };
  }
}

/**
 * Create a ToolCallInterceptor function compatible with AGT.
 *
 * This is a simpler integration point than the full PolicyProvider.
 * Use it to wrap individual tool calls.
 *
 * @example
 * ```ts
 * const interceptor = createToolInterceptor({
 *   privateKey: process.env.WALLET_PRIVATE_KEY!,
 * });
 *
 * // Before executing a tool:
 * const decision = await interceptor(toolSource);
 * if (!decision.allowed) throw new Error(decision.reason);
 * ```
 */
export function createToolInterceptor(config: X402GuardAdapterConfig) {
  const provider = new X402GuardPolicyProvider(config);

  return async (toolContent: string, toolName?: string): Promise<PolicyDecision> => {
    return provider.evaluate({
      action: 'tool.execute',
      resource: toolName || 'unknown-tool',
      context: { content: toolContent },
    });
  };
}

export { X402GuardClient, type AuditResult, type AuditTier } from 'x402guard-client';
export default X402GuardPolicyProvider;
