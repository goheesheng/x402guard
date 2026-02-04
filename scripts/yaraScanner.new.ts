// server/src/services/auditEngine/yaraScanner.ts
// Refactored to support basic (open source) + premium (proprietary) rules
//
// In open source deployments: only basic rules are available
// In hosted/enterprise: premium rules are loaded from x402guard-infra

import type { YaraMatch } from "../../types/api.js";
import { BASIC_RULES, type Rule } from "../../rules/basic/index.js";

// Try to load premium rules (only available in hosted/enterprise)
let PREMIUM_RULES: Rule[] = [];
let premiumLoaded = false;

async function loadPremiumRules(): Promise<void> {
  if (premiumLoaded) return;
  
  try {
    // Premium rules are symlinked or mounted in production
    const premium = await import("../../rules/premium/index.js");
    PREMIUM_RULES = premium.PREMIUM_RULES || [];
    console.log(`[yaraScanner] ✅ Loaded ${PREMIUM_RULES.length} premium rules`);
  } catch (err) {
    // Premium rules not available - this is expected in open source deployments
    console.log("[yaraScanner] ℹ️  Running with basic rules only (open source mode)");
    PREMIUM_RULES = [];
  }
  
  premiumLoaded = true;
}

// Initialize on module load
loadPremiumRules();

export async function scanWithYara(content: string): Promise<YaraMatch[]> {
  // Ensure premium rules are loaded
  await loadPremiumRules();
  
  const ALL_RULES = [...BASIC_RULES, ...PREMIUM_RULES];
  const matches: YaraMatch[] = [];

  for (const rule of ALL_RULES) {
    for (const pattern of rule.patterns) {
      const match = content.match(pattern);
      if (match) {
        const index = content.indexOf(match[0]);

        matches.push({
          rule: rule.name,
          severity: rule.severity,
          description: rule.description,
          offset: index,
          length: match[0].length,
        });

        // Only report first match per rule
        break;
      }
    }
  }

  return matches;
}

// Export for health checks / debugging
export function getRuleStats(): { basic: number; premium: number; total: number } {
  return {
    basic: BASIC_RULES.length,
    premium: PREMIUM_RULES.length,
    total: BASIC_RULES.length + PREMIUM_RULES.length,
  };
}
