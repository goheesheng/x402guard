# Tasks Document: SKILL.md Integration

- [x] 1. Create SkillMetadata type in src/types/api.ts
  - File: server/src/types/api.ts
  - Add SkillMetadata and EndpointInfo interfaces
  - Purpose: Type safety for skill metadata responses
  - _Leverage: existing types in server/src/types/api.ts_
  - _Requirements: FR-5, FR-6_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Add SkillMetadata and EndpointInfo interfaces to server/src/types/api.ts for skill metadata responses | Restrictions: Do not modify existing types, only add new interfaces | Success: Types compile without errors, interfaces match design document | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_

- [x] 2. Create SKILL.md content file
  - File: server/src/content/skill.md
  - Create directory if needed
  - Write complete SKILL.md with OpenClaw-compatible frontmatter
  - Include API documentation, payment instructions, examples
  - Purpose: Teaching document for AI agents
  - _Leverage: README.md for existing documentation patterns_
  - _Requirements: FR-1, FR-2, FR-3, FR-4, FR-7_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer / Developer | Task: Create server/src/content/skill.md with OpenClaw-compatible YAML frontmatter, API documentation, x402 payment instructions, response interpretation guide, and working curl/JS examples | Restrictions: Must follow OpenClaw skill format, include all audit tiers, use real endpoint paths | Success: SKILL.md is valid markdown with proper frontmatter, all examples are accurate and working | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_

- [x] 3. Create skill route handler
  - File: server/src/routes/skill.ts
  - Implement GET /skill.md endpoint (returns markdown)
  - Implement GET /skill.json endpoint (returns JSON metadata)
  - Implement GET /skills/x402guard.md endpoint (alias)
  - Add content-type negotiation
  - Purpose: Serve SKILL.md via API
  - _Leverage: server/src/routes/audit.ts for route patterns, server/src/config/index.ts for pricing_
  - _Requirements: FR-5, FR-6_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Create server/src/routes/skill.ts with Express routes for GET /skill.md, GET /skill.json, and GET /skills/x402guard.md, reading content from server/src/content/skill.md | Restrictions: Follow existing route patterns from audit.ts, use fs.readFileSync for content, handle missing file gracefully | Success: All three endpoints return correct content-types, JSON endpoint returns structured metadata | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_

- [x] 4. Register skill routes in server
  - File: server/src/server.ts
  - Import and mount skill routes
  - Purpose: Enable skill endpoints
  - _Leverage: existing route mounting in server/src/server.ts_
  - _Requirements: FR-5_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Import skill routes in server/src/server.ts and mount them on the Express app | Restrictions: Follow existing import and mounting patterns, do not modify other routes | Success: Skill routes are accessible at /skill.md, /skill.json, /skills/x402guard.md | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_

- [x] 5. Add skill routes to Vercel serverless handler
  - File: server/api/index.ts
  - Import and mount skill routes for Vercel deployment
  - Purpose: Enable skill endpoints in production
  - _Leverage: existing route mounting in server/api/index.ts_
  - _Requirements: FR-5_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Import skill routes in server/api/index.ts and mount them for Vercel serverless deployment | Restrictions: Follow existing patterns, ensure content file is bundled | Success: Skill routes work on Vercel deployment | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_

- [x] 6. Test skill endpoints
  - Run dev server and test all endpoints
  - Verify content-type headers
  - Verify JSON structure
  - Test curl examples from SKILL.md
  - Purpose: Ensure endpoints work correctly
  - _Leverage: existing test patterns_
  - _Requirements: FR-5, FR-7_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Test all skill endpoints (GET /skill.md, GET /skill.json, GET /skills/x402guard.md) by running dev server and using curl, verify content-types and response structure | Restrictions: Test all endpoints, verify examples in SKILL.md are accurate | Success: All endpoints return expected responses, curl examples work | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_

- [x] 7. Update README with skill documentation
  - File: README.md
  - Add section about SKILL.md and AI agent integration
  - Document /skill.md endpoint
  - Purpose: User documentation
  - _Leverage: existing README.md structure_
  - _Requirements: FR-6_
  - _Prompt: Implement the task for spec skill-md-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Add a section to README.md documenting the SKILL.md feature, /skill.md endpoint, and how AI agents can use it | Restrictions: Follow existing README style, keep it concise | Success: README includes skill documentation section | Instructions: Mark task as in-progress in tasks.md before starting, use log-implementation tool after completion, then mark as complete_
