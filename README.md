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
npm install x402guard-client @x402/core @x402/evm viem
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

## How Scanning Works

x402guard uses a multi-layer detection engine:

```
┌─────────────────────────────────────────────────────────────┐
│                    SKILL CONTENT INPUT                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ YARA Scanner  │   │ Permission      │   │ Network         │
│               │   │ Analyzer        │   │ Detector        │
│ 10 rules for: │   │                 │   │                 │
│ • Cred theft  │   │ • File access   │   │ • External URLs │
│ • Exfiltration│   │ • Env vars      │   │ • Webhook sites │
│ • Shells      │   │ • Credentials   │   │ • POST requests │
│ • Obfuscation │   │ • System calls  │   │ • Tunnels       │
└───────┬───────┘   └────────┬────────┘   └────────┬────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             ▼
                 ┌───────────────────────┐
                 │   Risk Calculator     │
                 │                       │
                 │ Score: 0-100          │
                 │ Level: LOW → CRITICAL │
                 └───────────┬───────────┘
                             ▼
         ┌───────────────────────────────────────┐
         │          RECOMMENDATION               │
         │  SAFE | CAUTION | DANGEROUS | BLOCKED │
         └───────────────────────────────────────┘
```

### Detection Rules

| Rule | Severity | What It Catches |
|------|----------|-----------------|
| `credential_theft_env` | CRITICAL | `process.env.SECRET`, `Object.keys(process.env)` |
| `credential_theft_files` | CRITICAL | `.aws/credentials`, `.ssh/id_rsa`, `.env` |
| `data_exfiltration` | HIGH | `curl --data`, `fetch(...POST)`, `axios.post` |
| `known_exfil_domains` | HIGH | `webhook.site`, `requestbin`, `ngrok.io` |
| `reverse_shell` | CRITICAL | `nc -e`, `bash -i`, `/dev/tcp/` |
| `destructive_commands` | CRITICAL | `rm -rf /`, `mkfs`, `format c:` |
| `privilege_escalation` | HIGH | `sudo`, `chmod 777`, `chmod +s` |
| `code_execution` | HIGH | `eval()`, `new Function()`, `child_process` |
| `obfuscation_techniques` | HIGH | `atob()`, `\x72\x6d`, `String.fromCharCode` |
| `browser_data_theft` | HIGH | `document.cookie`, `localStorage`, `Chrome/Login Data` |

See [Detection Rules](./docs/DETECTION_RULES.md) for full pattern details.

## Pricing

Pay-per-audit with USDC on Base mainnet. No accounts, no subscriptions.

| Tier | Price | Features |
|------|-------|----------|
| Quick | $0.05 | YARA malware scan |
| Standard | $0.15 | + Permission analysis + Network detection |
| Deep | $0.50 | + Behavioral sandbox + Signed attestation |

## x402 Payment Flow

x402guard uses the [x402 protocol](https://x402.org) for pay-per-audit. No accounts needed.

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│  Client  │         │  x402guard   │         │ Facilitator │
└────┬─────┘         └──────┬───────┘         └──────┬──────┘
     │                      │                        │
     │ POST /audit/quick    │                        │
     │ (no payment)         │                        │
     │─────────────────────>│                        │
     │                      │                        │
     │ 402 Payment Required │                        │
     │ PAYMENT-REQUIRED:    │                        │
     │ {amount, asset, payTo}                        │
     │<─────────────────────│                        │
     │                      │                        │
     │ Sign payment tx      │                        │
     │ with wallet          │                        │
     │                      │                        │
     │ POST /audit/quick    │                        │
     │ X-PAYMENT: <signed>  │                        │
     │─────────────────────>│                        │
     │                      │  Verify + settle       │
     │                      │─────────────────────-->│
     │                      │                        │
     │                      │  USDC transferred      │
     │                      │<─────────────────────  │
     │                      │                        │
     │ 200 OK               │                        │
     │ {risk_score, findings}                        │
     │<─────────────────────│                        │
```

The `PAYMENT-REQUIRED` header (base64-encoded) contains:
```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "50000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x..."
  }]
}
```

- **Network**: Base Mainnet (CAIP-2: `eip155:8453`)
- **Asset**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Amount**: In atomic units (6 decimals) — `50000` = $0.05

## AI Agent Integration (SKILL.md)

x402guard provides a SKILL.md file that teaches AI agents (OpenClaw, LangChain, etc.) how to use the scanning API autonomously.

### For AI Agents

Fetch the skill document to learn how to use x402guard:

```bash
# Get the teaching document (markdown)
curl https://x402guard.xyz/api/skill.md

# Get structured metadata (JSON)
curl https://x402guard.xyz/api/skill.json
```

The SKILL.md includes:
- API endpoint documentation
- x402 payment flow instructions
- Code examples (curl, TypeScript)
- Response interpretation guide

### OpenClaw Integration

The skill follows OpenClaw's format with proper metadata:

```yaml
---
name: x402guard
description: Pre-install security scanning for AI agent skills
metadata:
  openclaw:
    requires:
      env: [WALLET_PRIVATE_KEY]
---
```

### Available Skill Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/skill.md` | SKILL.md as markdown |
| `GET /api/skill.json` | Structured metadata as JSON |
| `GET /api/skills/x402guard.md` | ClawHub-style path |
| `GET /api/skills/x402guard.json` | ClawHub-style JSON |

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

## Web UI (Coming Soon)

x402guard will include a modern web interface for scanning skills without writing code:

- **Human/Agent Toggle** - Tailored onboarding for both audiences
- **Interactive Scanner** - Paste URL or skill content, select tier, scan
- **Visual Results** - Risk score gauge, findings breakdown, recommendations
- **Wallet Integration** - Connect MetaMask, pay with USDC on Base

The web UI will be available at `https://x402guard.xyz` once deployed.

## Project Structure

```
skillguard-monorepo/
├── apps/
│   └── web/               # Next.js web UI (coming soon)
├── server/                # Express API server
│   └── src/
│       ├── services/      # Audit engine, YARA scanner
│       ├── routes/        # API endpoints
│       └── content/       # SKILL.md content
├── packages/
│   ├── x402guard-client/  # TypeScript SDK
│   └── shared-types/      # Shared TypeScript types
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

## API Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/skill.md` | GET | Free | SKILL.md teaching document |
| `/api/skill.json` | GET | Free | Structured metadata |
| `/api/health` | GET | Free | Health check |
| `/api/pricing` | GET | Free | Pricing info |
| `/api/audit/quick` | POST | $0.05 | YARA malware scan |
| `/api/audit/standard` | POST | $0.15 | + Permissions + Network |
| `/api/audit/deep` | POST | $0.50 | + Sandbox + Attestation |

## Links

- **Production API**: https://x402guard.xyz
- **x402 Protocol**: https://x402.org
- **ClawHub**: https://clawhub.com

---

Copyright (c) 2026 Eesheng. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without express written permission from the copyright holder.
