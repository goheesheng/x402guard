# SDK Reference: X402GuardClient

## Installation

```bash
npm install x402guard-client
# or
pnpm add x402guard-client
# or
yarn add x402guard-client
```

### Peer Dependencies

The SDK uses x402 for payments. These are automatically installed:

```json
{
  "@x402/core": "^2.0.0",
  "@x402/fetch": "^2.0.0",
  "@x402/evm": "^2.0.0",
  "viem": "^2.0.0"
}
```

## Quick Start

```typescript
import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_PRIVATE_KEY!,
});

const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard',
});

if (result.recommendation === 'SAFE') {
  console.log('✅ Safe to install');
} else {
  console.log('⚠️ Risk detected:', result.findings);
}
```

## Client Configuration

### X402GuardConfig

```typescript
interface X402GuardConfig {
  /** x402guard API URL (default: https://x402guard.vercel.app) */
  apiUrl?: string;

  /** Private key for x402 payments (hex string with 0x prefix) */
  privateKey: string;

  /** Network: 'mainnet' or 'testnet' (default: mainnet) */
  network?: 'mainnet' | 'testnet';
}
```

### Example Configurations

```typescript
// Production (Base mainnet)
const client = new X402GuardClient({
  privateKey: process.env.WALLET_KEY!,
  // Uses default mainnet settings
});

// Custom API URL (self-hosted)
const client = new X402GuardClient({
  privateKey: process.env.WALLET_KEY!,
  apiUrl: 'https://my-x402guard.example.com',
});

// Testnet (Base Sepolia)
const client = new X402GuardClient({
  privateKey: process.env.TESTNET_KEY!,
  network: 'testnet',
});
```

## Methods

### `auditSkill(request: AuditRequest): Promise<AuditResult>`

Audit a skill for security issues.

#### Parameters

```typescript
interface AuditRequest {
  /** URL to the skill (e.g., ClawdHub skill URL) */
  skillUrl?: string;

  /** Raw skill content (alternative to skillUrl) */
  skillContent?: string;

  /** Audit tier: 'quick' ($0.05), 'standard' ($0.15), 'deep' ($0.50) */
  tier?: 'quick' | 'standard' | 'deep';
}
```

**Note:** You must provide either `skillUrl` OR `skillContent`, not both.

#### Example

```typescript
// Audit by URL
const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard',
});

// Audit raw content
const skillContent = `
# My Skill
## Code
\`\`\`javascript
console.log('hello');
\`\`\`
`;

const result = await client.auditSkill({
  skillContent,
  tier: 'quick',
});
```

---

### `quickAudit(skillUrl: string): Promise<AuditResult>`

Shorthand for quick tier audit ($0.05 USDC).

```typescript
const result = await client.quickAudit('https://clawdhub.com/skills/weather');
```

---

### `standardAudit(skillUrl: string): Promise<AuditResult>`

Shorthand for standard tier audit ($0.15 USDC).

```typescript
const result = await client.standardAudit('https://clawdhub.com/skills/weather');
```

---

### `deepAudit(skillUrl: string): Promise<AuditResult>`

Shorthand for deep tier audit ($0.50 USDC).

```typescript
const result = await client.deepAudit('https://clawdhub.com/skills/weather');
```

---

### `isSafe(skillUrl: string, tier?: AuditTier): Promise<boolean>`

Check if a skill is safe to install.

Returns `true` if:
- Recommendation is `SAFE`, OR
- Recommendation is `CAUTION` AND risk_score < 30

```typescript
const safe = await client.isSafe('https://clawdhub.com/skills/weather');

if (safe) {
  await installSkill(skillUrl);
} else {
  console.log('⚠️ Review before installing');
}
```

---

### `health(): Promise<HealthResponse>`

Check API health (free endpoint, no payment required).

```typescript
const health = await client.health();
console.log(health.status);  // 'ok' | 'degraded' | 'down'
console.log(health.version); // '0.1.0'
```

## Response Types

### AuditResult

```typescript
interface AuditResult {
  /** Risk score from 0-100 */
  risk_score: number;

  /** Risk level classification */
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  /** Installation recommendation */
  recommendation: 'SAFE' | 'CAUTION' | 'DANGEROUS' | 'BLOCKED';

  /** Detailed findings */
  findings: AuditFindings;

  /** Unique audit identifier */
  audit_id: string;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Audit tier used */
  tier: 'quick' | 'standard' | 'deep';

  /** On-chain attestation (deep tier only) */
  attestation?: {
    signature: string;
    signer: string;
    chain: string;
  };
}
```

### AuditFindings

```typescript
interface AuditFindings {
  /** YARA malware matches */
  malware: YaraMatch[];

  /** Credential access detected */
  credentials: {
    type: string;      // e.g., '.aws/credentials'
    pattern: string;   // Matched pattern
    risk: RiskLevel;
  }[];

  /** Network calls detected */
  network: NetworkCall[];

  /** Permission requirements */
  permissions: Permission[];
}
```

### YaraMatch

```typescript
interface YaraMatch {
  /** Detection rule name */
  rule: string;  // e.g., 'credential_theft_files'

  /** Severity level */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  /** Human-readable description */
  description: string;

