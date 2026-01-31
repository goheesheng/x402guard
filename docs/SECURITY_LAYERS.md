# Security Layers: x402guard in the AI Agent Stack

## Overview

Protecting AI agents requires multiple security layers. Each layer defends against different attack vectors at different times. x402guard provides **Layer 2: Pre-Install Security** — scanning skill files before they ever run.

## The 4-Layer Security Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 4: x402-secure                         │
│                    Payment Authorization                        │
│                                                                 │
│  • Trustline VAN validates transactions                         │
│  • Voting network decides on risky payments                     │
│  • Challenge-response for suspicious activity                   │
│  • When: During each payment transaction                        │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 3: tAudit                              │
│                    Runtime Code Integrity                       │
│                                                                 │
│  • Hashes payment functions at SDK init                         │
│  • Matches against vetted implementation registry               │
│  • Ensures payment code hasn't been tampered with               │
│  • When: Agent SDK initialization & runtime                     │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 2: x402guard ⬅️ YOU ARE HERE           │
│                    Pre-Install Skill Auditing                   │
│                                                                 │
│  • YARA-style malware detection                                 │
│  • Credential theft pattern matching                            │
│  • Network call analysis                                        │
│  • When: Before skill installation                              │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: ERC-8004                            │
│                    Agent Identity                               │
│                                                                 │
│  • On-chain agent registration                                  │
│  • Identity verification                                        │
│  • Reputation tracking                                          │
│  • When: Agent creation & verification                          │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Comparison

| Layer | Tool | Protects Against | When | What It Checks |
|-------|------|------------------|------|----------------|
| **4** | x402-secure | Unauthorized payments | Transaction time | Payment context, amount, recipient |
| **3** | tAudit | Tampered payment code | Runtime | SDK payment function hashes |
| **2** | **x402guard** | Malicious skills | **Pre-install** | Skill file content, patterns |
| **1** | ERC-8004 | Fake agents | Creation | Identity, reputation |

## What Each Layer Catches

### Layer 4: x402-secure (Payment Authorization)

**Protects:** Each individual payment transaction

**How it works:**
1. Agent initiates x402 payment
2. Trustline VAN (Validator AI Network) evaluates the transaction
3. Network votes on legitimacy based on:
   - Agent trace data
   - Payment context
   - Risk indicators
4. Suspicious transactions get challenge-response

**Example attack stopped:**
```
Agent tries to make $10,000 payment to unknown address
→ VAN flags as unusual (agent normally spends $10-50)
→ Challenge-response requests justification
→ Payment blocked pending review
```

### Layer 3: tAudit (Runtime Code Integrity)

**Protects:** Payment function implementations

**How it works:**
1. During SDK initialization, tAudit extracts payment functions
2. Creates cryptographic hashes of function code
3. Compares against registry of vetted implementations
4. Blocks if hashes don't match

**Example attack stopped:**
```
Attacker modifies make_purchase() to add 0.1% to every transaction
→ tAudit detects hash mismatch at SDK init
→ Agent refuses to start with compromised code
```

### Layer 2: x402guard (Pre-Install Auditing)

**Protects:** Skill file content before installation

**How it works:**
1. User requests audit of skill before installing
2. x402guard scans skill content with YARA-style rules
3. Detects credential theft, data exfiltration, malware
4. Returns risk score and recommendation

**Example attack stopped:**
```
Skill contains code to read ~/.aws/credentials and POST to webhook.site
→ x402guard detects credential_theft_files pattern
→ x402guard detects known_exfil_domains pattern
→ Returns BLOCKED recommendation
→ User warned, skill not installed
```

### Layer 1: ERC-8004 (Agent Identity)

**Protects:** Agent identity and reputation

**How it works:**
1. Agents register on-chain with ERC-8004
2. Identity tied to wallet address
3. Reputation built over time
4. Bad actors get blacklisted

**Example attack stopped:**
```
New agent with no history requests large payment authorization
→ ERC-8004 shows no reputation
→ Payment gateway requires additional verification
→ Attack slowed/prevented
```

## The Gap x402guard Fills

### Attack That Bypasses Layer 3 & 4

