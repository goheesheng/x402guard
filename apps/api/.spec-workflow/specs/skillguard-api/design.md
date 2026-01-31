# SkillGuard API - Design Document

## Architecture

### System Components

```
┌──────────────────────────────────────────────────────────────────┐
│                          Client                                   │
│                    (AI Agent / Human)                            │
└────────────────────────────┬─────────────────────────────────────┘
                             │ POST /audit
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     x402 Payment Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  @x402/express middleware                                    │ │
│  │  - Validates payment signature                               │ │
│  │  - Verifies with CDP facilitator                            │ │
│  │  - Settles payment on Base                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │ Payment verified
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Express Router                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  POST /audit     - Main audit endpoint                       │ │
│  │  GET /health     - Health check (free)                       │ │
│  │  GET /pricing    - Pricing info (free)                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Audit Engine                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐│
│  │ Skill Parser  │  │ YARA Scanner  │  │ Permission Analyzer   ││
│  │               │  │               │  │                       ││
│  │ - Parse MD    │  │ - Load rules  │  │ - Filesystem patterns ││
│  │ - Extract     │  │ - Scan content│  │ - Network patterns    ││
│  │   code blocks │  │ - Return      │  │ - Credential patterns ││
│  │ - Validate    │  │   matches     │  │ - Generate manifest   ││
│  └───────────────┘  └───────────────┘  └───────────────────────┘│
│  ┌───────────────┐  ┌───────────────────────────────────────────┐│
│  │ Network       │  │ Risk Calculator                           ││
│  │ Detector      │  │                                           ││
│  │               │  │ - Weight findings                         ││
│  │ - Extract URLs│  │ - Calculate score 0-100                   ││
│  │ - Categorize  │  │ - Determine level (LOW/MED/HIGH/CRIT)     ││
│  │ - Flag extern │  │ - Generate recommendation                 ││
│  └───────────────┘  └───────────────────────────────────────────┘│
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Response                                      │
│  {                                                                │
│    risk_score: 23,                                               │
│    risk_level: "LOW",                                            │
│    recommendation: "SAFE",                                       │
│    findings: {...},                                              │
│    audit_id: "...",                                              │
│    timestamp: "..."                                              │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. x402 Payment Middleware

```typescript
// src/middleware/x402.ts
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL
});

const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

export const x402Config = {
  "POST /audit": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.05", // Quick tier default
        network: "eip155:8453",
        payTo: process.env.X402_PAY_TO_ADDRESS,
      }
    ],
    description: "Audit an agent skill for security threats",
    mimeType: "application/json",
    extensions: {
      bazaar: {
        discoverable: true,
        category: "security",
        tags: ["audit", "skills", "agents", "trust"]
      }
    }
  }
};
```

### 2. Skill Parser

```typescript
// src/services/auditEngine/parser.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';

interface ParsedSkill {
  frontmatter: Record<string, any>;
  content: string;
  codeBlocks: CodeBlock[];
  urls: string[];
  commands: string[];
}

export async function parseSkill(content: string): Promise<ParsedSkill> {
  // Parse markdown
  const tree = unified().use(remarkParse).parse(content);
  
  // Extract code blocks
  const codeBlocks = extractCodeBlocks(tree);
  
  // Extract URLs
  const urls = extractUrls(content);
  
  // Extract shell commands
  const commands = extractCommands(codeBlocks);
  
  return {
    frontmatter: parseFrontmatter(content),
    content,
    codeBlocks,
    urls,
    commands
  };
}
```

### 3. YARA Scanner

```typescript
// src/services/auditEngine/yaraScanner.ts
import { Yara } from 'yara-js';

interface YaraMatch {
  rule: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  offset: number;
  length: number;
}

