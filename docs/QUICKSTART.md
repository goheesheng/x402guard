# Quickstart

Get started with SkillGuard in 5 minutes.

## Prerequisites

- Node.js 18+
- A wallet with USDC on Base mainnet
- Private key for x402 payments

## Installation

```bash
npm install skillguard-client @x402/core @x402/evm
```

## Usage

### 1. Basic Audit

```typescript
import { SkillGuardClient } from 'skillguard-client';

const client = new SkillGuardClient({
  privateKey: process.env.PRIVATE_KEY!,
});

const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard',
});

console.log('Risk Score:', result.risk_score);
console.log('Recommendation:', result.recommendation);
```

### 2. Check Before Install

```typescript
const safe = await client.isSafe('https://clawdhub.com/skills/ssh-helper');

if (safe) {
  console.log('✅ Safe to install');
  // Proceed with installation
} else {
  console.log('⚠️ Review findings before installing');
}
```

### 3. Quick One-Shot

```typescript
import { auditSkill } from 'skillguard-client';

const result = await auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  privateKey: process.env.PRIVATE_KEY!,
});
```

## Using cURL

```bash
# Quick audit ($0.05)
curl -X POST https://skillguard-api.vercel.app/audit/quick \
  -H "Content-Type: application/json" \
  -H "X-Payment: <x402-payment-token>" \
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'

# Standard audit ($0.15)
curl -X POST https://skillguard-api.vercel.app/audit/standard \
  -H "Content-Type: application/json" \
  -H "X-Payment: <x402-payment-token>" \
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'
```

## Response

```json
{
  "risk_score": 12,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": [{ "type": "network", "action": "read", "target": "api.weather.com" }],
    "network": [{ "url": "api.weather.com", "external": true }],
    "credentials": []
  },
  "audit_id": "aud_abc123",
  "timestamp": "2026-01-31T10:30:00Z",
  "tier": "standard"
}
```

## Next Steps

- [Agent Integration](./AGENT_INTEGRATION.md) - Integrate with OpenClaw, LangChain, etc.
- [API Reference](./API_REFERENCE.md) - Complete API docs
- [Self-Hosting](./SELF_HOSTING.md) - Run your own server
