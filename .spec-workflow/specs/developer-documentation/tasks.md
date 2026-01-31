# Tasks Document: x402guard Developer Documentation

## Phase 1: Create New Documentation Files

- [x] 1. Create PROBLEM.md - Security gap explanation
  - File: `docs/PROBLEM.md`
  - Explain the attack scenario (malicious skill steals credentials)
  - Show why x402-secure/tAudit doesn't catch pre-install attacks
  - Include Rufio's ClawdHub scan example
  - Purpose: Help developers understand WHY they need x402guard
  - _Leverage: server/README.md attack diagrams, context from user about tAudit_
  - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Create PROBLEM.md explaining the security gap - malicious skills can steal credentials before any payment triggers tAudit. Include concrete attack example and show timeline of attack with/without x402guard. | Restrictions: Do not make claims about x402-secure that aren't accurate. Keep focus on pre-install vs runtime distinction. | Success: Developer understands the gap after reading, attack scenario is clear, x402guard value proposition is obvious | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 2. Create SECURITY_LAYERS.md - x402guard vs x402-secure comparison
  - File: `docs/SECURITY_LAYERS.md`
  - Document all 4 security layers (ERC-8004, x402guard, Trustline, x402-secure)
  - Create comparison table showing what each protects
  - Show attack flow diagram illustrating which layer catches what
  - Explain how x402guard attestations could feed into Trustline VAN
  - Purpose: Position x402guard in the security stack
  - _Leverage: User's tAudit analysis, x402-secure documentation_
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Architect | Task: Create SECURITY_LAYERS.md with 4-layer security stack diagram, comparison table, and attack flow showing what each layer catches. Explain tAudit covers payment code integrity at runtime, x402guard covers skill files at install time. | Restrictions: Accurately represent what tAudit does based on user's research. Don't overstate x402guard capabilities. | Success: Clear diagram, accurate comparison, developer knows when to use each tool | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 3. Create SKILLS_EXPLAINED.md - What are AI skills
  - File: `docs/SKILLS_EXPLAINED.md`
  - Explain SKILL.md file structure and purpose
  - Show examples of safe skills (weather API)
  - Show examples of malicious skills (credential theft)
  - Link to ClawdHub and OpenClaw skill registries
  - Purpose: Educate developers new to agentic ecosystem
  - _Leverage: examples/test-skills/, ClawdHub documentation_
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Developer Advocate | Task: Create SKILLS_EXPLAINED.md explaining what "skills" are in the AI agent ecosystem. Show SKILL.md structure, safe weather skill example, malicious credential theft example. Link to real skill registries. | Restrictions: Keep examples simple and clear. Don't create actual working malware. | Success: Developer new to skills understands what they are and why they're dangerous | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 4. Create SDK_REFERENCE.md - X402GuardClient documentation
  - File: `docs/SDK_REFERENCE.md`
  - Document installation (`npm install x402guard-client`)
  - Document X402GuardClient class and constructor options
  - Document all methods: auditSkill(), quickAudit(), isSafe()
  - Document response types (AuditResult, MalwareMatch, etc.)
  - Include error handling examples
  - Purpose: Complete SDK API reference
  - _Leverage: packages/skillguard-client/src/index.ts, examples/tests/test-x402-payment.ts_
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: API Documentation Writer | Task: Create SDK_REFERENCE.md documenting X402GuardClient class, all methods, options, response types, and error handling. Use new x402guard naming. Include TypeScript type definitions. | Restrictions: All code examples must be copy-paste ready. Use placeholder for private key. | Success: Developer can integrate SDK using only this reference | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 5. Create DETECTION_RULES.md - YARA rules documentation
  - File: `docs/DETECTION_RULES.md`
  - Document all 10 detection rule categories
  - Include severity level for each rule
  - Show example patterns that trigger each rule
  - Provide sample code snippets that would be flagged
  - Explain how to interpret findings in audit results
  - Purpose: Help security engineers understand detection coverage
  - _Leverage: server/src/services/auditEngine/yaraScanner.ts_
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Engineer | Task: Create DETECTION_RULES.md documenting all 10 YARA detection rules from yaraScanner.ts. Include rule name, severity, patterns matched, and example code that triggers each. | Restrictions: Examples should be educational, not usable malware. Keep pattern descriptions accurate. | Success: Security engineer can assess x402guard coverage and understand findings | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 6. Create RISK_SCORING.md - Scoring algorithm documentation
  - File: `docs/RISK_SCORING.md`
  - Document 0-100 risk score scale
  - Explain severity weights (CRITICAL=40, HIGH=25, MEDIUM=15, LOW=5)
  - Explain category caps (malware=50, credentials=30, network=20, permissions=15)
  - Document risk level thresholds (LOW 0-24, MEDIUM 25-49, HIGH 50-74, CRITICAL 75+)
  - Explain recommendation logic (SAFE, CAUTION, DANGEROUS, BLOCKED)
  - Purpose: Help developers interpret risk scores correctly
  - _Leverage: server/src/services/auditEngine/riskCalculator.ts_
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Create RISK_SCORING.md explaining the risk scoring algorithm from riskCalculator.ts. Include weights, caps, thresholds, and how CRITICAL findings always result in BLOCKED. | Restrictions: Numbers must match actual implementation. Keep explanations clear for non-security experts. | Success: Developer can correctly interpret any risk score and recommendation | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 7. Create DEPLOYMENT.md - Deployment guide
  - File: `docs/DEPLOYMENT.md`
  - Document Vercel deployment steps
  - Document VPS/Docker deployment
  - Document all environment variables
  - Explain CDP credentials setup for x402
  - Include local development setup
  - Purpose: Help DevOps deploy x402guard
  - _Leverage: server/vercel.json, server/.env.example, docs/SELF_HOSTING.md_
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Create DEPLOYMENT.md with Vercel, VPS/Docker, and local deployment instructions. Include all environment variables, CDP credentials setup, and troubleshooting tips. | Restrictions: Never include real credentials. Make Vercel deployment primary (easiest). | Success: Developer can deploy x402guard to any environment following the guide | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 2: Update Existing Documentation with x402guard Branding

