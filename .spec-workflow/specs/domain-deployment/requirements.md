# Requirements Document: Domain Deployment for x402guard.xyz

## Introduction

Deploy the x402guard API server to a production environment accessible via the custom domain `x402guard.xyz`. Users should be able to call the x402 API endpoints (e.g., `http://x402guard.xyz/audit/quick`) and receive proper x402 payment responses. The frontend at `skillscan-web` is already configured to call this domain.

## Alignment with Product Vision

This deployment enables x402guard to be publicly accessible, allowing AI agent developers to audit skills before installation using the x402 pay-per-use model. The custom domain provides branding and professional appearance.

## Requirements

### Requirement 1: Domain DNS Configuration

**User Story:** As a developer, I want x402guard.xyz to resolve to my server, so that API calls reach the correct endpoint.

#### Acceptance Criteria

1. WHEN a user visits http://x402guard.xyz THEN the system SHALL respond with the API root info
2. WHEN a user calls http://x402guard.xyz/health THEN the system SHALL return `{"status": "ok"}`
3. WHEN DNS is queried for x402guard.xyz THEN it SHALL resolve to the server IP address

### Requirement 2: x402 Payment Flow

**User Story:** As a developer, I want to call the x402guard API with proper x402 payment headers, so that I can audit skills.

#### Acceptance Criteria

1. WHEN a POST request to /audit/quick lacks payment THEN the system SHALL return HTTP 402 with `PAYMENT-REQUIRED` header
2. WHEN the `PAYMENT-REQUIRED` header is decoded THEN it SHALL contain valid x402 V2 payload with network `eip155:8453`
3. WHEN a valid X-PAYMENT header is included THEN the system SHALL process the audit and return results
4. WHEN CORS preflight OPTIONS is sent THEN the system SHALL respond with proper headers including `Access-Control-Expose-Headers: X-Payment-Response, X-Payment-Required`

### Requirement 3: HTTPS Support

**User Story:** As a developer, I want to access the API over HTTPS, so that my requests are secure.

#### Acceptance Criteria

1. WHEN a user visits https://x402guard.xyz THEN the system SHALL serve via valid SSL certificate
2. WHEN a user visits http://x402guard.xyz THEN the system MAY redirect to HTTPS (optional)
3. WHEN SSL certificate is checked THEN it SHALL be valid and not expired

### Requirement 4: Server Reliability

**User Story:** As a developer, I want the API to be always available, so that I can audit skills at any time.

#### Acceptance Criteria

1. WHEN the server process crashes THEN the system SHALL automatically restart
2. WHEN health check fails THEN the system SHALL log the error
3. WHEN server starts THEN it SHALL listen on port 3000 (internal) or 80/443 (external)

### Requirement 5: Environment Configuration

**User Story:** As an operator, I want to configure payment addresses via environment variables, so that USDC goes to my wallet.

#### Acceptance Criteria

1. WHEN X402_PAY_TO_ADDRESS is set THEN the system SHALL use that address in payment requests
2. WHEN CDP_API_KEY_ID and CDP_API_KEY_SECRET are set THEN the system SHALL use authenticated facilitator
3. WHEN environment variables are missing THEN the system SHALL use sensible defaults or fail gracefully

## Non-Functional Requirements

### Code Architecture and Modularity
- Use existing server code from `server/` directory
- Leverage existing `api/index.ts` for Vercel or `src/index.ts` for Node deployment
- No code changes required - deployment configuration only

### Performance
- API response time under 2 seconds for audit requests
- Support concurrent requests without blocking

### Security
- Environment variables stored securely (not in code)
- HTTPS for production traffic
- CORS properly configured for frontend domain

### Reliability
- 99%+ uptime target
- Automatic restart on crash
- Health endpoint for monitoring

### Usability
- Simple deployment process
- Clear documentation for DNS setup
- Easy environment variable configuration

## Deployment Options

The user can choose from:

1. **Vercel** (simplest) - Use existing `server/api/index.ts`
2. **AWS EC2/ECS** - Use existing `server/Dockerfile`
3. **Other cloud providers** - Railway, Render, DigitalOcean, etc.

## Out of Scope

- Frontend deployment (already configured to call x402guard.xyz)
- Database setup (API is stateless)
- Rate limiting (handled by x402 payment)