const RULES = {
  credentialTheft: `
    rule credential_theft {
      meta:
        severity = "CRITICAL"
        description = "Attempts to read credential files or environment variables"
      strings:
        $env1 = /process\\.env\\[['"]\\w+['"]\\]/ nocase
        $env2 = /\\$\\{?\\w+_KEY\\}?/ nocase
        $file1 = /\\.ssh\\/id_rsa/ nocase
        $file2 = /\\.env/ nocase
        $file3 = /credentials/ nocase
        $file4 = /secrets/ nocase
      condition:
        any of them
    }
  `,
  dataExfil: `
    rule data_exfiltration {
      meta:
        severity = "HIGH"
        description = "Suspicious data transmission to external servers"
      strings:
        $curl = /curl\\s+.*http/ nocase
        $wget = /wget\\s+.*http/ nocase
        $fetch = /fetch\\(['"]http/ nocase
        $post = /POST.*webhook/ nocase
      condition:
        any of them
    }
  `,
  destructive: `
    rule destructive_commands {
      meta:
        severity = "CRITICAL"
        description = "Potentially destructive system commands"
      strings:
        $rm = /rm\\s+-rf\\s+\\/|--no-preserve-root/ nocase
        $format = /format\\s+c:/ nocase
        $dd = /dd\\s+if=.*of=\\/dev/ nocase
      condition:
        any of them
    }
  `
};

export async function scanWithYara(content: string): Promise<YaraMatch[]> {
  const yara = new Yara();
  const matches: YaraMatch[] = [];
  
  for (const [name, rule] of Object.entries(RULES)) {
    await yara.addRules(rule);
  }
  
  const results = await yara.scan(content);
  
  for (const result of results) {
    matches.push({
      rule: result.rule,
      severity: result.meta.severity,
      description: result.meta.description,
      offset: result.strings[0]?.offset || 0,
      length: result.strings[0]?.length || 0
    });
  }
  
  return matches;
}
```

### 4. Permission Analyzer

```typescript
// src/services/auditEngine/permissionAnalyzer.ts