- [x] 8. Update docs/README.md - Documentation index
  - File: `docs/README.md`
  - Rename all references from SkillGuard to x402guard
  - Add links to new documentation files
  - Update architecture diagram with x402guard branding
  - Purpose: Central documentation hub
  - _Leverage: docs/README.md existing content_
  - _Requirements: 9.1_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update docs/README.md with x402guard branding, add links to all new docs (PROBLEM, SECURITY_LAYERS, SKILLS_EXPLAINED, etc.), update architecture diagram. | Restrictions: Maintain existing structure, just rebrand and add new links. | Success: README provides clear navigation to all documentation | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 9. Update docs/QUICKSTART.md - Getting started guide
  - File: `docs/QUICKSTART.md`
  - Rename SkillGuardClient to X402GuardClient
  - Update package name to x402guard-client
  - Update all code examples with new naming
  - Purpose: Quick start with correct branding
  - _Leverage: docs/QUICKSTART.md existing content_
  - _Requirements: 9.1, 9.2_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update QUICKSTART.md - rename SkillGuardClient to X402GuardClient, skillguard-client to x402guard-client, update all code examples. | Restrictions: Keep existing structure and flow, just update names. | Success: Quickstart works with new x402guard naming | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 10. Update docs/API_REFERENCE.md - API documentation
  - File: `docs/API_REFERENCE.md`
  - Update all endpoint URLs to use x402guard domain
  - Rename any SkillGuard references to x402guard
  - Verify all response examples are accurate
  - Purpose: Accurate API reference
  - _Leverage: docs/API_REFERENCE.md existing content_
  - _Requirements: 9.1_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update API_REFERENCE.md with x402guard branding, update endpoint URLs, verify response examples match actual API. | Restrictions: Keep API structure unchanged, just update branding. | Success: API reference is accurate with x402guard naming | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 11. Update docs/AGENT_INTEGRATION.md - Framework integrations
  - File: `docs/AGENT_INTEGRATION.md`
  - Rename SkillGuardClient to X402GuardClient in all examples
  - Update import statements to x402guard-client
  - Update API URLs to x402guard
  - Purpose: Working integration examples
  - _Leverage: docs/AGENT_INTEGRATION.md existing content_
  - _Requirements: 9.1, 9.2_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update AGENT_INTEGRATION.md - rename all SkillGuardClient to X402GuardClient, update imports to x402guard-client, update URLs. | Restrictions: Keep integration patterns unchanged, just update names. | Success: All integration examples work with x402guard naming | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 12. Update docs/SELF_HOSTING.md - Self-hosting guide
  - File: `docs/SELF_HOSTING.md`
  - Rename SkillGuard references to x402guard
  - Update repository URLs
  - Purpose: Accurate self-hosting guide
  - _Leverage: docs/SELF_HOSTING.md existing content_
  - _Requirements: 9.1_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update SELF_HOSTING.md with x402guard branding, update repo URLs and all SkillGuard references. | Restrictions: Keep instructions unchanged, just update branding. | Success: Self-hosting guide works with x402guard naming | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 13. Update server/README.md - Main project README
  - File: `server/README.md`
  - Rename all SkillScan/SkillGuard to x402guard
  - Update badges and links
  - Update architecture diagrams
  - Update all code examples
  - Purpose: Main entry point for developers
  - _Leverage: server/README.md existing content_
  - _Requirements: 9.1, 9.2, 9.3_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update server/README.md - comprehensive rebrand from SkillScan/SkillGuard to x402guard. Update badges, links, diagrams, code examples. This is the main entry point. | Restrictions: Maintain all existing content and structure. | Success: README.md is fully rebranded to x402guard | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 3: Rename SDK Package

