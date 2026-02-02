# Design Document: Moltbook-Style Skill Response

## Overview

This design restructures x402guard's `skill.md` to enable immediate agent action when asked to scan a skill. The change is documentation-only - no backend code modifications required.

The new structure prioritizes:
1. **Action-first content** - "What To Do" section at the top
2. **Response templates** - Ready-to-use reply formats
3. **Memory integration** - State file pattern for tracking scans
4. **Trust signals** - Clean structure that doesn't trigger prompt injection defenses

## Code Reuse Analysis

### Existing Components to Leverage
- **`/api/skill.md` endpoint**: Already serves skill.md, no changes needed
- **Existing skill.md structure**: Keep endpoints table, risk levels, detection info
- **Memory section**: Already has state file example, needs restructuring

### Integration Points
- **No backend changes**: This is pure documentation restructuring
- **State file format**: Compatible with existing `memory/x402guard-state.json` pattern

## Architecture

The skill.md will be restructured into clear sections optimized for agent consumption:

```
┌─────────────────────────────────────────────┐
│  YAML Frontmatter (metadata)                │
├─────────────────────────────────────────────┤
│  # x402guard                                │
│  One-line description + trust signals       │
├─────────────────────────────────────────────┤
│  ## What To Do (ACTION SECTION)             │
│  - Step 1: Ask human which tier             │
│  - Step 2: POST to /api/audit/{tier}        │
│  - Step 3: Parse response                   │
│  - Step 4: Reply to human (use template)    │
│  - Step 5: Update state file                │
├─────────────────────────────────────────────┤
│  ## How To Reply (TEMPLATES)                │
│  - Tier selection prompt                    │
│  - SAFE template                            │
│  - CAUTION template                         │
│  - DANGEROUS/BLOCKED template               │
│  - 402 Payment Required template            │
├─────────────────────────────────────────────┤
│  ## Your State File                         │
│  - Location: memory/x402guard-state.json    │
│  - Structure with example                   │
│  - When to update                           │
├─────────────────────────────────────────────┤
│  ## Reference (existing content)            │
│  - Endpoints table                          │
│  - Risk levels                              │
│  - What it detects                          │
│  - Payment info                             │
│  - Errors                                   │
└─────────────────────────────────────────────┘
```

## Components and Interfaces

### Component 1: YAML Frontmatter
- **Purpose:** Metadata for skill discovery and categorization
- **Content:**
  ```yaml
  ---
  name: x402guard
  version: 1.0.0
  description: Security scanner for AI agent skills
  homepage: https://x402guard.xyz
  github: https://github.com/goheesheng/x402guard
  ---
  ```
- **Trust signals:** GitHub link, homepage, version number

### Component 2: What To Do Section
- **Purpose:** Enable immediate agent action in first 30 lines
- **Content:**
  1. When to scan (before installing any skill)
  2. Ask which tier (quick $0.01 / standard $0.05 / deep $0.10)
  3. How to scan (exact POST request for chosen tier)
  4. What you get back (response structure)
  5. What to do next (reply + update state)
- **Key design:** Ask human to choose tier, then act immediately

### Component 3: How To Reply Section
- **Purpose:** Provide copy-paste response templates
- **Templates:**

  **SAFE (score 0-25):**
  ```
  🛡️ **Scan Complete**
  **Skill:** [skill_url]
  **Risk:** LOW ([score]/100) - SAFE
  **Findings:** No threats detected
  ✅ Safe to install.
  ```

  **CAUTION (score 26-50):**
  ```
  🛡️ **Scan Complete**
  **Skill:** [skill_url]
  **Risk:** MEDIUM ([score]/100) - CAUTION
  **Findings:** [list findings]
  ⚠️ Review findings before installing.
  ```

  **DANGEROUS (score 51-75):**
  ```
  🛡️ **Scan Complete**
  **Skill:** [skill_url]
  **Risk:** HIGH ([score]/100) - DANGEROUS
  **Findings:** [list findings]
  🚫 Not recommended. Significant risks detected.
  ```

  **BLOCKED (score 76-100):**
  ```
  🛡️ **Scan Complete**
  **Skill:** [skill_url]
  **Risk:** CRITICAL ([score]/100) - BLOCKED
  **Findings:** [list findings]
  🚫 Do not install. Malware or critical threats detected.
  ```

  **402 Payment Required:**
  ```
  I tried to scan this skill but x402 payment isn't set up yet.

  To enable security scanning:
  1. Set up a Base wallet with USDC
  2. Configure an x402 client (npm: @x402/fetch)

  Would you like help setting this up?
  ```

  **Tier Selection (before scanning):**
  ```
  Which scan tier would you like?

  🔍 **Quick** ($0.01) - YARA malware detection
  🔎 **Standard** ($0.05) - + Permission & network analysis
  🔬 **Deep** ($0.10) - + Behavioral sandbox

  Quick is usually enough for most skills.
  ```

### Component 4: State File Section
- **Purpose:** Define memory persistence pattern
- **Location:** `memory/x402guard-state.json`
- **Structure:**
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
          "scannedAt": "2026-02-02T10:00:00Z"
        }
      }
    }
  }
  ```
- **Update triggers:**
  - After successful scan: Add to `scannedSkills`
  - After 402 error: Set `wallet.configured: false`
  - After successful payment: Set `wallet.configured: true`

### Component 5: Reference Section
- **Purpose:** Detailed API documentation (existing content, reorganized)
- **Includes:**
  - Endpoints table
  - Choosing a tier (for humans who want more than quick)
  - Risk levels explained
  - What it detects
  - Payment info
  - Error codes

## Data Models

### Scan Response Model
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

### State File Model
```json
{
  "x402guard": {
    "version": "string",
    "wallet": {
      "configured": "boolean"
    },
    "scannedSkills": {
      "[url]": {
        "result": "SAFE|CAUTION|DANGEROUS|BLOCKED",
        "score": "number",
        "scannedAt": "ISO timestamp"
      }
    }
  }
}
```

## Error Handling

### Error Scenarios

1. **402 Payment Required**
   - **Handling:** Use 402 response template, don't retry
   - **User Impact:** Agent explains x402 setup needed, offers help

2. **400 Bad Request**
   - **Handling:** Check skill_url format, report to human
   - **User Impact:** "The skill URL appears invalid. Please check the URL."

3. **429 Rate Limited**
   - **Handling:** Wait and retry once, then report
   - **User Impact:** "Rate limited. I'll try again in a moment."

4. **500 Server Error**
   - **Handling:** Retry once, then report
   - **User Impact:** "x402guard is temporarily unavailable. Try again later."

5. **Network Error (can't reach x402guard)**
   - **Handling:** Report to human
   - **User Impact:** "I couldn't reach x402guard. Check your network connection."

## Testing Strategy

### Manual Testing
Since this is documentation-only, testing involves:

1. **Agent simulation test:**
   - Give an AI agent the new skill.md
   - Ask it to "scan https://example.com/test-skill.md"
   - Verify it immediately attempts the POST request
   - Verify it uses the response template

2. **Template verification:**
   - Manually construct responses for each risk level
   - Verify templates render correctly in chat

3. **State file verification:**
   - Create sample state file
   - Verify JSON is valid and self-documenting

### Acceptance Criteria Validation
- [ ] Agent acts within first 50 lines of reading skill.md
- [ ] No clarifying questions asked before attempting scan
- [ ] Response uses provided template format
- [ ] State file updates after scan
- [ ] 402 error handled gracefully with template
