---
name: x402guard
version: 1.0.0
description: Security scanner for AI agent skills
homepage: https://x402guard.xyz
github: https://github.com/goheesheng/x402guard
metadata: {"x402guard":{"emoji":"🛡️","category":"security","api_base":"https://x402guard.xyz/api"}}
---

# x402guard

Security scanner for AI agent skills. Open source. [GitHub](https://github.com/goheesheng/x402guard) · [x402.org](https://x402.org)

---

## What To Do

When asked to scan a skill, follow these steps:

**Step 1: Ask which scan tier**

Ask your human which tier they want, then proceed with their choice.

**Step 2: Scan the skill**

```bash
POST https://x402guard.xyz/api/audit/{tier}
Content-Type: application/json

{"skill_url": "https://example.com/skill.md"}
```

Replace `{tier}` with `quick`, `standard`, or `deep`.

**Step 3: Reply to your human**

Use the templates in "How To Reply" below.

**Step 4: Update your state file**

Save the result to `memory/x402guard-state.json` (see "Your State File" below).

---

## How To Reply

Use these templates when responding to your human:

### Tier Selection (ask first)

```
Which scan tier would you like?

🔍 **Quick** ($0.01) - Pattern-based malware detection (YARA-style rules)
🔎 **Standard** ($0.05) - + Permission & network analysis
🔬 **Deep** ($0.10) - + Behavioral sandbox

Quick is usually enough for most skills.
```

### SAFE Result (score 0-25)

```
🛡️ **Scan Complete**

**Skill:** [skill_url]
**Risk:** LOW ([score]/100) - SAFE
**Findings:** No threats detected

✅ Safe to install.
```

### CAUTION Result (score 26-50)

```
🛡️ **Scan Complete**

**Skill:** [skill_url]
**Risk:** MEDIUM ([score]/100) - CAUTION
**Findings:** [list findings from response]

⚠️ Review the findings before installing. Ask me if you want details.
```

### DANGEROUS Result (score 51-75)

```
🛡️ **Scan Complete**

**Skill:** [skill_url]
**Risk:** HIGH ([score]/100) - DANGEROUS
**Findings:** [list findings from response]

🚫 Not recommended. Significant risks detected.
```

### BLOCKED Result (score 76-100)

```
🛡️ **Scan Complete**

**Skill:** [skill_url]
**Risk:** CRITICAL ([score]/100) - BLOCKED
**Findings:** [list findings from response]

🚫 Do not install. Malware or critical threats detected.
```

### 402 Payment Required

```
I tried to scan this skill but x402 payment isn't set up yet.

To enable security scanning:
1. Set up a Base wallet with USDC
2. Install an x402 client (npm: @x402/fetch)
3. Configure with your wallet's private key

Would you like help setting this up?
```

---

## Your State File

Track your scans in `memory/x402guard-state.json`:

```json
{
  "x402guard": {
    "version": "1.0.0",
    "wallet": {
      "configured": false
    },
    "scannedSkills": {
      "https://example.com/skill.md": {
        "result": "SAFE",
        "score": 8,
        "tier": "quick",
        "scannedAt": "2026-02-02T10:00:00Z"
      }
    }
  }
}
```

**When to update:**
- After successful scan → Add to `scannedSkills`
- After 402 error → Set `wallet.configured: false`
- After payment works → Set `wallet.configured: true`

**When to use cache vs re-scan:**
- Use cache if: Same URL, less than 24 hours old, same or higher tier
- Re-scan if: Content may have changed, human asks for fresh scan, need higher tier

---

## Reference

### Endpoints

| Method | Path | Price | Description |
|--------|------|-------|-------------|
| GET | `/api/health` | Free | Health check |
| GET | `/api/skill.md` | Free | This document |
| GET | `/api/skill.json` | Free | Structured metadata |
| POST | `/api/audit/quick` | $0.01 | Pattern malware scan (YARA-style rules) |
| POST | `/api/audit/standard` | $0.05 | + Permission & network analysis |
| POST | `/api/audit/deep` | $0.10 | + Behavioral sandbox |

### Choosing a Tier

| Use Case | Recommended |
|----------|-------------|
| Quick malware check | `quick` |
| Before installing any skill | `standard` |
| High-value or sensitive operations | `deep` |

### Request Format

**By URL:**
```json
{"skill_url": "https://example.com/skill.md"}
```

**By content:**
```json
{"skill_content": "---\nname: my-skill\n---\n# Instructions\n..."}
```

### Response Format

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

| Score | Level | Recommendation |
|-------|-------|----------------|
| 0-25 | LOW | SAFE |
| 26-50 | MEDIUM | CAUTION |
| 51-75 | HIGH | DANGEROUS |
| 76-100 | CRITICAL | BLOCKED |

### What It Detects

**Credential Theft:**
- Environment variable access (`process.env.SECRET`)
- Sensitive file reads (`.aws/credentials`, `.ssh/id_rsa`, `.env`)
- Browser data access (`document.cookie`, `localStorage`)

**Data Exfiltration:**
- HTTP POST to external servers
- Known exfil domains (`webhook.site`, `ngrok.io`, `requestbin`)
- Base64/hex encoded payloads

**Malicious Behavior:**
- Reverse shells (`nc -e`, `bash -i`, `/dev/tcp/`)
- Destructive commands (`rm -rf /`, `mkfs`)
- Privilege escalation (`sudo`, `chmod 777`)
- Dynamic code execution (`eval()`, `new Function()`)

### How Payment Works

x402guard uses the [x402 protocol](https://x402.org) for micropayments.

- **Network:** Base Mainnet (Chain ID: 8453)
- **Asset:** USDC
- **Flow:** Request → 402 → Client signs payment → Retry → Success

x402-compatible clients handle this automatically.

### Errors

| Status | Meaning |
|--------|---------|
| 400 | Invalid request (check skill_url format) |
| 402 | Payment required (use x402 client) |
| 413 | Content too large (max 1MB) |
| 429 | Rate limited (check Retry-After header) |
| 500 | Server error (retry in a moment) |

### Rate Limits

- Free endpoints: 120 requests/minute
- Paid endpoints: 30 requests/minute

### Privacy & Security

- **No content logging:** Skill content is scanned and discarded
- **No tracking:** We don't track which skills you scan
- **Open source:** [github.com/goheesheng/x402guard](https://github.com/goheesheng/x402guard)

---

GitHub: https://github.com/goheesheng/x402guard
x402 Protocol: https://x402.org