- [x] 14. Rename packages/skillguard-client to packages/x402guard-client
  - Files: `packages/skillguard-client/*` → `packages/x402guard-client/*`
  - Rename directory
  - Update package.json name to x402guard-client
  - Rename SkillGuardClient class to X402GuardClient
  - Update all internal references
  - Update exports
  - Purpose: SDK package with correct naming
  - _Leverage: packages/skillguard-client/ existing code_
  - _Requirements: 9.2, 9.3_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Rename skillguard-client package to x402guard-client. Rename directory, update package.json, rename SkillGuardClient class to X402GuardClient, update all exports and references. | Restrictions: Maintain all existing functionality. Keep backward compatibility note in README. | Success: Package works with new x402guard-client name and X402GuardClient class | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 4: Update Examples and Tests

- [x] 15. Update examples/tests/test-x402-payment.ts
  - File: `examples/tests/test-x402-payment.ts`
  - Update imports to use x402guard-client
  - Update class names to X402GuardClient
  - Update console output to reference x402guard
  - Purpose: Working test example
  - _Leverage: examples/tests/test-x402-payment.ts existing code_
  - _Requirements: 9.2_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Developer | Task: Update test-x402-payment.ts with x402guard naming - update imports, class names, console output. | Restrictions: Keep test logic unchanged, just update names. | Success: Test script runs with x402guard naming | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 16. Update root package.json and workspace config
  - File: `package.json`, `pnpm-workspace.yaml`
  - Update workspace reference from skillguard-client to x402guard-client
  - Update any scripts that reference old name
  - Purpose: Monorepo works with new package name
  - _Leverage: package.json, pnpm-workspace.yaml_
  - _Requirements: 9.3_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Update root package.json and pnpm-workspace.yaml to reference x402guard-client instead of skillguard-client. | Restrictions: Don't break monorepo build. | Success: pnpm install and build work with new package name | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 5: Final Verification

- [x] 17. Verify all documentation links work
  - File: All `docs/*.md` files
  - Check all cross-references between docs
  - Verify no broken links
  - Verify code examples compile/run
  - Purpose: Quality assurance
  - _Leverage: All documentation files_
  - _Requirements: All_
  - _Prompt: Implement the task for spec developer-documentation, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Verify all documentation links work, cross-references are correct, code examples compile. Fix any broken links or errors. | Restrictions: Don't add new content, just fix issues. | Success: All docs link correctly, examples work | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_
