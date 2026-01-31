import type { YaraMatch, RiskLevel } from "../../types/api.js";

// Pattern-based detection (simplified YARA-like)
// In production, use actual yara-js library

interface Rule {
  name: string;
  severity: RiskLevel;
  description: string;
  patterns: RegExp[];
}

const RULES: Rule[] = [
  {
    name: "credential_theft_env",
    severity: "CRITICAL",
    description: "Attempts to read environment variables containing secrets",
    patterns: [
      /process\.env\[['"](?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|AUTH)['"]\]/gi,
      /process\.env\.(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|AUTH)/gi,
      /\$\{?\w*(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\}?/gi,
      /Object\.keys\s*\(\s*process\.env\s*\)/gi, // Enumerating all env vars
      /\.filter\s*\([^)]*(?:KEY|SECRET|TOKEN)/gi, // Filtering for secrets
    ],
  },
  {
    name: "credential_theft_files",
    severity: "CRITICAL",
    description: "Attempts to read credential files",
    patterns: [
      /\.ssh\/id_rsa/gi,
      /\.ssh\/id_ed25519/gi,
      /\.env\b/gi,
      /\.env\.local/gi,
      /credentials\.json/gi,
      /\.aws\/credentials/gi,
      /\.aws\/config/gi,
      /\.npmrc/gi,
      /\.netrc/gi,
      /\.docker\/config\.json/gi,
      /\.kube\/config/gi,
      /\.gnupg/gi,
      /keychain/gi,
      /\.gcloud/gi,
      /service[_-]?account.*\.json/gi,
      /firebase.*\.json/gi,
    ],
  },
  {
    name: "data_exfiltration",
    severity: "HIGH",
    description: "Suspicious data transmission to external servers",
    patterns: [
      /curl\s+.*--data.*http/gi,
      /wget\s+--post-data/gi,
      /fetch\(['"]http.*method:\s*['"]POST/gi,
      /axios\.post\(['"]http/gi,
      /webhook\.site/gi,
      /requestbin/gi,
    ],
  },
  {
    name: "destructive_commands",
    severity: "CRITICAL",
    description: "Potentially destructive system commands",
    patterns: [
      /rm\s+-rf\s+\/|--no-preserve-root/gi,
      /mkfs\./gi,
      /dd\s+if=.*of=\/dev/gi,
      /format\s+c:/gi,
      /del\s+\/s\s+\/q/gi,
    ],
  },
  {
    name: "privilege_escalation",
    severity: "HIGH",
    description: "Attempts to escalate privileges",
    patterns: [
      /sudo\s+/gi,
      /chmod\s+777/gi,
      /chmod\s+\+s/gi,
      /setuid/gi,
      /runas\s+\/user:/gi,
    ],
  },
  {
    name: "code_execution",
    severity: "HIGH",
    description: "Dynamic code execution patterns",
    patterns: [
      /eval\s*\(/gi,
      /new\s+Function\s*\(/gi,
      /exec\s*\(/gi,
      /spawn\s*\(/gi,
      /child_process/gi,
    ],
  },
  {
    name: "browser_data_theft",
    severity: "HIGH",
    description: "Attempts to access browser data",
    patterns: [
      /cookies/gi,
      /localStorage/gi,
      /sessionStorage/gi,
      /IndexedDB/gi,
      /Chrome.*Login Data/gi,
    ],
  },
  {
    name: "obfuscation_techniques",
    severity: "HIGH",
    description: "Code obfuscation patterns often used to hide malicious intent",
    patterns: [
      /atob\s*\(/gi, // Base64 decode
      /Buffer\.from\s*\([^)]+,\s*['"]base64['"]\)/gi, // Node base64
      /\\x[0-9a-f]{2}/gi, // Hex escape sequences
      /String\.fromCharCode/gi, // Character code building
      /\['\\x/gi, // Hex property access
      /\]\s*\.\s*join\s*\(\s*['"]['"]?\s*\)/gi, // Array.join('') obfuscation
    ],
  },
  {
    name: "known_exfil_domains",
    severity: "HIGH",
    description: "Known data exfiltration service domains",
    patterns: [
      /webhook\.site/gi,
      /requestbin/gi,
      /pipedream\.net/gi,
      /hookbin/gi,
      /burpcollaborator/gi,
      /ngrok\.io/gi,
      /localhost\.run/gi,
      /serveo\.net/gi,
      /oast\.fun/gi, // Out-of-band testing
    ],
  },
  {
    name: "reverse_shell",
    severity: "CRITICAL",
    description: "Reverse shell patterns",
    patterns: [
      /nc\s+-[el]/gi, // netcat listener
      /bash\s+-i/gi, // interactive bash
      /\/dev\/tcp\//gi, // bash tcp redirect
      /mkfifo/gi, // named pipe for shell
      /socket\.connect/gi,
      /reverse.*shell/gi,
    ],
  },
];

export async function scanWithYara(content: string): Promise<YaraMatch[]> {
  const matches: YaraMatch[] = [];
  
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = content.match(pattern);
      if (match) {
        // Find position
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