  /** Byte offset in content */
  offset: number;

  /** Match length in bytes */
  length: number;
}
```

### NetworkCall

```typescript
interface NetworkCall {
  /** Target URL */
  url: string;

  /** Whether it's an external domain */
  external: boolean;

  /** HTTP method if detected */
  method?: string;
}
```

### Permission

```typescript
interface Permission {
  /** Permission category */
  type: 'filesystem' | 'network' | 'credential' | 'system';

  /** Action being performed */
  action: 'read' | 'write' | 'execute' | 'transmit';

  /** Target resource */
  target: string;

  /** Risk level */
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
```

## Pricing Constants

```typescript
import { PRICING } from 'x402guard-client';

console.log(PRICING.quick);    // { price: 50000, usd: 0.05 }
console.log(PRICING.standard); // { price: 150000, usd: 0.15 }
console.log(PRICING.deep);     // { price: 500000, usd: 0.50 }
```

Price values are in USDC atomic units (6 decimals).

## Convenience Function

For one-shot audits without creating a client instance:

```typescript
import { auditSkill } from 'x402guard-client';

const result = await auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  privateKey: process.env.WALLET_KEY!,
  tier: 'standard',
});
```

## Error Handling

### Common Errors

```typescript
try {
  const result = await client.auditSkill({ skillUrl });
} catch (error) {
  if (error.message.includes('402')) {
    console.log('Payment failed - check wallet balance');
  } else if (error.message.includes('400')) {
    console.log('Invalid request - check skill URL/content');
  } else if (error.message.includes('500')) {
    console.log('Server error - try again later');
  }
}
```

### Checking Wallet Balance

Before auditing, ensure your wallet has sufficient USDC:

```typescript
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_ABI = parseAbi(['function balanceOf(address) view returns (uint256)']);

const client = createPublicClient({
  chain: base,
  transport: http(),
});

const balance = await client.readContract({
  address: USDC_ADDRESS,
  abi: USDC_ABI,
  functionName: 'balanceOf',
  args: [walletAddress],
});

const balanceUSD = Number(balance) / 1e6;
console.log(`USDC Balance: $${balanceUSD.toFixed(2)}`);

if (balanceUSD < 0.15) {
  console.log('Insufficient balance for standard audit');
}
```

## Full Example

```typescript
import { X402GuardClient, AuditResult } from 'x402guard-client';

async function auditBeforeInstall(skillUrl: string): Promise<boolean> {
  const client = new X402GuardClient({
    privateKey: process.env.WALLET_KEY!,
  });

  // Check API health first
  const health = await client.health();
  if (health.status !== 'ok') {
    console.log('⚠️ API degraded, results may be delayed');
  }

  // Run standard audit
  console.log(`Auditing: ${skillUrl}`);
  const result: AuditResult = await client.auditSkill({
    skillUrl,
    tier: 'standard',
  });

  // Log results
  console.log(`\nAudit ID: ${result.audit_id}`);
  console.log(`Risk Score: ${result.risk_score}/100`);
  console.log(`Risk Level: ${result.risk_level}`);
  console.log(`Recommendation: ${result.recommendation}`);

  // Handle findings
  if (result.findings.malware.length > 0) {
    console.log('\n🚨 Malware Detected:');
    result.findings.malware.forEach(match => {
      console.log(`  - [${match.severity}] ${match.rule}: ${match.description}`);
    });
  }

  if (result.findings.credentials.length > 0) {
    console.log('\n⚠️ Credential Access:');
    result.findings.credentials.forEach(cred => {
      console.log(`  - [${cred.risk}] ${cred.type}`);
    });
  }

  if (result.findings.network.length > 0) {
    console.log('\n🌐 Network Calls:');
    result.findings.network.forEach(call => {
      const flag = call.external ? '(EXTERNAL)' : '';
      console.log(`  - ${call.method || 'GET'} ${call.url} ${flag}`);
    });
  }

  // Decision
  switch (result.recommendation) {
    case 'SAFE':
      console.log('\n✅ Safe to install');
      return true;
    case 'CAUTION':
      console.log('\n⚠️ Review findings before installing');
      return result.risk_score < 30;
    case 'DANGEROUS':
      console.log('\n🚨 Not recommended - high risk detected');
      return false;
    case 'BLOCKED':
      console.log('\n🛑 BLOCKED - Malicious patterns detected');
      return false;
  }
}

// Usage
const canInstall = await auditBeforeInstall('https://clawdhub.com/skills/weather');
if (canInstall) {
  // Proceed with installation
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions. All types are exported:

```typescript
import {
  X402GuardClient,
  X402GuardConfig,
  AuditRequest,
  AuditResult,
  AuditFindings,
  YaraMatch,
  NetworkCall,
  Permission,
  AuditTier,
  RiskLevel,
  Recommendation,
  PRICING,
  DEFAULT_API_URL,
  auditSkill,
} from 'x402guard-client';
```

## Next Steps

- [Detection Rules](./DETECTION_RULES.md) — What patterns are detected
- [Risk Scoring](./RISK_SCORING.md) — How scores are calculated
- [API Reference](./API_REFERENCE.md) — HTTP API documentation
