# Requirements Document: Mainnet Deployment & x402 Testing

## Introduction

This feature covers the deployment of SkillGuard to Base mainnet and comprehensive testing of the x402 payment protocol integration. SkillGuard provides pre-install security auditing for AI agent skills, complementing x402-secure's runtime payment protection. The goal is to have a production-ready system that accepts real USDC payments on Base mainnet and returns valid audit results.

## Alignment with Product Vision

SkillGuard fills a critical gap in the agentic trust stack:
- **tAudit (x402-secure)**: Audits payment functions at runtime
- **SkillGuard**: Audits skill files at install time (BEFORE any code runs)

This deployment enables:
1. Real-world testing of the x402 payment flow
2. Production security scanning for the AI agent ecosystem
3. Integration path with Trustline VAN (audit attestations as trust signals)

## Requirements

### Requirement 1: Vercel Mainnet Deployment

**User Story:** As an API operator, I want to deploy SkillGuard to Vercel with mainnet configuration, so that the service is publicly accessible and can accept real USDC payments.

#### Acceptance Criteria

1. WHEN the server starts THEN the system SHALL connect to Base mainnet (chain ID 8453)
2. WHEN a request arrives THEN the system SHALL route through x402 payment verification
3. IF environment variables are missing THEN the system SHALL fail startup with clear error messages
4. WHEN health endpoint is called THEN the system SHALL return `{ status: "ok", version, uptime }`
5. WHEN pricing endpoint is called THEN the system SHALL return all three tiers with correct USD amounts

### Requirement 2: x402 Payment Verification

**User Story:** As an API consumer, I want to pay for audits using USDC via x402 protocol, so that I can access security scanning without manual payment flows.

#### Acceptance Criteria

1. WHEN a POST /audit request lacks X-Payment header THEN the system SHALL return 402 Payment Required
2. WHEN X-Payment header contains invalid payment proof THEN the system SHALL reject with error
3. WHEN payment amount doesn't match requested tier THEN the system SHALL reject the request
4. WHEN valid payment for "quick" tier ($0.05) is provided THEN the system SHALL execute quick audit
5. WHEN valid payment for "standard" tier ($0.15) is provided THEN the system SHALL execute standard audit
6. WHEN valid payment for "deep" tier ($0.50) is provided THEN the system SHALL execute deep audit
7. WHEN payment is verified THEN USDC SHALL be transferred to configured wallet address

### Requirement 3: End-to-End Audit Flow Testing

**User Story:** As a developer, I want to run a complete audit through the SDK, so that I can verify the entire payment-to-result flow works on mainnet.

#### Acceptance Criteria

1. WHEN SDK is initialized with private key THEN the system SHALL create x402 payment wrapper
2. WHEN auditSkill() is called with skill URL THEN the system SHALL:
   - Generate payment proof via x402
   - Send request to mainnet server
   - Return audit result with risk_score, risk_level, recommendation, findings
3. WHEN audit completes THEN the system SHALL return valid audit_id and timestamp
4. IF skill content exceeds 1MB THEN the system SHALL reject with size limit error
5. WHEN isSafe() helper is called THEN the system SHALL return boolean based on recommendation

### Requirement 4: Test Coverage for Malware Detection

**User Story:** As a security operator, I want to verify malware detection works correctly, so that I can trust the audit results.

#### Acceptance Criteria

1. WHEN skill contains credential theft patterns (e.g., `~/.aws/credentials`) THEN the system SHALL detect with CRITICAL severity
2. WHEN skill contains data exfiltration (e.g., `curl --data`, webhook URLs) THEN the system SHALL detect with HIGH severity
3. WHEN skill contains known exfil domains (webhook.site, ngrok.io) THEN the system SHALL detect with HIGH severity
4. WHEN skill contains destructive commands (rm -rf /, format c:) THEN the system SHALL detect with CRITICAL severity
5. WHEN skill is clean (no malicious patterns) THEN the system SHALL return LOW risk score and SAFE recommendation
6. WHEN any CRITICAL malware is detected THEN recommendation SHALL be BLOCKED regardless of total score

### Requirement 5: Payment Wallet Verification

**User Story:** As the service operator, I want to verify that payments are received in my wallet, so that I can confirm the monetization flow works.

#### Acceptance Criteria

1. WHEN audit payment is processed THEN USDC SHALL appear in configured wallet on Base mainnet
2. WHEN multiple audits are performed THEN wallet balance SHALL increase by correct cumulative amount
3. WHEN payment fails THEN no audit SHALL be executed and error SHALL be returned to client

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: Payment handling separate from audit logic
- **Modular Design**: x402 middleware independent of audit engine
- **Dependency Management**: SDK dynamically imports x402 libraries
- **Clear Interfaces**: TypeScript types for all request/response formats

### Performance
- Audit response time SHALL be under 5 seconds for quick tier
- Audit response time SHALL be under 10 seconds for standard tier
- Server SHALL handle 100 concurrent requests without degradation

### Security
- Private keys SHALL never be logged or exposed in responses
- Server SHALL validate all input against Zod schemas
- CORS headers SHALL allow cross-origin requests for SDK clients
- Environment variables SHALL be validated on startup

### Reliability
- Server SHALL return appropriate error codes (400, 402, 500) with descriptive messages
- Health endpoint SHALL be available without payment (for monitoring)
- Server SHALL gracefully handle x402 facilitator timeouts

### Usability
- SDK SHALL provide typed responses for IDE autocomplete
- Error messages SHALL clearly indicate payment vs. validation vs. audit failures
- Documentation SHALL include working examples for all three tiers
