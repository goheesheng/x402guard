/**
 * x402guard Adapter for LangChain
 *
 * Provides a CallbackHandler that scans tools before execution via x402guard,
 * and a wrapper function for scanning tool source code before registration.
 *
 * @example
 * ```ts
 * import { X402GuardCallbackHandler } from '@x402guard/langchain';
 *
 * const handler = new X402GuardCallbackHandler({
 *   privateKey: process.env.WALLET_PRIVATE_KEY!,
 *   tier: 'quick',
 * });
 *
 * // Use with any LangChain agent
 * const agent = new AgentExecutor({ tools, llm, callbacks: [handler] });
 * ```
 */

import { X402GuardClient, type AuditResult, type AuditTier } from 'x402guard-client';

// LangChain callback handler interface (compatible with @langchain/core)
// Defined inline to avoid hard dependency on @langchain/core at compile time
export interface CallbackHandlerMethods {
  handleToolStart?(
    tool: { name: string; description?: string },
    input: string,
    runId?: string,
  ): Promise<void>;
  handleToolEnd?(output: string, runId?: string): Promise<void>;
  handleToolError?(error: Error, runId?: string): Promise<void>;
}

export interface ScanResult {
  allowed: boolean;
  gate_decision: string;
  risk_score: number;
  risk_level: string;
  recommendation: string;
  audit_id: string;
  findings_count: number;
  reason: string;
}

export interface X402GuardLangChainConfig {
  /** Wallet private key for x402 payments (0x-prefixed hex) */
  privateKey: string;
  /** x402guard API URL (default: https://x402guard.xyz) */
  apiUrl?: string;
  /** Scan tier: quick ($0.10), standard ($0.50), deep ($1.00) */
  tier?: AuditTier;
  /** What to do when scan returns deny: 'block' throws, 'warn' logs */
  onDeny?: 'block' | 'warn';
  /** Timeout in ms for scan requests (default: 10000) */
  timeoutMs?: number;
  /** What to do on scan failure/timeout: 'allow' or 'block' */
  onError?: 'allow' | 'block';
  /** Tools to skip scanning (by name) */
  skipTools?: string[];
}

/**
 * LangChain CallbackHandler that scans tools via x402guard before execution.
 *
 * When a tool is about to execute, the handler scans the tool's input
 * via x402guard and throws an error if the scan returns a deny decision.
 */
export class X402GuardCallbackHandler implements CallbackHandlerMethods {
  public readonly name = 'x402guard';

  private client: X402GuardClient;
  private tier: AuditTier;
  private onDeny: 'block' | 'warn';
  private timeoutMs: number;
  private onError: 'allow' | 'block';
  private skipTools: Set<string>;

  constructor(config: X402GuardLangChainConfig) {
    this.client = new X402GuardClient({
      privateKey: config.privateKey,
      apiUrl: config.apiUrl || 'https://x402guard.xyz',
    });
    this.tier = config.tier || 'quick';
    this.onDeny = config.onDeny || 'block';
    this.timeoutMs = config.timeoutMs || 10000;
    this.onError = config.onError || 'allow';
    this.skipTools = new Set(config.skipTools || []);
  }

  /**
   * Called by LangChain before a tool executes.
   * Scans the tool input and blocks if the scan returns deny.
   */
  async handleToolStart(
    tool: { name: string; description?: string },
    input: string,
  ): Promise<void> {
    if (this.skipTools.has(tool.name)) return;

    // Scan the tool's source/input content
    const contentToScan = tool.description
      ? `# Tool: ${tool.name}\n${tool.description}\n\n## Input:\n${input}`
      : input;

    try {
      const result = await this.scanWithTimeout(contentToScan);
      const decision = this.interpretResult(result, tool.name);

      if (!decision.allowed) {
        if (this.onDeny === 'block') {
          throw new Error(
            `[x402guard] Tool "${tool.name}" blocked: ${decision.reason} ` +
            `(risk_score: ${decision.risk_score}, audit_id: ${decision.audit_id})`
          );
        }
        console.warn(`[x402guard] Tool "${tool.name}" flagged: ${decision.reason}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('[x402guard] Tool')) {
        throw error; // Re-throw our own block errors
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[x402guard] Scan failed for tool "${tool.name}": ${message}`);

      if (this.onError === 'block') {
        throw new Error(`[x402guard] Tool "${tool.name}" blocked: scan failed (${message})`);
      }
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

  private interpretResult(result: AuditResult, toolName: string): ScanResult {
    const gateDecision = (result as any).gate_decision as string | undefined;

    const allowed = gateDecision === 'allow' || gateDecision === 'warn' ||
                    result.recommendation === 'SAFE' || result.recommendation === 'CAUTION';

    return {
      allowed,
      gate_decision: gateDecision || result.recommendation,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      recommendation: result.recommendation,
      audit_id: result.audit_id,
      findings_count: result.findings.malware.length + result.findings.credentials.length + result.findings.network.length + result.findings.permissions.length,
      reason: allowed
        ? `SAFE (score: ${result.risk_score})`
        : `${result.recommendation} (score: ${result.risk_score})`,
    };
  }
}

/**
 * Scan a tool's source code before registering it with LangChain.
 *
 * Use this for pre-registration scanning when you have the tool source.
 *
 * @example
 * ```ts
 * import { scanTool } from '@x402guard/langchain';
 *
 * const result = await scanTool({
 *   privateKey: process.env.WALLET_PRIVATE_KEY!,
 *   content: toolSourceCode,
 *   toolName: 'my-tool',
 * });
 *
 * if (!result.allowed) {
 *   throw new Error(`Tool rejected: ${result.reason}`);
 * }
 * ```
 */
export async function scanTool(options: {
  privateKey: string;
  content: string;
  toolName?: string;
  apiUrl?: string;
  tier?: AuditTier;
}): Promise<ScanResult> {
  const client = new X402GuardClient({
    privateKey: options.privateKey,
    apiUrl: options.apiUrl || 'https://x402guard.xyz',
  });

  const result = await client.auditSkill({
    skillContent: options.content,
    tier: options.tier || 'quick',
  });

  const gateDecision = (result as any).gate_decision as string | undefined;
  const allowed = gateDecision === 'allow' || gateDecision === 'warn' ||
                  result.recommendation === 'SAFE' || result.recommendation === 'CAUTION';

  return {
    allowed,
    gate_decision: gateDecision || result.recommendation,
    risk_score: result.risk_score,
    risk_level: result.risk_level,
    recommendation: result.recommendation,
    audit_id: result.audit_id,
    findings_count: result.findings.malware.length,
    reason: allowed
      ? `SAFE (score: ${result.risk_score})`
      : `${result.recommendation} (score: ${result.risk_score})`,
  };
}

export { X402GuardClient, type AuditResult, type AuditTier } from 'x402guard-client';
export default X402GuardCallbackHandler;
