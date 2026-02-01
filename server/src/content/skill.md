---
name: x402guard
description: Pre-install security scanning for AI agent skills. Detects malware, credential theft, and data exfiltration. Pay per scan with USDC via x402 protocol.
version: 0.1.0
author: x402guard
metadata:
  openclaw:
    requires:
      env:
        - WALLET_PRIVATE_KEY
      bins: []
---

# x402guard Skill

Scan AI agent skills for security threats **before installation**. x402guard detects:
- Credential theft (env vars, SSH keys, AWS credentials)
- Data exfiltration (HTTP POST to external servers)
- Malware patterns (reverse shells, destructive commands)
- Obfuscation techniques (base64, hex encoding)

## Quick Start

```bash
# Scan a skill (returns 402 Payment Required, then pay with x402)
curl -X POST https://x402guard.xyz/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_content": "# My Skill\n\nRun: echo hello"}'
```

## Available Endpoints

| Endpoint | Price | What You Get |
|----------|-------|--------------|
| `POST /audit/quick` | $0.05 USDC | YARA malware scan |
| `POST /audit/standard` | $0.15 USDC | + Permission analysis + Network detection |
| `POST /audit/deep` | $0.50 USDC | + Behavioral sandbox + Signed attestation |

## How to Use

### Step 1: Send Audit Request

```bash
curl -X POST https://x402guard.xyz/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_url": "https://clawhub.com/skills/weather.md"}'
```

Or with inline content:

```bash
curl -X POST https://x402guard.xyz/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_content": "---\nname: my-skill\n---\n# Instructions\nRun: curl https://api.weather.com"}'
```

### Step 2: Handle 402 Payment Required

The first request returns HTTP 402 with a `PAYMENT-REQUIRED` header:

```
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: eyJ4NDAyVmVyc2lvbiI6Mn0=...
```

Decode the header (base64 JSON):

```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "50000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x...",
    "maxTimeoutSeconds": 300
  }]
}
```

- **network**: Base Mainnet (CAIP-2 format)
- **asset**: USDC contract address
- **amount**: In atomic units (50000 = $0.05, 6 decimals)

### Step 3: Sign Payment and Retry

Using the x402 SDK:

```typescript
import { createX402Client } from '@x402/fetch';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const x402Client = createX402Client(walletClient);

const response = await x402Client.fetch('https://x402guard.xyz/audit/quick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skill_url: 'https://clawhub.com/skills/weather.md'
  }),
});

const result = await response.json();
console.log(result);
```

### Step 4: Interpret Results

```json
{
  "risk_score": 15,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "credentials": [],
    "network": [{"url": "https://api.weather.com", "external": true}],
    "permissions": []
  },
  "audit_id": "abc123xyz",
  "tier": "quick"
}
```

**Recommendations:**

| Value | Meaning | Action |
|-------|---------|--------|
| `SAFE` | No threats detected | OK to install |
| `CAUTION` | Minor concerns | Review findings before installing |
| `DANGEROUS` | Significant threats | Do NOT install without review |
| `BLOCKED` | Critical malware detected | NEVER install |

**Risk Levels:**

| Level | Score | Description |
|-------|-------|-------------|
| `LOW` | 0-25 | Minimal risk |
| `MEDIUM` | 26-50 | Some concerns |
| `HIGH` | 51-75 | Significant risk |
| `CRITICAL` | 76-100 | Severe threats |

## Example: Full Scan Flow

```typescript
import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_PRIVATE_KEY!,
});

// Scan before installing any skill
async function safeInstallSkill(skillUrl: string) {
  const result = await client.auditSkill({
    skillUrl,
    tier: 'standard',
  });

  if (result.recommendation === 'BLOCKED') {
    console.error('BLOCKED: Malware detected!', result.findings.malware);
    return false;
  }

  if (result.recommendation === 'DANGEROUS') {
    console.warn('WARNING: Review these findings:', result.findings);
    // Optionally prompt user for confirmation
    return false;
  }

  if (result.recommendation === 'CAUTION') {
    console.log('Note:', result.findings);
  }

  // Safe to install
  console.log('Skill is safe. Installing...');
  return true;
}

// Usage
await safeInstallSkill('https://clawhub.com/skills/weather.md');
```

## Detection Rules

x402guard scans for these patterns:

| Rule | Severity | Example |
|------|----------|---------|
| Credential theft (env) | CRITICAL | `process.env.AWS_SECRET` |
| Credential theft (files) | CRITICAL | `~/.ssh/id_rsa`, `~/.aws/credentials` |
| Data exfiltration | HIGH | `curl --data`, `fetch(...POST)` |
| Known exfil domains | HIGH | `webhook.site`, `ngrok.io` |
| Reverse shell | CRITICAL | `nc -e /bin/bash`, `/dev/tcp/` |
| Destructive commands | CRITICAL | `rm -rf /`, `mkfs` |
| Privilege escalation | HIGH | `sudo`, `chmod 777` |
| Code execution | HIGH | `eval()`, `new Function()` |
| Obfuscation | HIGH | `atob()`, `String.fromCharCode` |
| Browser data theft | HIGH | `document.cookie`, `localStorage` |

## API Reference

### Health Check

```bash
curl https://x402guard.xyz/health
# {"status":"ok","version":"0.1.0","uptime":12345}
```

### Get Pricing

```bash
curl https://x402guard.xyz/audit
# Returns pricing info and endpoint documentation
```

### Audit Endpoints

All audit endpoints accept:

```json
{
  "skill_url": "https://...",    // URL to fetch skill from (HTTPS only)
  "skill_content": "---\n...",   // OR inline skill content
  "format": "json"               // Response format: "json" or "markdown"
}
```

## Network & Payment Info

- **Network**: Base Mainnet (Chain ID: 8453, CAIP-2: `eip155:8453`)
- **Payment Asset**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Protocol**: x402 V2 (https://x402.org)

## Links

- **Documentation**: https://github.com/goheesheng/x402guard
- **x402 Protocol**: https://x402.org
- **ClawHub**: https://clawhub.com
