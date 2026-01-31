# x402guard

> **Pre-install security auditing for AI agent skills** — powered by x402

[![x402](https://img.shields.io/badge/x402-enabled-blue.svg)](https://x402.org)
[![Base](https://img.shields.io/badge/Base-mainnet-blue.svg)](https://base.org)

## What is x402guard?

AI agents use "skills" (markdown files with embedded code) to gain new capabilities. A malicious skill can steal your credentials **before any payment happens** — bypassing x402-secure and Trustline entirely. x402guard scans skills before installation to catch credential theft, data exfiltration, and malware.

## The Problem

```
WITHOUT x402guard:
┌─────────────────────────────────────────────────────────────┐
│ 1. User installs weather-skill.md     ← No security check   │
│ 2. Skill reads ~/.aws/credentials     ← tAudit: NOT triggered│
│ 3. Skill POSTs to attacker server     ← x402-secure: NOT triggered│
│ 4. Credentials stolen                 ← TOO LATE            │
└─────────────────────────────────────────────────────────────┘

WITH x402guard:
┌─────────────────────────────────────────────────────────────┐
│ 1. User requests x402guard audit      ← Before install      │
│ 2. x402guard scans skill content      ← Detects malware     │
│ 3. Returns: BLOCKED (credential_theft)← User warned         │
│ 4. Skill NOT installed                ← PROTECTED           │
└─────────────────────────────────────────────────────────────┘
```

## Security Layers

x402guard is **Layer 2** in the AI agent security stack:

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: x402-secure     │ Payment authorization            │
│                          │ When: Each transaction           │
├──────────────────────────┼──────────────────────────────────┤
│ LAYER 3: tAudit          │ Runtime code integrity           │
│                          │ When: SDK initialization         │
├──────────────────────────┼──────────────────────────────────┤
│ LAYER 2: x402guard  ←    │ Pre-install skill auditing       │
│                          │ When: Before installation        │
├──────────────────────────┼──────────────────────────────────┤
│ LAYER 1: ERC-8004        │ Agent identity                   │
│                          │ When: Agent creation             │
└─────────────────────────────────────────────────────────────┘
```

| Attack Type | x402guard | tAudit | x402-secure |
|-------------|-----------|--------|-------------|
| Credential theft (no payment) | Catches | Misses | Misses |
| Data exfiltration (HTTP POST) | Catches | Misses | Misses |
| Tampered payment SDK | Misses | Catches | Misses |
| Unauthorized payment | Misses | Misses | Catches |

## Quick Start

```bash
npm install x402guard-client @x402/core @x402/evm
```

```typescript
import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_KEY!,
});

const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard',
});

if (result.recommendation === 'BLOCKED') {
  console.log('Malicious skill detected:', result.findings.malware);
} else if (result.recommendation === 'SAFE') {
  console.log('Safe to install');
}
```

## Pricing

Pay-per-audit with USDC on Base mainnet. No accounts, no subscriptions.

| Tier | Price | Features |
|------|-------|----------|
| Quick | $0.05 | YARA malware scan |
| Standard | $0.15 | + Permission analysis + Network detection |
| Deep | $0.50 | + Behavioral sandbox + Signed attestation |

## Documentation

**Core Concepts**
- [The Problem](./docs/PROBLEM.md) — Why skill security matters
- [Security Layers](./docs/SECURITY_LAYERS.md) — How x402guard fits in the stack
- [Skills Explained](./docs/SKILLS_EXPLAINED.md) — What are AI agent skills

**Guides**
- [Quickstart](./docs/QUICKSTART.md) — Get started in 5 minutes
- [SDK Reference](./docs/SDK_REFERENCE.md) — X402GuardClient API
- [Agent Integration](./docs/AGENT_INTEGRATION.md) — OpenClaw, LangChain, etc.
- [Deployment](./docs/DEPLOYMENT.md) — Deploy to production

**Reference**
- [API Reference](./docs/API_REFERENCE.md) — HTTP API documentation
- [Detection Rules](./docs/DETECTION_RULES.md) — YARA-style patterns
- [Risk Scoring](./docs/RISK_SCORING.md) — How scores work
- [Self-Hosting](./docs/SELF_HOSTING.md) — Run your own server

## Project Structure

```
x402guard/
├── server/                # Express API server
│   └── src/
│       ├── services/      # Audit engine, YARA scanner
│       └── routes/        # API endpoints
├── packages/
│   └── x402guard-client/  # TypeScript SDK
├── examples/              # Usage examples
└── docs/                  # Documentation
```

## Development

```bash
# Install dependencies
pnpm install

# Start server (runs on localhost:3000)
pnpm dev:server

# Build
pnpm build
```

## Links

- **x402 Protocol**: https://x402.org
- **x402-secure (t54)**: https://github.com/t54-labs/x402-secure
- **ClawdHub**: https://clawdhub.com

---

Copyright (c) 2026 Eesheng. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without express written permission from the copyright holder.