interface Permission {
  type: "filesystem" | "network" | "credential" | "system";
  action: "read" | "write" | "execute" | "transmit";
  target: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

const PATTERNS = {
  filesystem: {
    read: [/readFile/, /fs\.read/, /cat\s/, /less\s/, /head\s/],
    write: [/writeFile/, /fs\.write/, /echo\s.*>/, /tee\s/],
  },
  network: {
    transmit: [/fetch\(/, /axios\./, /http\.request/, /curl\s/, /wget\s/],
  },
  credential: {
    read: [/process\.env/, /\.env/, /\.ssh/, /\.aws/, /keychain/],
  },
  system: {
    execute: [/exec\(/, /spawn\(/, /system\(/, /eval\(/],
  }
};

export function analyzePermissions(content: string): Permission[] {
  const permissions: Permission[] = [];
  
  for (const [type, actions] of Object.entries(PATTERNS)) {
    for (const [action, patterns] of Object.entries(actions)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          permissions.push({
            type: type as Permission["type"],
            action: action as Permission["action"],
            target: pattern.source,
            risk: calculateRisk(type, action)
          });
        }
      }
    }
  }
  
  return permissions;
}
```

### 5. Risk Calculator

```typescript
// src/services/auditEngine/riskCalculator.ts

interface RiskScore {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";
  breakdown: {
    malware: number;
    credentials: number;
    network: number;
    permissions: number;
  };
}

const WEIGHTS = {
  yaraMatch: {
    CRITICAL: 40,
    HIGH: 30,
    MEDIUM: 20,
    LOW: 10
  },
  credentialAccess: 25,
  externalNetwork: 15,
  systemExecution: 20,
  filesystemWrite: 10
};

export function calculateRisk(findings: AuditFindings): RiskScore {
  let score = 0;
  const breakdown = { malware: 0, credentials: 0, network: 0, permissions: 0 };
  
  // YARA matches
  for (const match of findings.yaraMatches) {
    const points = WEIGHTS.yaraMatch[match.severity];
    breakdown.malware += points;
    score += points;
  }
  
  // Credential access
  for (const cred of findings.credentials) {
    breakdown.credentials += WEIGHTS.credentialAccess;
    score += WEIGHTS.credentialAccess;
  }
  
  // Network calls
  for (const net of findings.network) {
    if (net.external) {
      breakdown.network += WEIGHTS.externalNetwork;
      score += WEIGHTS.externalNetwork;
    }
  }
  
  // Cap at 100
  score = Math.min(100, score);
  
  return {
    score,
    level: scoreToLevel(score),
    recommendation: scoreToRecommendation(score),
    breakdown
  };
}

function scoreToLevel(score: number): RiskScore["level"] {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MEDIUM";
  if (score <= 75) return "HIGH";
  return "CRITICAL";
}

function scoreToRecommendation(score: number): RiskScore["recommendation"] {
  if (score <= 25) return "SAFE";
  if (score <= 50) return "CAUTION";
  if (score <= 75) return "DANGEROUS";
  return "BLOCKED";
}
```

### 6. Main Audit Endpoint

```typescript
// src/routes/audit.ts
import { Router } from 'express';
import { parseSkill } from '@/services/auditEngine/parser';
import { scanWithYara } from '@/services/auditEngine/yaraScanner';
import { analyzePermissions } from '@/services/auditEngine/permissionAnalyzer';
import { detectNetworkCalls } from '@/services/auditEngine/networkDetector';
import { calculateRisk } from '@/services/auditEngine/riskCalculator';

const router = Router();

router.post('/audit', async (req, res) => {
  const { skill_content, skill_url, tier = 'quick' } = req.body;
  
  // Get content
  let content: string;
  if (skill_content) {
    content = skill_content;
  } else if (skill_url) {
    content = await fetchSkill(skill_url);
  } else {
    return res.status(400).json({ error: 'skill_content or skill_url required' });
  }
  
  // Parse
  const parsed = await parseSkill(content);
  
  // Scan
  const yaraMatches = await scanWithYara(content);
  
  // Analyze (standard+ tiers)
  let permissions: Permission[] = [];
  let networkCalls: NetworkCall[] = [];
  if (tier !== 'quick') {
    permissions = analyzePermissions(content);
    networkCalls = detectNetworkCalls(parsed);
  }
  
  // Calculate risk
  const risk = calculateRisk({
    yaraMatches,
    credentials: permissions.filter(p => p.type === 'credential'),
    network: networkCalls,
    permissions
  });
  
  // Build response
  const response = {
    risk_score: risk.score,
    risk_level: risk.level,
    recommendation: risk.recommendation,
    findings: {
      malware: yaraMatches,
      credentials: permissions.filter(p => p.type === 'credential'),
      network: networkCalls,
      permissions
    },
    audit_id: generateAuditId(),
    timestamp: new Date().toISOString(),
    tier
  };
  
  res.json(response);
});

export default router;
```

## Data Models

### API Types

```typescript
// src/types/api.ts

interface AuditRequest {
  skill_url?: string;
  skill_content?: string;
  tier?: "quick" | "standard" | "deep";
  format?: "json" | "markdown";
}

interface AuditResponse {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";
  findings: AuditFindings;
  audit_id: string;
  timestamp: string;
  tier: string;
  attestation?: Attestation;
}

interface AuditFindings {
  malware: YaraMatch[];
  credentials: CredentialAccess[];
  network: NetworkCall[];
  permissions: Permission[];
}
```

## Security Design

### Input Validation
- Max content size: 1MB
- URL scheme: HTTPS only
- Content-Type: text/plain, text/markdown
- Rate limit: 100 req/min per IP

### Sandbox (Deep Tier)
- vm2 isolated execution
- 5 second timeout
- 256MB memory limit
- No network access
- No filesystem access

## Deployment

### Vercel Configuration
```json
{
  "version": 2,
  "builds": [
    { "src": "src/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "src/index.ts" }
  ]
}
```

### Environment Variables
```
X402_PAY_TO_ADDRESS=0x...
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
X402_NETWORK=eip155:8453
PRICE_QUICK=50000
PRICE_STANDARD=150000
PRICE_DEEP=500000
```
