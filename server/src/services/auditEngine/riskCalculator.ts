import type { AuditFindings, RiskLevel, Recommendation } from "../../types/api.js";

interface RiskResult {
  score: number;
  level: RiskLevel;
  recommendation: Recommendation;
  breakdown: {
    malware: number;
    credentials: number;
    network: number;
    permissions: number;
  };
}

const SEVERITY_WEIGHTS: Record<RiskLevel, number> = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 15,
  LOW: 5,
};

export function calculateRisk(findings: AuditFindings): RiskResult {
  let score = 0;
  const breakdown = {
    malware: 0,
    credentials: 0,
    network: 0,
    permissions: 0,
  };
  
  // YARA matches (malware detection)
  for (const match of findings.malware) {
    const points = SEVERITY_WEIGHTS[match.severity];
    breakdown.malware += points;
  }
  score += Math.min(50, breakdown.malware); // Cap malware contribution
  
  // Credential access
  for (const cred of findings.credentials) {
    const points = SEVERITY_WEIGHTS[cred.risk];
    breakdown.credentials += points;
  }
  score += Math.min(30, breakdown.credentials); // Cap credential contribution
  
  // Network calls
  for (const call of findings.network) {
    if (call.external) {
      const points = call.method === "POST" ? 15 : 10;
      breakdown.network += points;
    }
  }
  score += Math.min(20, breakdown.network); // Cap network contribution
  
  // Permissions
  for (const perm of findings.permissions) {
    if (perm.type !== "credential") { // Avoid double counting
      const points = SEVERITY_WEIGHTS[perm.risk] / 2;
      breakdown.permissions += points;
    }
  }
  score += Math.min(15, breakdown.permissions); // Cap permission contribution
  
  // Ensure score is 0-100
  score = Math.min(100, Math.max(0, Math.round(score)));
  
  return {
    score,
    level: scoreToLevel(score),
    recommendation: scoreToRecommendation(score, findings),
    breakdown,
  };
}

function scoreToLevel(score: number): RiskLevel {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MEDIUM";
  if (score <= 75) return "HIGH";
  return "CRITICAL";
}

function scoreToRecommendation(score: number, findings: AuditFindings): Recommendation {
  // Critical malware = always blocked
  const hasCriticalMalware = findings.malware.some(m => m.severity === "CRITICAL");
  if (hasCriticalMalware) return "BLOCKED";
  
  if (score <= 25) return "SAFE";
  if (score <= 50) return "CAUTION";
  if (score <= 75) return "DANGEROUS";
  return "BLOCKED";
}
