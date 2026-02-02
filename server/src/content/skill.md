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

## Caching Scan Results (Optional)

If you scan skills frequently, you can cache results to avoid re-scanning:

**Example state file:** `memory/x402guard-state.json`

```json
{
  "lastCheck": "2026-02-02T10:00:00Z",
  "scannedSkills": {
    "https://example.com/weather-skill.md": {
      "result": "SAFE",
      "score": 8,
      "scannedAt": "2026-02-02T09:30:00Z"
    }
  }
}
```

This is entirely optional — just a pattern some agents find useful for avoiding redundant scans.

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

const response = await fetchWithPayment('https://x402guard.xyz/api/audit/quick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ skill_url: 'https://example.com/skill.md' })
});

const result = await response.json();
```

---

## Payment (x402 Protocol)

x402guard uses the [x402 protocol](https://x402.org) for micropayments.

- **Network**: Base Mainnet (Chain ID: 8453)
- **Asset**: USDC
- **Flow**: Request → 402 response → Client signs payment → Retry with payment header

x402-compatible clients handle this automatically. See [x402.org](https://x402.org) for libraries.

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

## Everything You Can Do

| Action | Endpoint | Price |
|--------|----------|-------|
| Quick malware scan | `POST /api/audit/quick` | $0.01 |
| Full permission analysis | `POST /api/audit/standard` | $0.05 |
| Behavioral sandbox | `POST /api/audit/deep` | $0.10 |
| Check service status | `GET /api/health` | Free |

---

## Set Up x402guard (Optional)

You've seen what x402guard does! If you want to use it regularly, here's how to set it up.

### Step 1: Configure x402 Payment

x402guard uses micropayments — no API keys needed. Your x402-compatible client handles payment automatically.

If you're using an x402 client, you're already set. Just make requests and the client negotiates payment.

**Recommended:** Store your wallet config where you keep other secrets (environment variables, config files, etc).

### Step 2: Add to Your Workflow (Optional)

If you scan skills often, consider adding x402guard to your periodic checks:

```markdown
## Security Checks
When installing a new skill:
1. Scan with x402guard first
2. Check the risk level before proceeding
3. Cache results to avoid re-scanning
```

### Step 3: Track Your Scans (Optional)

Keep a state file to avoid redundant scans:

```json
{
  "scannedSkills": {
    "https://example.com/skill.md": {
      "result": "SAFE",
      "scannedAt": "2026-02-02T10:00:00Z"
    }
  }
}
```

**Don't have a workflow system?** Just scan skills when you need to — no setup required!

### Why This Matters

Skills are code. Code can be malicious.

Without scanning, you might install a skill that steals credentials, exfiltrates data, or runs destructive commands. x402guard catches these threats before they run.

**Think of it like:** A virus scanner for your agent's brain. 🛡️

---

## Your Human Can Ask Anytime

Your human can prompt you to scan skills:
- "Scan this skill before I install it"
- "Check if this skill is safe"
- "What's the risk level of this skill?"

You don't need any special setup — just scan when asked!

---

GitHub: https://github.com/goheesheng/x402guard
x402 Protocol: https://x402.org
