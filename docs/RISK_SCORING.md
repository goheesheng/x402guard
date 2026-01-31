# Risk Scoring Algorithm

x402guard uses a weighted scoring algorithm to calculate a 0-100 risk score from audit findings. This document explains how scores are calculated and what they mean.

## Score Overview

| Score Range | Risk Level | Recommendation | Meaning |
|-------------|------------|----------------|---------|
| 0-25 | LOW | SAFE | No significant risks, safe to install |
| 26-50 | MEDIUM | CAUTION | Some concerns, review before installing |
| 51-75 | HIGH | DANGEROUS | Significant risks, not recommended |
| 76-100 | CRITICAL | BLOCKED | Severe threats, do not install |

**Special Rule:** Any CRITICAL severity malware finding automatically results in `BLOCKED` recommendation, regardless of total score.

## Severity Weights

Each finding contributes points based on its severity:

| Severity | Points |
|----------|--------|
| CRITICAL | 40 |
| HIGH | 25 |
| MEDIUM | 15 |
| LOW | 5 |

## Category Caps

To prevent any single category from dominating the score, each category has a maximum contribution:

| Category | Max Points | Description |
|----------|------------|-------------|
| Malware | 50 | YARA detection matches |
| Credentials | 30 | Credential file/env access |
| Network | 20 | External network calls |
| Permissions | 15 | File/system permissions |

**Maximum possible score:** 50 + 30 + 20 + 15 = **115** → capped at **100**

## Calculation Formula

```
score = min(100,
  min(50, malware_points) +
  min(30, credential_points) +
  min(20, network_points) +
  min(15, permission_points)
)
```

## Detailed Calculation

### 1. Malware Points

Each YARA rule match adds its severity weight:

```javascript
// Example: Two malware matches
findings.malware = [
  { rule: "credential_theft_files", severity: "CRITICAL" },  // +40
  { rule: "data_exfiltration", severity: "HIGH" }            // +25
];

malware_points = 40 + 25 = 65
capped_malware = min(50, 65) = 50  // Capped at 50
```

### 2. Credential Points

Each credential access finding adds its risk weight:

```javascript
// Example: One credential access
findings.credentials = [
  { type: ".aws/credentials", risk: "HIGH" }  // +25
];

credential_points = 25
capped_credentials = min(30, 25) = 25
```

### 3. Network Points

External network calls add points based on method:

| Method | Points |
|--------|--------|
| POST | 15 |
| Other (GET, etc.) | 10 |

```javascript
// Example: Two external calls
findings.network = [
  { url: "api.weather.com", external: true, method: "GET" },   // +10
  { url: "webhook.site", external: true, method: "POST" }      // +15
];

network_points = 10 + 15 = 25
capped_network = min(20, 25) = 20  // Capped at 20
```

### 4. Permission Points

Permissions add half their risk weight (to avoid double-counting with credentials):

```javascript
// Example: One permission
findings.permissions = [
  { type: "filesystem", action: "read", risk: "MEDIUM" }  // +15/2 = 7.5
];

permission_points = 7.5
capped_permissions = min(15, 7.5) = 7.5
```

**Note:** Credential-type permissions are skipped to avoid double-counting with the credentials category.

## Example Calculations

### Example 1: Clean Skill

```json
{
  "findings": {
    "malware": [],
    "credentials": [],
    "network": [
      { "url": "api.weather.com", "external": true, "method": "GET" }
    ],
    "permissions": [
      { "type": "network", "action": "read", "risk": "LOW" }
    ]
  }
}
```

**Calculation:**
- Malware: 0
- Credentials: 0
- Network: 10 (one external GET)
- Permissions: 2.5 (LOW = 5, halved = 2.5)

**Total:** 0 + 0 + 10 + 2.5 = **12.5 → 13** (rounded)

**Result:** Risk Level = LOW, Recommendation = SAFE

---

### Example 2: Suspicious Skill