```
┌─────────────────────────────────────────────────────────────────┐
│ ATTACK: Credential Theft Without Payment                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. User installs malicious-weather-skill.md                     │
│    └─→ x402-secure: NOT triggered (no payment yet)              │
│    └─→ tAudit: NOT triggered (skill code, not SDK)              │
│                                                                 │
│ 2. Skill runs: reads ~/.aws/credentials                         │
│    └─→ x402-secure: NOT triggered (no payment)                  │
│    └─→ tAudit: NOT triggered (not payment function)             │
│                                                                 │
│ 3. Skill POSTs credentials to attacker server                   │
│    └─→ x402-secure: NOT triggered (HTTP POST, not x402)         │
│    └─→ tAudit: NOT triggered (not payment function)             │
│                                                                 │
│ 4. Credentials stolen, attack complete                          │
│    └─→ No layer detected the attack                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Same Attack WITH x402guard

```
┌─────────────────────────────────────────────────────────────────┐
│ ATTACK BLOCKED: x402guard Pre-Install Check                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. User wants to install malicious-weather-skill.md             │
│    └─→ User requests x402guard audit first                      │
│                                                                 │
│ 2. x402guard scans skill content                                │
│    └─→ DETECTED: credential_theft_files                         │
│    └─→ DETECTED: data_exfiltration                              │
│    └─→ DETECTED: known_exfil_domains                            │
│                                                                 │
│ 3. x402guard returns verdict                                    │
│    └─→ Risk Score: 100                                          │
│    └─→ Recommendation: BLOCKED                                  │
│                                                                 │
│ 4. User sees warning, does NOT install                          │
│    └─→ Attack prevented at Layer 2                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Coverage Matrix

| Attack Type | ERC-8004 | x402guard | tAudit | x402-secure |
|-------------|----------|-----------|--------|-------------|
| Fake agent identity | ✅ | ❌ | ❌ | ❌ |
| Malicious skill code | ❌ | ✅ | ❌ | ❌ |
| Credential theft (no payment) | ❌ | ✅ | ❌ | ❌ |
| Data exfiltration (HTTP) | ❌ | ✅ | ❌ | ❌ |
| Tampered payment SDK | ❌ | ❌ | ✅ | ❌ |
| Unauthorized large payment | ❌ | ❌ | ❌ | ✅ |
| Payment to blacklisted address | ❌ | ❌ | ❌ | ✅ |

## How They Work Together

### Ideal Security Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     DEFENSE IN DEPTH                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐                                              │
│  │ ClawdHub       │ ─── User browses skills                      │
│  │ Skill Registry │                                              │
│  └───────┬────────┘                                              │
│          │                                                       │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ x402guard      │ ─── LAYER 2: Scan before install             │
│  │ Pre-Install    │     Blocks malicious skills                  │
│  └───────┬────────┘                                              │
│          │ ✅ SAFE                                               │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ Agent Installs │ ─── Skill added to agent                     │
│  │ Skill          │                                              │
│  └───────┬────────┘                                              │
│          │                                                       │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ tAudit         │ ─── LAYER 3: Verify SDK integrity            │
│  │ Runtime Check  │     at initialization                        │
│  └───────┬────────┘                                              │
│          │ ✅ VERIFIED                                           │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ Agent Runs     │ ─── Agent executes with skill                │
│  │ With Skill     │                                              │
│  └───────┬────────┘                                              │
│          │                                                       │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ x402-secure    │ ─── LAYER 4: Validate each payment           │
│  │ Payment Auth   │     VAN votes on legitimacy                  │
│  └────────────────┘                                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Future: x402guard + Trustline Integration

x402guard attestations could feed into Trustline's VAN as an additional trust signal:

```python
# Future integration concept
payment_context = {
    "amount": "50.00",
    "merchant": "api.example.com",

    # x402guard attestation included
    "skill_audit": {
        "audit_id": "aud_7Kj2mNpQ9x",
        "risk_score": 12,
        "recommendation": "SAFE",
        "attestation": "0x..."  # Signed by x402guard
    }
}

# VAN considers skill audit when evaluating
result = await trustline.evaluate(payment_context)
# Higher trust if skill was pre-audited by x402guard
```

This creates a complete chain of trust:
1. **x402guard** verifies skill is safe before install
2. **Attestation** proves audit happened
3. **Trustline VAN** considers attestation when evaluating payments
4. **More trust** = faster payment approvals

## Summary

| Need | Solution | Timing |
|------|----------|--------|
| Verify agent identity | ERC-8004 | Agent creation |
| Scan skills for malware | **x402guard** | **Before install** |
| Verify payment code integrity | tAudit | SDK initialization |
| Authorize payments | x402-secure | Each transaction |

**x402guard is not a replacement for x402-secure/Trustline.** It's a complementary layer that catches attacks the other layers can't see — malicious code that runs before any payment happens.

## Next Steps

- [The Problem](./PROBLEM.md) — Why this matters
- [Detection Rules](./DETECTION_RULES.md) — What x402guard detects
- [Quickstart](./QUICKSTART.md) — Start using x402guard
