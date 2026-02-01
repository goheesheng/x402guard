import type { AuditResult, AuditTier, RiskLevel, Recommendation } from "@x402guard/shared-types";
import { API_URL } from "./constants";

export interface AuditResponse {
  success: boolean;
  data?: AuditResult;
  error?: string;
  paymentRequired?: boolean;
  paymentDetails?: {
    transactionHash?: string;
  };
}

export async function runAudit(
  tier: AuditTier,
  body: { skill_url?: string; skill_content?: string },
  fetchFn: typeof fetch = fetch
): Promise<AuditResponse> {
  try {
    const response = await fetchFn(`${API_URL}/api/audit/${tier}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status === 402) {
      return { success: false, paymentRequired: true };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
    };
  }
}

export function getRiskColor(score: number): string {
  if (score < 25) return "green";
  if (score < 50) return "yellow";
  if (score < 75) return "orange";
  return "red";
}

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case "LOW":
      return "text-green-400";
    case "MEDIUM":
      return "text-yellow-400";
    case "HIGH":
      return "text-orange-400";
    case "CRITICAL":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function getRecommendationColor(recommendation: Recommendation): string {
  switch (recommendation) {
    case "SAFE":
      return "text-green-400";
    case "CAUTION":
      return "text-yellow-400";
    case "DANGEROUS":
      return "text-orange-400";
    case "BLOCKED":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}
