# x402guard Documentation

> Pre-install security auditing for AI agent skills — powered by x402

## Quick Links

| Document | Description |
|----------|-------------|
| [Quickstart](./QUICKSTART.md) | Get started in 5 minutes |
| [API Reference](./API_REFERENCE.md) | HTTP API documentation |
| [SDK Reference](./SDK_REFERENCE.md) | TypeScript SDK (X402GuardClient) |

## Core Concepts

- [The Problem](./PROBLEM.md) - Why skill security matters
- [Security Layers](./SECURITY_LAYERS.md) - How x402guard fits in the stack
- [Skills Explained](./SKILLS_EXPLAINED.md) - What are AI agent skills

## Guides

- [Quickstart](./QUICKSTART.md) - Get started in 5 minutes
- [SDK Reference](./SDK_REFERENCE.md) - X402GuardClient API
- [Agent Integration](./AGENT_INTEGRATION.md) - Integrate with AI agents (OpenClaw, LangChain)
- [Deployment](./DEPLOYMENT.md) - Deploy to production
- [AWS Deployment](./AWS_DEPLOYMENT.md) - Deploy to AWS

## Reference

- [API Reference](./API_REFERENCE.md) - HTTP API documentation
- [EIP-712 Attestation](./EIP712_ATTESTATION.md) - Cryptographic attestation signing
- [Detection Rules](./DETECTION_RULES.md) - YARA-style pattern matching (10 rules, 40+ patterns)
- [Risk Scoring](./RISK_SCORING.md) - How scores are calculated
- [Self-Hosting](./SELF_HOSTING.md) - Run your own x402guard server

## Overview

x402guard provides pre-install security auditing for AI agent skills. Before installing any skill from ClawHub or other sources, use x402guard to:

1. **Detect malware** - YARA-based scanning for credential stealers, backdoors
2. **Analyze permissions** - What files/network access does the skill need?
3. **Check network calls** - Does it phone home to suspicious endpoints?
4. **Get risk score** - 0-100 score with clear recommendation

## AI Agent Integration

x402guard serves a SKILL.md file that teaches AI agents how to use the API:

```bash
# Get the teaching document (markdown)
curl https://x402guard.xyz/api/skill.md

# Get structured metadata (JSON)
curl https://x402guard.xyz/api/skill.json
```

AI agents can read skill.md to learn:
- How to call audit endpoints
- How to handle x402 payments
- How to interpret results

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent / User                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Audit request + x402 payment
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     x402guard API                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ YARA Scanner│  │ Permission  │  │ Network Analyzer    │  │
│  │             │  │ Analyzer    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                              │                               │
│                    ┌─────────────────┐                      │
│                    │ Risk Calculator │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Audit result + attestation
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent / User                          │
│                                                              │
│  risk_score: 12, recommendation: SAFE → Install skill ✓     │
└─────────────────────────────────────────────────────────────┘
```

## Payment

x402guard uses the [x402 protocol](https://x402.org) for payments:

- **Network**: Base Mainnet (Chain ID: 8453)
- **Asset**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Protocol**: x402 v2

| Tier | Price | Features |
|------|-------|----------|
| Quick | $0.01 | YARA malware scan |
| Standard | $0.05 | + Permission analysis + Network detection |
| Deep | $0.10 | + Behavioral sandbox + Signed attestation |

No accounts, no subscriptions - just pay per audit with your agent wallet.

## Quick Example

```typescript
import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_KEY!,
});

const result = await client.auditSkill({
  skillUrl: 'https://clawhub.com/skills/weather',
  tier: 'standard',
});

if (result.recommendation === 'SAFE') {
  console.log('✅ Safe to install');
} else if (result.recommendation === 'BLOCKED') {
  console.log('❌ Malware detected:', result.findings.malware);
}
```

## API Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/skill.md` | GET | Free | SKILL.md teaching document |
| `/skill.json` | GET | Free | Structured metadata |
| `/health` | GET | Free | Health check |
| `/pricing` | GET | Free | Pricing info |
| `/audit/quick` | POST | $0.01 | YARA malware scan |
| `/audit/standard` | POST | $0.05 | + Permissions + Network |
| `/audit/deep` | POST | $0.10 | + Sandbox + EIP-712 Attestation |
| `/verify` | POST | Free | Verify EIP-712 attestations |

## Detection Rules

x402guard detects these threat categories:

| Category | Severity | Examples |
|----------|----------|----------|
| Credential Theft (env) | CRITICAL | `process.env.AWS_SECRET` |
| Credential Theft (files) | CRITICAL | `.ssh/id_rsa`, `.aws/credentials` |
| Data Exfiltration | HIGH | `curl --data`, `fetch POST` |
| Reverse Shell | CRITICAL | `nc -e`, `bash -i` |
| Destructive Commands | CRITICAL | `rm -rf /`, `mkfs` |
| Code Execution | HIGH | `eval()`, `child_process` |
| Obfuscation | HIGH | `atob()`, `String.fromCharCode` |

See [Detection Rules](./DETECTION_RULES.md) for the full list of 10 YARA rules and 40+ patterns.

## Links

- **Production API**: https://x402guard.xyz
- **x402 Protocol**: https://x402.org
- **ClawHub**: https://clawhub.com
