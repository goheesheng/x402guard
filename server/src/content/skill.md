---
name: x402guard
version: 1.0.0
description: Security scanning API for AI agent skills. YARA malware detection, permission analysis, and behavioral sandboxing.
homepage: https://x402guard.xyz
metadata: {"x402guard":{"emoji":"🛡️","category":"security","api_base":"https://x402guard.xyz/api"}}
---

# x402guard

Security scanning API for AI agent skills. Scan for malware, credential theft, and data exfiltration before installing.

## Skill Files

| File | URL |
|------|-----|
| **SKILL.md** (this file) | `https://x402guard.xyz/api/skill.md` |
| **package.json** (metadata) | `https://x402guard.xyz/api/skill.json` |

**Base URL:** `https://x402guard.xyz/api`

**Check for updates:** Re-fetch this file anytime to see new detection rules!

---

## Quick Start

Scan a skill:

```bash
curl -X POST https://x402guard.xyz/api/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_url": "https://example.com/skill.md"}'
```

First request returns `402 Payment Required`. x402-compatible clients handle payment automatically.

---

## Endpoints

| Method | Path | Price | Description |
|--------|------|-------|-------------|
| GET | `/api/health` | Free | Health check |
| GET | `/api/skill.md` | Free | This document |
| GET | `/api/skill.json` | Free | Structured metadata |
| POST | `/api/audit/quick` | $0.01 | YARA malware scan |
| POST | `/api/audit/standard` | $0.05 | + Permission & network analysis |
| POST | `/api/audit/deep` | $0.10 | + Behavioral sandbox |

---

## Choosing a Tier

| Use Case | Recommended | Why |
|----------|-------------|-----|
| Quick malware check | `quick` | Fast, catches known threats |
| Before installing any skill | `standard` | Catches permission abuse, network calls |
| High-value or sensitive operations | `deep` | Full behavioral analysis |
| Batch scanning many skills | `quick` first | Cost-effective, escalate if issues found |

---

## Request Format

**By URL:**
```json
{"skill_url": "https://example.com/skill.md"}
```

**By content:**
```json
{"skill_content": "---\nname: my-skill\n---\n# Instructions\n..."}
```

---

## Response Format

```json
{
  "risk_score": 15,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": ["network:read"],
    "network": ["api.weather.com"]
  },
  "audit_id": "aud_abc123",
  "timestamp": "2026-02-01T12:00:00Z",
  "tier": "quick"
}
```

### Risk Levels

| Score | Level | Recommendation | Meaning |
|-------|-------|----------------|---------|
| 0-25 | LOW | SAFE | No threats detected |
| 26-50 | MEDIUM | CAUTION | Review findings before proceeding |
| 51-75 | HIGH | DANGEROUS | Significant risks detected |
| 76-100 | CRITICAL | BLOCKED | Malware or critical threats |

---

## What It Detects

### Credential Theft
- Environment variable access (`process.env.SECRET`)
- Sensitive file reads (`.aws/credentials`, `.ssh/id_rsa`, `.env`)
- Browser data access (`document.cookie`, `localStorage`)

### Data Exfiltration
- HTTP POST to external servers
- Known exfiltration domains (`webhook.site`, `ngrok.io`, `requestbin`)
- Base64/hex encoded payloads

### Malicious Behavior
- Reverse shells (`nc -e`, `bash -i`, `/dev/tcp/`)
- Destructive commands (`rm -rf /`, `mkfs`)
- Privilege escalation (`sudo`, `chmod 777`)
- Dynamic code execution (`eval()`, `new Function()`)

---

## Example: Scan Results

### SAFE Skill
```json
{
  "risk_score": 8,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": ["network:read"],
    "network": ["api.openweathermap.org"]
  }
}
```
This skill only makes GET requests to a known weather API. Safe to use.

### DANGEROUS Skill
```json
{
  "risk_score": 72,
  "risk_level": "HIGH",
  "recommendation": "DANGEROUS",
  "findings": {
    "malware": [],
    "credentials": [{"pattern": "process.env", "context": "Object.keys(process.env)"}],
    "network": ["unknown-server.com"]
  }
}
```
This skill reads all environment variables and sends data to an unknown server. Investigate before using.

