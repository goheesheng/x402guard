# x402guard Documentation

## Core Concepts

- [The Problem](./PROBLEM.md) - Why skill security matters
- [Security Layers](./SECURITY_LAYERS.md) - How x402guard fits in the stack
- [Skills Explained](./SKILLS_EXPLAINED.md) - What are AI agent skills

## Guides

- [Quickstart](./QUICKSTART.md) - Get started in 5 minutes
- [SDK Reference](./SDK_REFERENCE.md) - X402GuardClient API
- [Agent Integration](./AGENT_INTEGRATION.md) - Integrate with AI agents
- [Deployment](./DEPLOYMENT.md) - Deploy to production

## Reference

- [API Reference](./API_REFERENCE.md) - HTTP API documentation
- [Detection Rules](./DETECTION_RULES.md) - YARA-style pattern matching
- [Risk Scoring](./RISK_SCORING.md) - How scores are calculated
- [Self-Hosting](./SELF_HOSTING.md) - Run your own x402guard server

## Overview

x402guard provides pre-install security auditing for AI agent skills. Before installing any skill from ClawdHub or other sources, use x402guard to:

1. **Detect malware** - YARA-based scanning for credential stealers, backdoors
2. **Analyze permissions** - What files/network access does the skill need?
3. **Check network calls** - Does it phone home to suspicious endpoints?
4. **Get risk score** - 0-100 score with clear recommendation

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

- **Network**: Base (mainnet)
- **Asset**: USDC
- **Pricing**: $0.05 - $0.50 per audit

| Tier | Price | Features |
|------|-------|----------|
| Quick | $0.05 | YARA malware scan |
| Standard | $0.15 | + Permission analysis + Network detection |
| Deep | $0.50 | + Behavioral sandbox + Signed attestation |

No accounts, no subscriptions - just pay per audit with your agent wallet.

## Quick Example

```typescript
import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_KEY!,
});

const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard',
});

if (result.recommendation === 'SAFE') {
  console.log('✅ Safe to install');
}
```
