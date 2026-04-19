import { scanWithYara } from "./yaraScanner.js";
import { analyzePermissions } from "./permissionAnalyzer.js";
import { detectNetworkCalls } from "./networkDetector.js";
import { calculateRisk } from "./riskCalculator.js";
import { scanInstallHooks, convertToYaraFormat as installHookToYara } from "./installHookScanner.js";
import { scanSecretAccess, convertToYaraFormat as secretAccessToYara } from "./secretAccessScanner.js";
import { scanExfiltration, convertToYaraFormat as exfiltrationToYara } from "./exfiltrationScanner.js";
import { scanPromptInjection, convertToYaraFormat as promptInjectionToYara } from "./promptInjectionScanner.js";
import type { AuditTier, AuditFindings, RiskLevel, Recommendation } from "../../types/api.js";

export interface AuditResult {
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: Recommendation;
  findings: AuditFindings;
}

// Run a single scanner with error isolation — a failing scanner should not kill the audit
function runScanner<T>(name: string, fn: () => T): T | null {
  try {
    return fn();
  } catch (error) {
    console.error(`[audit] Scanner "${name}" failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function auditSkill(
  content: string,
  tier: AuditTier
): Promise<AuditResult> {
  // Always run YARA scan
  const yaraMatches = await scanWithYara(content);

  // Always run the 4 additional scanners (per-scanner try/catch for isolation)
  const installHookFindings = runScanner("installHook", () => scanInstallHooks(content));
  const secretAccessFindings = runScanner("secretAccess", () => scanSecretAccess(content));
  const exfiltrationFindings = runScanner("exfiltration", () => scanExfiltration(content));
  const promptInjectionFindings = runScanner("promptInjection", () => scanPromptInjection(content));

  // Convert new scanner findings to YARA-compatible format and merge into malware array
  const allMalwareFindings = [
    ...yaraMatches,
    ...(installHookFindings ? installHookToYara(installHookFindings) : []),
    ...(secretAccessFindings ? secretAccessToYara(secretAccessFindings) : []),
    ...(exfiltrationFindings ? exfiltrationToYara(exfiltrationFindings) : []),
    ...(promptInjectionFindings ? promptInjectionToYara(promptInjectionFindings) : []),
  ];

  // Standard+ tiers get permission and network analysis
  let permissions: AuditFindings["permissions"] = [];
  let networkCalls: AuditFindings["network"] = [];

  if (tier === "standard" || tier === "deep") {
    permissions = analyzePermissions(content);
    networkCalls = detectNetworkCalls(content);
  }

  // Extract credential-related permissions
  const credentials = permissions
    .filter(p => p.type === "credential")
    .map(p => ({
      type: p.target,
      pattern: p.target,
      risk: p.risk,
    }));

  // Build findings
  const findings: AuditFindings = {
    malware: allMalwareFindings,
    credentials,
    network: networkCalls,
    permissions,
  };

  // Calculate risk
  const risk = calculateRisk(findings);

  return {
    risk_score: risk.score,
    risk_level: risk.level,
    recommendation: risk.recommendation,
    findings,
  };
}
