# SkillGuard

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20+-green.svg)](https://nodejs.org)

Open-Source SDK & Server for Secure Agent Skill Auditing on x402

🚀 **Production API Available**: [https://skillguard-api.vercel.app](https://skillguard-api.vercel.app)

## 🌟 The SkillGuard Stack

SkillGuard fills the missing **Layer 2 (Code Security)** of the agentic trust stack:

| Layer | Component | Status |
|-------|-----------|--------|
| Layer 4 | Payment Security | x402-secure ✓ |
| Layer 3 | Runtime Behavior | Trustline ✓ |
| **Layer 2** | **Code Security** | **SkillGuard ★** |
| Layer 1 | Identity | ERC-8004 ◐ |

**"skill.md is an unsigned binary"** — We scanned 286 ClawdHub skills and found credential stealers disguised as legitimate tools.

## 🚀 Quickstart: SDK Integration

```bash
# Install the SDK
npm install skillguard-client @x402/core @x402/evm
```

```typescript
import { SkillGuardClient } from 'skillguard-client';

// Initialize client
const client = new SkillGuardClient({
  privateKey: process.env.PRIVATE_KEY!,
});

// Audit a skill before installing
const result = await client.auditSkill({
  skillUrl: 'https://clawdhub.com/skills/weather',
  tier: 'standard', // $0.15 USDC
});

console.log(result.risk_score);      // 12
console.log(result.recommendation);   // 'SAFE'
console.log(result.findings);         // { malware: [], permissions: [...] }

// Quick check
const safe = await client.isSafe('https://clawdhub.com/skills/ssh-helper');
if (safe) {
  // Proceed with installation
}
```

## 🤔 Why SkillGuard?

### The Problem

If you're building an AI agent that installs skills:

- ❓ What if a skill steals your AWS credentials?
- ❓ How do you know it won't phone home to suspicious servers?
- ❓ Who's responsible when a malicious skill causes damage?

### The Solution

SkillGuard provides pre-install security auditing:

- 🔬 **YARA Scanning**: Detect credential stealers, backdoors, malware
- 🔐 **Permission Analysis**: What files/network access does it need?
- 🌐 **Network Detection**: Does it contact suspicious endpoints?
- 📊 **Risk Scoring**: 0-100 score with clear recommendation
- 📜 **Attestation**: Signed proof of audit for compliance

## 📦 Packages

| Package | Description | Install |
|---------|-------------|---------|
| `skillguard-client` | SDK for integrating audits | `npm install skillguard-client` |
| `@skillguard/shared` | Shared types | Internal |

## 🔧 API Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /health` | Free | Health check |
| `POST /audit/quick` | $0.05 | YARA malware scan |
| `POST /audit/standard` | $0.15 | Full analysis + permissions |
| `POST /audit/deep` | $0.50 | Complete audit + sandbox |

### Example Request

```bash
curl -X POST https://skillguard-api.vercel.app/audit/quick \
  -H "Content-Type: application/json" \
  -H "X-Payment: <x402-payment-token>" \
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'
```

### Example Response

```json
{
  "risk_score": 12,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": [{ "type": "network", "target": "api.weather.com" }],
    "network": [{ "url": "api.weather.com", "external": true }]
  },
  "audit_id": "aud_abc123",
  "tier": "standard"
}
```

## 🏗️ Repository Structure

```
skillguard/
├── packages/
│   ├── skillguard-client/    # npm SDK
│   └── shared/               # Shared types
├── server/                   # API server (Express + x402)
├── docs/                     # Documentation
├── examples/                 # Integration examples
└── scripts/                  # Build/deploy scripts
```

## 🚀 Self-Hosting

```bash
# Clone and install
git clone https://github.com/goheesheng/skillguard.git
cd skillguard
pnpm install

# Configure
cp server/.env.example server/.env
# Edit server/.env with your wallet address

# Run
pnpm dev:server
```

See [docs/SELF_HOSTING.md](./docs/SELF_HOSTING.md) for full guide.

## 📖 Documentation

- [Quickstart](./docs/QUICKSTART.md) - Get started in 5 minutes
- [Agent Integration](./docs/AGENT_INTEGRATION.md) - OpenClaw, LangChain, etc.
- [API Reference](./docs/API_REFERENCE.md) - Complete API docs
- [Self-Hosting](./docs/SELF_HOSTING.md) - Run your own server

## 💳 Payment

SkillGuard uses the [x402 protocol](https://x402.org) for payments:

- **Network**: Base (mainnet)
- **Asset**: USDC
- **No accounts** - Pay per audit with your agent wallet

## 🤝 Works With

- [x402](https://x402.org) - HTTP-native payments
- [x402-secure](https://github.com/t54-labs/x402-secure) - Agent payment security
- [OpenClaw](https://openclaw.ai) - AI agent framework
- [ClawdHub](https://clawdhub.com) - Agent skill marketplace

## 📄 License

MIT - See [LICENSE](./LICENSE)

---

Built for the agentic economy 🤖💰
