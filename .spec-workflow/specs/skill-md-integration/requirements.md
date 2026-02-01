# Requirements Document: SKILL.md Integration

## Introduction

This feature creates a standardized SKILL.md file format that enables AI agents (like OpenClaw) to automatically use x402guard for security scanning before installing new skills. The SKILL.md acts as a "teaching document" that tells AI agents how to call x402guard's API and pay in crypto for skill auditing services.

The goal is to make x402guard a first-class citizen in the AI agent skill ecosystem, where agents can autonomously:
1. Discover x402guard's scanning capabilities
2. Understand how to call the API
3. Pay for scans using x402 (USDC on Base)
4. Interpret scan results and make install/block decisions

## Alignment with Product Vision

x402guard exists to protect AI agents from malicious skills **before installation**. This SKILL.md integration directly supports that mission by:
- Making x402guard discoverable and usable by AI agents
- Enabling autonomous security scanning without human intervention
- Integrating with popular agent frameworks (OpenClaw, LangChain, etc.)
- Providing clear machine-readable instructions for API usage

## Requirements

### FR-1: Create SKILL.md Document

**User Story:** As an AI agent developer, I want a SKILL.md file that teaches AI agents how to use x402guard, so that agents can autonomously scan skills before installation.

#### Acceptance Criteria

1. WHEN an AI agent reads the SKILL.md THEN it SHALL understand how to call x402guard's audit endpoints
2. WHEN the SKILL.md is loaded THEN it SHALL include metadata for OpenClaw compatibility (requires, bins, env)
3. WHEN an AI agent parses the SKILL.md THEN it SHALL understand the x402 payment flow
4. WHEN an agent attempts to use x402guard THEN the SKILL.md SHALL provide all necessary API documentation

### FR-2: API Endpoint Discovery

**User Story:** As an AI agent, I want the SKILL.md to clearly document available endpoints, so that I can choose the appropriate audit tier.

#### Acceptance Criteria

1. WHEN reading the SKILL.md THEN the agent SHALL find documentation for `/audit/quick`, `/audit/standard`, and `/audit/deep`
2. WHEN choosing an audit tier THEN the agent SHALL understand the price and capabilities of each tier
3. IF the agent needs pricing information THEN the SKILL.md SHALL include current USDC prices

### FR-3: x402 Payment Instructions

**User Story:** As an AI agent, I want clear payment instructions, so that I can pay for audits using the x402 protocol.

#### Acceptance Criteria

1. WHEN an agent calls an audit endpoint without payment THEN the SKILL.md SHALL explain the 402 response format
2. WHEN the agent receives a PAYMENT-REQUIRED header THEN the SKILL.md SHALL explain how to decode it
3. WHEN making a paid request THEN the SKILL.md SHALL document the X-PAYMENT header format
4. IF the agent has a wallet THEN the SKILL.md SHALL explain how to sign and submit payment

### FR-4: Response Interpretation

**User Story:** As an AI agent, I want to understand audit responses, so that I can decide whether to install or block a skill.

#### Acceptance Criteria

1. WHEN receiving an audit response THEN the agent SHALL understand the `recommendation` field (SAFE, CAUTION, DANGEROUS, BLOCKED)
2. WHEN the recommendation is BLOCKED THEN the agent SHALL NOT install the skill
3. WHEN the recommendation includes findings THEN the agent SHALL be able to report them to the user
4. IF the response includes a risk_score THEN the agent SHALL understand the 0-100 scale

### FR-5: Serve SKILL.md via API

**User Story:** As an AI agent, I want to fetch the SKILL.md from the x402guard API, so that I always have the latest instructions.

#### Acceptance Criteria

1. WHEN requesting GET /skill.md THEN the server SHALL return the SKILL.md content
2. WHEN requesting GET /skills/x402guard.md THEN the server SHALL return the same content (alternative path)
3. IF the request includes Accept: application/json THEN the server SHALL return structured skill metadata
4. WHEN the SKILL.md is updated THEN the API SHALL serve the new version immediately

### FR-6: ClawHub Compatibility

**User Story:** As an OpenClaw user, I want x402guard's skill to be publishable on ClawHub, so that I can easily add it to my agent.

#### Acceptance Criteria

1. WHEN the SKILL.md is published THEN it SHALL conform to OpenClaw's skill format
2. WHEN an agent loads the skill THEN it SHALL validate required env vars (wallet key)
3. IF required dependencies are missing THEN the skill SHALL provide installation instructions
4. WHEN publishing to ClawHub THEN the skill SHALL include proper metadata tags

### FR-7: Example Usage in SKILL.md

**User Story:** As an AI agent, I want working code examples in the SKILL.md, so that I can correctly call the API.

#### Acceptance Criteria

1. WHEN reading the SKILL.md THEN the agent SHALL find curl examples for each endpoint
2. WHEN implementing the skill THEN the agent SHALL find JavaScript/TypeScript examples
3. IF the agent needs to handle errors THEN examples SHALL include error handling
4. WHEN parsing x402 headers THEN examples SHALL show base64 decoding

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: SKILL.md file separate from API routes
- **Modular Design**: Skill serving logic in dedicated route file
- **Clear Interfaces**: Well-documented API responses

### Performance
- SKILL.md endpoint SHALL respond in <50ms
- SKILL.md content SHALL be cached in memory
- Static file serving SHALL not impact audit endpoint performance

### Security
- SKILL.md endpoint SHALL be publicly accessible (no payment required)
- No sensitive information in SKILL.md (no API keys, wallet addresses with funds)
- Rate limiting on SKILL.md endpoint to prevent abuse

### Reliability
- SKILL.md SHALL be served even if audit engine is down
- Fallback to bundled SKILL.md if dynamic generation fails

### Usability
- SKILL.md SHALL be human-readable as well as machine-readable
- Clear examples with comments explaining each step
- Consistent formatting following OpenClaw conventions
