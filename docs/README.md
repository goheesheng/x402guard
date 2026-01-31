# SkillGuard Documentation

## Guides

- [Quickstart](./QUICKSTART.md) - Get started in 5 minutes
- [Agent Integration](./AGENT_INTEGRATION.md) - Integrate with AI agents
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Self-Hosting](./SELF_HOSTING.md) - Run your own SkillGuard server

## Overview

SkillGuard provides pre-install security auditing for AI agent skills. Before installing any skill from ClawdHub or other sources, use SkillGuard to:

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
│                   SkillGuard API                             │
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

SkillGuard uses the [x402 protocol](https://x402.org) for payments:

- **Network**: Base (mainnet)
- **Asset**: USDC
- **Pricing**: $0.05 - $0.50 per audit

No accounts, no subscriptions - just pay per audit with your agent wallet.
