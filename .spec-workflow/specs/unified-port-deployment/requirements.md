# Requirements Document: Unified Port Deployment

## Introduction

Consolidate the x402guard application to run on a single port (3000) by merging the Express API server into the Next.js web application. Currently, the server runs on port 3001 and the web app can run on port 3001, creating conflicts and requiring separate deployments. This unification will enable single-deployment architecture for AWS EC2, simplify development, and ensure all documentation and UI examples reference the correct endpoints.

## Alignment with Product Vision

x402guard is designed as a unified security scanning service. Running on a single port:
- Simplifies AWS EC2 deployment (single process, single port)
- Reduces infrastructure complexity
- Improves developer experience (one command to run everything)
- Ensures consistent API endpoint documentation across UI and docs

## Requirements

### FR-1: Merge Express Server into Next.js API Routes

**User Story:** As a developer, I want the Express API server routes merged into Next.js API routes, so that I can deploy a single application.

#### Acceptance Criteria

1. WHEN the Next.js app starts THEN it SHALL serve all API endpoints at `/api/*`
2. WHEN a request hits `/api/audit/quick` THEN Next.js SHALL handle x402 payment middleware and audit logic
3. WHEN a request hits `/api/health` THEN Next.js SHALL return health status directly (not proxy)
4. IF the Express server code in `/server` is removed THEN the API functionality SHALL remain intact in Next.js

### FR-2: Unify on Port 3000

**User Story:** As an operator, I want the application to run on port 3000 only, so that I can deploy with standard configurations.

#### Acceptance Criteria

1. WHEN running `pnpm dev` in the web app THEN it SHALL start on port 3000
2. WHEN deployed to AWS EC2 THEN the application SHALL listen on port 3000
3. IF port 3001 is referenced anywhere THEN it SHALL be updated to port 3000
4. WHEN Docker is used THEN the container SHALL expose port 3000 only

### FR-3: Update UI Curl Examples

**User Story:** As a user viewing the web UI, I want all curl examples to show the correct production endpoints, so that I can copy and use them correctly.

#### Acceptance Criteria

1. WHEN viewing the HeroToggle component THEN curl examples SHALL use `https://x402guard.xyz/api/*` endpoints
2. WHEN viewing the Integration section THEN code examples SHALL use correct `/api/*` paths
3. IF any hardcoded localhost:3001 exists in UI THEN it SHALL be removed or updated

### FR-4: Update All Documentation

**User Story:** As a developer reading documentation, I want all port and endpoint references to be consistent, so that I can follow instructions correctly.

#### Acceptance Criteria

1. WHEN reading README.md THEN all examples SHALL reference port 3000 and `/api/*` endpoints
2. WHEN reading docs/*.md files THEN all curl examples SHALL use production URLs with `/api/*` prefix
3. IF `.env` files reference port 3001 THEN they SHALL be updated to port 3000

### FR-5: Preserve x402 Payment Middleware

**User Story:** As an API user, I want the x402 payment flow to work correctly in the merged application, so that I can pay for scans.

#### Acceptance Criteria

1. WHEN making a request to `/api/audit/*` without payment THEN it SHALL return 402 with PAYMENT-REQUIRED header
2. WHEN including valid X-Payment header THEN the request SHALL be processed
3. WHEN x402 middleware is integrated into Next.js THEN it SHALL handle all payment tiers correctly

### FR-6: Maintain Audit Engine Functionality

**User Story:** As an API user, I want all scan functionality to work after the merge, so that security auditing continues to function.

#### Acceptance Criteria

1. WHEN calling `/api/audit/quick` THEN YARA scanning SHALL execute correctly
2. WHEN calling `/api/audit/standard` THEN permission and network analysis SHALL execute
3. WHEN calling `/api/audit/deep` THEN behavioral sandbox and attestation SHALL be included
4. IF audit engine imports from `/server/src/services/` THEN paths SHALL be updated correctly

## Non-Functional Requirements

### Code Architecture and Modularity
- Move audit engine services to a shared location accessible by Next.js API routes
- Preserve separation of concerns (scanner, analyzer, calculator as separate modules)
- Use Next.js middleware for cross-cutting concerns like CORS and x402

### Performance
- API response times SHALL remain under 2 seconds for quick scans
- Next.js API routes SHALL handle the same request load as Express

### Reliability
- Health check endpoint SHALL accurately report application status
- Error handling SHALL be consistent with current Express implementation

### Maintainability
- Single codebase easier to maintain than two separate servers
- Clear migration path documented for future reference