```json
{
  "findings": {
    "malware": [
      { "rule": "obfuscation_techniques", "severity": "HIGH" }
    ],
    "credentials": [],
    "network": [
      { "url": "unknown-api.com", "external": true, "method": "POST" }
    ],
    "permissions": [
      { "type": "network", "action": "transmit", "risk": "MEDIUM" }
    ]
  }
}
```

**Calculation:**
- Malware: 25 (one HIGH)
- Credentials: 0
- Network: 15 (one external POST)
- Permissions: 7.5 (MEDIUM = 15, halved)

**Total:** 25 + 0 + 15 + 7.5 = **47.5 → 48**

**Result:** Risk Level = MEDIUM, Recommendation = CAUTION

---

### Example 3: Malicious Skill

```json
{
  "findings": {
    "malware": [
      { "rule": "credential_theft_files", "severity": "CRITICAL" },
      { "rule": "data_exfiltration", "severity": "HIGH" },
      { "rule": "known_exfil_domains", "severity": "HIGH" }
    ],
    "credentials": [
      { "type": ".aws/credentials", "risk": "HIGH" }
    ],
    "network": [
      { "url": "webhook.site", "external": true, "method": "POST" }
    ],
    "permissions": []
  }
}
```

**Calculation:**
- Malware: 40 + 25 + 25 = 90 → capped at 50
- Credentials: 25
- Network: 15
- Permissions: 0

**Total:** 50 + 25 + 15 + 0 = **90**

**Result:** Risk Level = CRITICAL, Recommendation = **BLOCKED**

**Note:** Even without the score calculation, the CRITICAL severity `credential_theft_files` match would trigger automatic BLOCKED status.

---

## Recommendation Logic

```typescript
function getRecommendation(score: number, findings: AuditFindings): string {
  // Rule 1: Any CRITICAL malware = BLOCKED
  const hasCriticalMalware = findings.malware.some(m => m.severity === "CRITICAL");
  if (hasCriticalMalware) return "BLOCKED";

  // Rule 2: Score-based recommendation
  if (score <= 25) return "SAFE";
  if (score <= 50) return "CAUTION";
  if (score <= 75) return "DANGEROUS";
  return "BLOCKED";
}
```

### Recommendation Meanings

| Recommendation | Action |
|----------------|--------|
| **SAFE** | Install without concerns |
| **CAUTION** | Review findings before installing, likely safe |
| **DANGEROUS** | Not recommended, significant risk present |
| **BLOCKED** | Do not install, malicious patterns detected |

## Score Breakdown

The API response includes a breakdown showing contribution from each category:

```json
{
  "risk_score": 90,
  "risk_level": "CRITICAL",
  "recommendation": "BLOCKED",
  "breakdown": {
    "malware": 50,
    "credentials": 25,
    "network": 15,
    "permissions": 0
  }
}
```

This helps identify which categories contributed most to the risk score.

## Interpreting Results

### Low Score (0-25): SAFE

- No malware patterns detected
- Standard network calls to known APIs
- Normal permissions for the skill's purpose
- **Action:** Safe to install

### Medium Score (26-50): CAUTION

- Some concerning patterns, but may be false positives
- Obfuscation or unusual network patterns
- Elevated permissions but possibly legitimate
- **Action:** Review the specific findings before installing

### High Score (51-75): DANGEROUS

- Multiple concerning patterns
- Likely credential access or data exfiltration
- Not recommended for installation
- **Action:** Do not install unless you fully understand and trust the skill

### Critical Score (76-100): BLOCKED

- Clear malicious intent detected
- Credential theft, data exfiltration, or destructive patterns
- **Action:** Do not install under any circumstances

## Next Steps

- [Detection Rules](./DETECTION_RULES.md) — What patterns are detected
- [SDK Reference](./SDK_REFERENCE.md) — Using the x402guard client
- [The Problem](./PROBLEM.md) — Why skill security matters
