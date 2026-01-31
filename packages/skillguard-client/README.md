# skillguard-client

Client SDK for SkillGuard - x402-powered security auditing for AI agent skills.

## Installation

```bash
npm install skillguard-client @x402/core @x402/evm
```

## Quick Start

```typescript
import { SkillGuardClient } from 'skillguard-client';

const client = new SkillGuardClient({
  privateKey: process.env.PRIVATE_KEY!,
});

// Audit a skill
const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard', // $0.15 USDC
});

console.log(result.risk_level);      // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
console.log(result.recommendation);   // 'SAFE' | 'CAUTION' | 'DANGEROUS' | 'BLOCKED'
console.log(result.findings);         // { malware, permissions, network, credentials }
```

## Audit Tiers

| Tier | Price | Features |
|------|-------|----------|
| `quick` | $0.05 | YARA malware scan |
| `standard` | $0.15 | Full analysis + permissions + network |
| `deep` | $0.50 | Complete audit + behavioral sandbox |

## API

### `SkillGuardClient`

```typescript
const client = new SkillGuardClient({
  apiUrl: 'https://skillguard-api.vercel.app', // optional
  privateKey: '0x...', // required for x402 payments
  network: 'mainnet', // 'mainnet' | 'testnet'
});
```

### Methods

```typescript
// Health check (free)
await client.health();

// Audit skill
await client.auditSkill({ skillUrl, tier });

// Convenience methods
await client.quickAudit(skillUrl);    // $0.05
await client.standardAudit(skillUrl); // $0.15
await client.deepAudit(skillUrl);     // $0.50

// Check if safe to install
const safe = await client.isSafe(skillUrl);
```

## One-Shot Audit

```typescript
import { auditSkill } from 'skillguard-client';

const result = await auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  privateKey: process.env.PRIVATE_KEY!,
  tier: 'standard',
});
```

## License

MIT
