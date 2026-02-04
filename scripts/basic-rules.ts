// server/src/rules/basic/index.ts
// Basic detection rules - Open Source (MIT)
// Community-maintained detection patterns for x402guard
//
// Want to add rules? See CONTRIBUTING.md

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Rule {
  name: string;
  severity: RiskLevel;
  description: string;
  patterns: RegExp[];
}

export const BASIC_RULES: Rule[] = [
  // ============================================
  // CREDENTIAL THEFT - Environment Variables
  // ============================================
  {
    name: "credential_theft_env",
    severity: "CRITICAL",
    description: "Attempts to read environment variables containing secrets",
    patterns: [
      /process\.env\[['"](?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|AUTH)['"]\]/gi,
      /process\.env\.(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|AUTH)/gi,
      /Object\.keys\s*\(\s*process\.env\s*\)/gi,
    ],
  },

  // ============================================
  // CREDENTIAL THEFT - Sensitive Files
  // ============================================
  {
    name: "credential_theft_files",
    severity: "CRITICAL",
    description: "Attempts to read common credential files",
    patterns: [
      /\.ssh\/id_rsa/gi,
      /\.aws\/credentials/gi,
      /\.env\b/gi,
    ],
  },

  // ============================================
  // DATA EXFILTRATION
  // ============================================
  {
    name: "data_exfiltration",
    severity: "HIGH",
    description: "Suspicious data transmission patterns",
    patterns: [
      /curl\s+.*--data.*http/gi,
      /fetch\(['"]http.*method:\s*['"]POST/gi,
      /axios\.post\(['"]http/gi,
    ],
  },

  // ============================================
  // DESTRUCTIVE COMMANDS
  // ============================================
  {
    name: "destructive_commands",
    severity: "CRITICAL",
    description: "Potentially destructive system commands",
    patterns: [
      /rm\s+-rf\s+\/|--no-preserve-root/gi,
      /mkfs\./gi,
      /dd\s+if=.*of=\/dev/gi,
    ],
  },

  // ============================================
  // REVERSE SHELL
  // ============================================
  {
    name: "reverse_shell",
    severity: "CRITICAL",
    description: "Reverse shell connection patterns",
    patterns: [
      /nc\s+-[el]/gi,
      /bash\s+-i/gi,
      /\/dev\/tcp\//gi,
    ],
  },
];
