# Requirements Document: SKILL.md Enhancement

## Introduction

Enhance the x402guard SKILL.md to be a comprehensive, agent-friendly teaching document modeled after Clawk's skill.md. The goal is to make x402guard's SKILL.md the definitive guide for AI agents to autonomously scan skills before installation, with clear instructions, best practices, and integration patterns.

The enhanced SKILL.md should:
1. Include a TL;DR quick reference for token-constrained agents
2. Provide clear step-by-step integration instructions
3. Explain the "why" behind security scanning (not just the "how")
4. Include autonomy guidelines for agents
5. Be comprehensive enough that an agent can integrate x402guard without human help

## Alignment with Product Vision

x402guard protects AI agents from malicious skills before installation. A comprehensive SKILL.md ensures:
- AI agents can autonomously integrate x402guard
- Security scanning becomes a standard part of skill installation
- Agents understand WHY they should scan (not just how)
- Token-constrained agents get a quick reference
- The skill is discoverable on ClawHub and other skill registries

## Requirements

### FR-1: TL;DR Quick Reference Section

**User Story:** As a token-constrained AI agent, I want a compact quick reference at the top of SKILL.md, so that I can use x402guard without reading the full document.

#### Acceptance Criteria

1. WHEN an agent fetches SKILL.md THEN it SHALL find a TL;DR code block within the first 50 lines
2. WHEN reading the TL;DR THEN the agent SHALL find: base URL, auth method, version check endpoint, and all key endpoints with prices
3. IF the agent only reads the TL;DR THEN it SHALL have enough information to make basic API calls
4. WHEN the TL;DR is displayed THEN it SHALL fit within 30 lines of monospace text

### FR-2: Enhanced Metadata Frontmatter

**User Story:** As an AI agent framework (OpenClaw), I want rich metadata in the YAML frontmatter, so that I can properly categorize and gate the skill.

#### Acceptance Criteria

1. WHEN parsing the frontmatter THEN the agent SHALL find: name, version, description, homepage, user-invocable flag
2. WHEN the metadata includes openclaw section THEN it SHALL specify: emoji, category, primaryEnv, requires.env
3. IF the skill requires environment variables THEN they SHALL be listed in requires.env array
4. WHEN fetching /skill.json THEN it SHALL return the same metadata in JSON format

### FR-3: The Security Case (Why Scan)

**User Story:** As an AI agent, I want to understand WHY I should scan skills before installing, so that I can make informed decisions about security.

#### Acceptance Criteria

1. WHEN reading SKILL.md THEN the agent SHALL find a "Why Scan" or "The Problem" section
2. WHEN reading this section THEN the agent SHALL understand: what malicious skills can do, what x402guard catches, the security gap it fills
3. IF the agent is deciding whether to use x402guard THEN the document SHALL provide compelling reasons
4. WHEN examples are given THEN they SHALL include real attack patterns (credential theft, data exfiltration)

### FR-4: First Boot Protocol

**User Story:** As an AI agent integrating x402guard for the first time, I want a clear first-boot checklist, so that I set up security scanning correctly.

#### Acceptance Criteria

1. WHEN an agent first integrates x402guard THEN it SHALL find a "First Boot" or "Quick Start" section with numbered steps
2. WHEN following first boot THEN the agent SHALL: store credentials, verify API access, run a test scan
3. IF first boot is incomplete THEN the document SHALL explain what's missing
4. WHEN first boot completes THEN the agent SHALL have a working x402guard integration

### FR-5: Autonomy Framework

**User Story:** As an AI agent, I want clear guidelines on what security decisions I can make autonomously vs. requiring human approval, so that I can act appropriately.

#### Acceptance Criteria

1. WHEN reading SKILL.md THEN the agent SHALL find an "Autonomy" section
2. WHEN a skill is rated SAFE THEN the agent SHALL know it can install autonomously
3. WHEN a skill is rated CAUTION THEN the agent SHALL know to review findings or ask human
4. WHEN a skill is rated DANGEROUS or BLOCKED THEN the agent SHALL know to NOT install and alert human
5. IF the agent is unsure THEN the document SHALL provide decision-making guidance

### FR-6: Comprehensive API Reference

**User Story:** As an AI agent, I want a complete API reference with all endpoints, request/response formats, and error codes, so that I can handle all scenarios.

#### Acceptance Criteria

1. WHEN reading the API section THEN the agent SHALL find a table of all endpoints with methods, paths, prices, and descriptions
2. WHEN making requests THEN the agent SHALL find request body schemas with examples
3. WHEN receiving responses THEN the agent SHALL find response schemas with all fields documented
4. WHEN errors occur THEN the agent SHALL find an error code table with HTTP status, meaning, and recovery actions
5. IF rate limits apply THEN the document SHALL specify limits and Retry-After handling

### FR-7: Integration Patterns

**User Story:** As an AI agent, I want code examples for common integration patterns, so that I can copy and adapt them.

#### Acceptance Criteria

1. WHEN integrating x402guard THEN the agent SHALL find: pre-install hook pattern, batch scanning pattern, result caching pattern
2. WHEN using the x402 payment flow THEN the agent SHALL find complete TypeScript/JavaScript examples
3. IF the agent uses a different language THEN curl examples SHALL be provided
4. WHEN handling 402 responses THEN the document SHALL show the complete flow with code

### FR-8: Persistent Integration

**User Story:** As an AI agent, I want guidance on making x402guard persist across sessions, so that security scanning survives context resets.

#### Acceptance Criteria

1. WHEN reading SKILL.md THEN the agent SHALL find a "Make Persistent" section
2. WHEN setting up persistence THEN the agent SHALL know to add x402guard to HEARTBEAT.md or equivalent
3. IF the agent loses context THEN the document SHALL explain how to recover
4. WHEN starting a new session THEN the agent SHALL know to re-fetch skill.md for updates

### FR-9: Best Practices Section

**User Story:** As an AI agent, I want security scanning best practices, so that I use x402guard effectively.

#### Acceptance Criteria

1. WHEN reading SKILL.md THEN the agent SHALL find a "Best Practices" section
2. WHEN scanning skills THEN the agent SHALL know: scan before install, cache results, handle failures gracefully
3. IF a scan fails THEN the agent SHALL know to retry or escalate to human
4. WHEN reporting to humans THEN the agent SHALL know how to format findings clearly

### FR-10: Version and Update Handling

**User Story:** As an AI agent, I want to know when SKILL.md has been updated, so that I always have the latest instructions.

#### Acceptance Criteria

1. WHEN fetching SKILL.md THEN the agent SHALL find version information in frontmatter
2. WHEN starting a session THEN the agent SHALL re-fetch skill.md for updates
3. IF a new version is available THEN the document SHALL explain what changed (via /skill-version endpoint)
4. WHEN the API changes THEN the document SHALL be updated accordingly

## Non-Functional Requirements

### Code Architecture and Modularity
- SKILL.md content in dedicated file (`server/src/content/skill.md`)
- Metadata in separate file (`server/src/content/skill-metadata.ts`)
- Route handler serves both formats

### Performance
- SKILL.md endpoint responds in <50ms
- Content cached with appropriate Cache-Control headers
- Gzip compression for large document

### Maintainability
- Single source of truth for skill documentation
- Version number updated with each change
- Embedded in Vercel handler for serverless deployment

### Compatibility
- Valid YAML frontmatter (parseable by OpenClaw and others)
- Valid Markdown (renders correctly in terminals and browsers)
- JSON endpoint for programmatic access
