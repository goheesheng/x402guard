# Direct API Integration (curl / any HTTP client)

Use x402guard from any language or tool via the REST API.

## Scan a skill

```bash
# With x402 payment (production)
curl -X POST https://x402guard.xyz/api/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_content": "# My Skill\nDoes useful things."}'
# Returns 402 → use @x402/fetch to handle payment automatically

# With ACP secret (local testing)
curl -X POST http://localhost:3007/api/audit/quick \
  -H "Content-Type: application/json" \
  -H "X-ACP-Secret: your-secret" \
  -d '{"skill_content": "# My Skill\nDoes useful things."}'
```

## Scan by URL

```bash
curl -X POST http://localhost:3007/api/audit/standard \
  -H "Content-Type: application/json" \
  -H "X-ACP-Secret: your-secret" \
  -d '{"skill_url": "https://clawdhub.com/skills/weather/skill.md"}'
```

SSRF protection: private IPs are blocked. Only HTTPS URLs allowed.

## Use the gate_decision

The `gate_decision` field tells you what to do:

```bash
RESULT=$(curl -s -X POST http://localhost:3007/api/audit/quick \
  -H "Content-Type: application/json" \
  -H "X-ACP-Secret: your-secret" \
  -d '{"skill_content": "'"$SKILL_CONTENT"'"}')

DECISION=$(echo "$RESULT" | jq -r '.gate_decision')

case "$DECISION" in
  "allow") echo "Safe to install" ;;
  "warn")  echo "Review findings before installing" ;;
  "deny")  echo "DO NOT install" ;;
esac
```

## Verify an attestation

Every scan returns a signed EIP-712 attestation. Anyone can verify it:

```bash
# 1. Get the attestation from a scan
ATTESTATION=$(curl -s -X POST http://localhost:3007/api/audit/quick \
  -H "Content-Type: application/json" \
  -H "X-ACP-Secret: your-secret" \
  -d '{"skill_content": "# Safe skill"}' | jq '.attestation')

# 2. Verify it
curl -X POST http://localhost:3007/api/verify \
  -H "Content-Type: application/json" \
  -d "$ATTESTATION"
# → { "verification": { "valid": true, "signer": "0x...", "matches": true } }
```

## Python example

```python
import requests

API = "http://localhost:3007"
SECRET = "your-secret"

def scan_skill(content: str, tier: str = "quick") -> dict:
    response = requests.post(
        f"{API}/api/audit/{tier}",
        json={"skill_content": content},
        headers={"X-ACP-Secret": SECRET},
    )
    return response.json()

def is_safe(content: str) -> bool:
    result = scan_skill(content)
    return result["gate_decision"] == "allow"

# Usage
skill = "# Weather Skill\nGet weather for any city."
if is_safe(skill):
    print("Safe to install")
else:
    print("Blocked!")
```

## JavaScript/TypeScript example

```ts
async function scanSkill(content: string, tier = 'quick') {
  const response = await fetch(`http://localhost:3007/api/audit/${tier}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ACP-Secret': 'your-secret',
    },
    body: JSON.stringify({ skill_content: content }),
  });
  return response.json();
}

// Gate a tool installation
const result = await scanSkill(toolSource);
if (result.gate_decision === 'deny') {
  throw new Error(`Tool blocked: score ${result.risk_score}, ${result.findings.malware.length} findings`);
}
```

## Pricing

| Tier | Price | Scanners |
|------|-------|----------|
| quick | $0.10 USDC | All 7 scanners |
| standard | $0.50 USDC | All 7 + permissions + network analysis |
| deep | $1.00 USDC | All standard + detailed report |

Cached results are free. Same content within TTL (24h/12h/1h) returns instantly without payment.
