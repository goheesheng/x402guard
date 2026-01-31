# SkillGuard API - Requirements

## Overview

SkillGuard is an x402-powered API providing security auditing for agent skills. It addresses the critical trust gap where skills are installed without verification.

## Problem Statement

- 1 in 286 ClawdHub skills contained a credential stealer
- No code signing, permission manifests, or audit trails exist
- Agents trust content blindly

## User Stories

### Agent User Stories
- **US-A1**: As an AI agent, I want to audit a skill before installing it
- **US-A2**: As an AI agent, I want a clear risk score
- **US-A3**: As an AI agent, I want to understand required permissions
- **US-A4**: As an AI agent, I want to pay with USDC automatically
- **US-A5**: As an AI agent, I want to discover this via x402 Bazaar

### Human User Stories
- **US-H1**: As a human, I want my agent to verify skills automatically
- **US-H2**: As a developer, I want to audit my skills before publishing
- **US-H3**: As a marketplace operator, I want to require attestations

## Functional Requirements

### FR-1: Skill Content Input
- Accept raw skill content in request body
- Accept URL to fetch skill from
- Validate markdown format
- Reject content >1MB
- HTTPS URLs only

### FR-2: YARA Malware Scanning
- Scan using YARA rules
- Detect credential theft patterns
- Detect data exfiltration patterns
- Detect destructive commands
- Detect privilege escalation
- Return matches with severity

### FR-3: Permission Analysis
- Identify filesystem access patterns
- Identify network access patterns
- Identify credential access patterns
- Identify system access patterns
- Generate permission manifest

### FR-4: Network Call Detection
- Extract all URLs in skill content
- Identify API endpoints
- Flag external data transmission
- Categorize internal/external

### FR-5: Risk Scoring
- Calculate score 0-100
- Map to levels: LOW (0-25), MEDIUM (26-50), HIGH (51-75), CRITICAL (76-100)
- Provide recommendation: SAFE, CAUTION, DANGEROUS, BLOCKED

### FR-6: x402 Payment
- Require x402 payment for /audit
- Support Base mainnet (eip155:8453)
- Accept USDC
- Use CDP facilitator

### FR-7: Tiered Pricing
- Quick ($0.05): YARA + basic
- Standard ($0.15): + permissions + network
- Deep ($0.50): + sandbox + attestation

### FR-8: API Endpoints
- POST /audit - x402 gated
- GET /health - free
- GET /pricing - free

### FR-9: Bazaar Integration
- Register with x402 Bazaar
- Include discoverable=true
- Provide input/output schemas

## Non-Functional Requirements

### Performance
- Quick: <500ms
- Standard: <2s
- Deep: <10s
- 100 concurrent audits

### Reliability
- 99.9% uptime
- Auto-recovery

### Accuracy
- True positive >90%
- False positive <10%

### Security
- No execution outside sandbox
- Sanitize all input
- Rate limiting
- No content persistence

## Acceptance Criteria

- [ ] Submit skill content via POST /audit
- [ ] Submit skill URL via POST /audit
- [ ] Returns risk score 0-100
- [ ] Returns risk level
- [ ] Returns detailed findings
- [ ] Detects credential theft patterns
- [ ] Detects data exfiltration
- [ ] Returns 402 without payment
- [ ] Accepts USDC on Base
- [ ] Listed on x402 Bazaar