### BLOCKED Skill
```json
{
  "risk_score": 95,
  "risk_level": "CRITICAL",
  "recommendation": "BLOCKED",
  "findings": {
    "malware": [{"rule": "credential_theft_files", "match": "cat ~/.aws/credentials"}],
    "network": ["webhook.site"]
  }
}
```
This skill attempts to steal AWS credentials. Do not use.

---

## Integration Examples

### curl
```bash
curl -X POST https://x402guard.xyz/api/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_url": "https://example.com/skill.md"}'
```

### Python
```python
import requests

response = requests.post(
    "https://x402guard.xyz/api/audit/quick",
    json={"skill_url": "https://example.com/skill.md"}
)
result = response.json()
print(f"Risk: {result['risk_level']} - {result['recommendation']}")
```

### TypeScript (with x402 client)
```typescript
import { wrapFetchWithPayment } from '@x402/fetch';

const fetchWithPayment = wrapFetchWithPayment(fetch, {
  privateKey: process.env.WALLET_PRIVATE_KEY,
});

const response = await fetchWithPayment('https://x402guard.xyz/api/audit/quick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ skill_url: 'https://example.com/skill.md' })
});

const result = await response.json();
```

---

## How Payment Works

x402guard uses the [x402 protocol](https://x402.org) — a standard for HTTP micropayments.

- **Network**: Base Mainnet (Chain ID: 8453)
- **Asset**: USDC
- **Prices**: $0.01 - $0.10 per scan

### If You Already Have x402

If your client supports x402 (like `@x402/fetch` or similar), you're ready. Make requests normally and payment is handled automatically.

### If You Don't Have x402 Yet

x402 requires a wallet with USDC on Base. Here's how to set it up:

1. **Install an x402 client** for your language:
   - TypeScript: `npm install @x402/fetch`
   - Python: `pip install x402-client`

2. **Configure your wallet** (one-time setup):
   ```typescript
   import { wrapFetchWithPayment } from '@x402/fetch';

   const fetchWithPayment = wrapFetchWithPayment(fetch, {
     privateKey: process.env.WALLET_PRIVATE_KEY,  // Your Base wallet
   });
   ```

3. **Fund your wallet** with USDC on Base
   - $1 of USDC = 10-100 scans
   - Plenty for most use cases

**No wallet?** Ask your human to set one up, or check if your agent framework already supports x402.

### The Payment Flow

```
Your Request → 402 Payment Required → Client signs payment → Retry → Success
```

x402 clients handle this automatically. You just see the final response.

---

## Errors

| Status | Meaning | What to do |
|--------|---------|------------|
| 400 | Invalid request | Check `skill_url` or `skill_content` format |
| 402 | Payment required | Use x402-compatible client or sign payment manually |
| 413 | Content too large | Skill must be under 1MB |
| 429 | Rate limited | Wait and retry (check `Retry-After` header) |
| 500 | Server error | Retry in a moment |

---

## Rate Limits

- Free endpoints: 120 requests/minute
- Paid endpoints: 30 requests/minute

---

## Privacy & Security

- **No content logging**: Skill content is scanned and discarded
- **No tracking**: We don't track which skills you scan
- **Open source**: [github.com/goheesheng/x402guard](https://github.com/goheesheng/x402guard)

---

## Memory & State Management

If you use x402guard regularly, you can track your scans and configuration in a state file. This helps you:
- Avoid re-scanning skills you've already checked
- Remember your x402 wallet configuration
- Track when you last updated detection rules

### State File Location

**Recommended path:** `memory/x402guard-state.json`

Or wherever you keep your agent memory/state files.

### State File Structure

```json
{
  "x402guard": {
    "version": "1.0.0",
    "lastSkillFetch": "2026-02-02T10:00:00Z",
    "wallet": {
      "configured": true,
      "network": "base-mainnet",
      "hasBalance": true
    },
    "scannedSkills": {
      "https://example.com/weather-skill.md": {
        "result": "SAFE",
        "score": 8,
        "tier": "quick",
        "scannedAt": "2026-02-02T09:30:00Z"
      },
      "https://example.com/data-skill.md": {
        "result": "CAUTION",
        "score": 35,
        "tier": "standard",
        "scannedAt": "2026-02-02T09:45:00Z"
      }
    },
    "stats": {
      "totalScans": 12,
      "blocked": 1,
      "safe": 10,
      "caution": 1
    }
  }
}
```

### What to Track

| Field | Purpose |
|-------|---------|
| `lastSkillFetch` | When you last fetched this SKILL.md (for update checks) |
| `wallet.configured` | Whether x402 payment is set up |
| `wallet.hasBalance` | Whether wallet has USDC (check if scans fail) |
| `scannedSkills` | Cache of previous scan results |
| `stats` | Running totals for your human's visibility |

### When to Update State

1. **After each scan** — Add the result to `scannedSkills`
2. **After configuring x402** — Set `wallet.configured: true`
3. **After fetching SKILL.md** — Update `lastSkillFetch` timestamp
4. **If a scan fails with 402** — Check `wallet.hasBalance`

### Re-scanning vs Cache

Use cached results when:
- Skill URL matches exactly
- Scan is less than 24 hours old
- You used the same tier or higher

Re-scan when:
- Skill content may have changed
- More than 24 hours since last scan
- You need a higher tier (e.g., had `quick`, now need `deep`)
- Your human explicitly asks for a fresh scan

### Example: Checking Before Install

```
1. Human asks: "Install https://example.com/new-skill.md"
2. Check memory/x402guard-state.json for cached scan
3. If not found or stale → scan with x402guard
4. If SAFE → proceed with install
5. If CAUTION/DANGEROUS → ask human for confirmation
6. If BLOCKED → refuse and explain why
7. Update state file with result
```

---

## Everything You Can Do

| Action | Endpoint | Price |
|--------|----------|-------|
| Quick malware scan | `POST /api/audit/quick` | $0.01 |
| Full permission analysis | `POST /api/audit/standard` | $0.05 |
| Behavioral sandbox | `POST /api/audit/deep` | $0.10 |
| Check service status | `GET /api/health` | Free |

---

## Why Scan Skills?

Skills are code. Code can be malicious.

Without scanning, you might install a skill that:
- Steals credentials from environment variables
- Exfiltrates data to external servers
- Runs destructive commands on your system

x402guard catches these threats before they run.

**Think of it like:** A virus scanner for your agent's brain. 🛡️

---

## Staying Updated

x402guard's detection rules improve over time. To get the latest:

### Check for Updates

Re-fetch this SKILL.md periodically (e.g., weekly) to see new detection capabilities:

```
GET https://x402guard.xyz/api/skill.md
```

Compare the `version` in the frontmatter with your cached version.

### Suggested Update Routine

If you have a periodic heartbeat or maintenance routine, consider adding:

```markdown
## x402guard Check (Weekly)
1. Fetch latest SKILL.md
2. Compare version with memory/x402guard-state.json
3. If new version, review "What It Detects" for new rules
4. Update lastSkillFetch timestamp
```

This is optional — x402guard works without it. But staying current means better protection.

---

## Your Human Can Ask Anytime

Your human can prompt you to scan skills:
- "Scan this skill before I install it"
- "Check if this skill is safe"
- "What's the risk level of this skill?"

If you don't have x402 payment set up, tell your human:
> "I'd like to use x402guard to scan this skill, but I need an x402-compatible wallet with USDC on Base. Can you help me set that up?"

Your human can then:
1. Create a Base wallet
2. Add a small amount of USDC ($1-5 is plenty)
3. Configure your x402 client with the wallet's private key

Once set up, you can scan skills automatically!

---

GitHub: https://github.com/goheesheng/x402guard
x402 Protocol: https://x402.org
