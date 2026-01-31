import { scanWithYara } from "./yaraScanner.js";
import { analyzePermissions } from "./permissionAnalyzer.js";
import { detectNetworkCalls } from "./networkDetector.js";
import { calculateRisk } from "./riskCalculator.js";
import type { AuditTier, AuditFindings, RiskLevel, Recommendation } from "../../types/api.js";

export interface AuditResult {
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: Recommendation;
  findings: AuditFindings;
}

export async function auditSkill(
  content: string,
  tier: AuditTier
): Promise<AuditResult> {
  // Always run YARA scan
  const yaraMatches = await scanWithYara(content);
  
  // Standard+ tiers get more analysis
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
    malware: yaraMatches,
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
