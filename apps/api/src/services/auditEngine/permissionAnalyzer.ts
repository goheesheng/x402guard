import type { Permission, RiskLevel } from "../../types/api.js";

interface PatternConfig {
  patterns: RegExp[];
  risk: RiskLevel;
}

const PERMISSION_PATTERNS: Record<Permission["type"], Record<Permission["action"], PatternConfig>> = {
  filesystem: {
    read: {
      patterns: [/readFile/gi, /fs\.read/gi, /cat\s+/gi, /less\s+/gi, /head\s+/gi, /tail\s+/gi],
      risk: "LOW",
    },
    write: {
      patterns: [/writeFile/gi, /fs\.write/gi, /fs\.append/gi, /echo\s+.*>/gi, /tee\s+/gi],
      risk: "MEDIUM",
    },
    execute: {
      patterns: [],
      risk: "HIGH",
    },
    transmit: {
      patterns: [],
      risk: "HIGH",
    },
  },
  network: {
    read: {
      patterns: [/fetch\(['"]http/gi, /axios\.get/gi, /http\.get/gi],
      risk: "LOW",
    },
    write: {
      patterns: [],
      risk: "MEDIUM",
    },
    execute: {
      patterns: [],
      risk: "HIGH",
    },
    transmit: {
      patterns: [/fetch.*POST/gi, /axios\.post/gi, /http\.request/gi, /curl\s+/gi, /wget\s+/gi],
      risk: "MEDIUM",
    },
  },
  credential: {
    read: {
      patterns: [
        /process\.env/gi,
        /\.env\b/gi,
        /\.ssh/gi,
        /\.aws/gi,
        /keychain/gi,
        /credentials/gi,
        /secrets/gi,
        /API_KEY/gi,
        /SECRET/gi,
        /TOKEN/gi,
      ],
      risk: "HIGH",
    },
    write: {
      patterns: [],
      risk: "CRITICAL",
    },
    execute: {
      patterns: [],
      risk: "CRITICAL",
    },
    transmit: {
      patterns: [],
      risk: "CRITICAL",
    },
  },
  system: {
    read: {
      patterns: [/os\./gi, /platform/gi, /hostname/gi],
      risk: "LOW",
    },
    write: {
      patterns: [],
      risk: "HIGH",
    },
    execute: {
      patterns: [/exec\(/gi, /spawn\(/gi, /execSync/gi, /spawnSync/gi, /child_process/gi, /shell/gi],
      risk: "HIGH",
    },
    transmit: {
      patterns: [],
      risk: "HIGH",
    },
  },
};

export function analyzePermissions(content: string): Permission[] {
  const permissions: Permission[] = [];
  const seen = new Set<string>();
  
  for (const [type, actions] of Object.entries(PERMISSION_PATTERNS)) {
    for (const [action, config] of Object.entries(actions)) {
      for (const pattern of config.patterns) {
        const match = content.match(pattern);
        if (match) {
          const key = `${type}:${action}:${match[0]}`;
          if (!seen.has(key)) {
            seen.add(key);
            permissions.push({
              type: type as Permission["type"],
              action: action as Permission["action"],
              target: match[0],
              risk: config.risk,
            });
          }
        }
      }
    }
  }
  
  return permissions;
}
