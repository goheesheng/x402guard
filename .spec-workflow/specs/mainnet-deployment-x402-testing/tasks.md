# Tasks Document: Mainnet Deployment & x402 Testing

## Phase 1: Pre-Deployment Preparation

- [x] 1. Create test skill files for malware detection verification
  - Files: `examples/test-skills/safe-weather-skill.md`, `examples/test-skills/malicious-credential-theft.md`, `examples/test-skills/malicious-exfiltration.md`
  - Create clean skill that should return SAFE
  - Create malicious skills with known detection patterns (credential theft, data exfiltration)
  - Purpose: Provide controlled test cases for malware detection verification
  - _Leverage: server/src/services/auditEngine/yaraScanner.ts patterns_
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Test Engineer | Task: Create test skill markdown files - one clean (weather API) and two malicious (credential theft with ~/.aws/credentials, data exfiltration with webhook.site) for testing detection patterns from yaraScanner.ts | Restrictions: Do not create actual malware, just patterns that trigger detection rules. Keep files simple and focused. | Success: 3 test skill files created, clean skill has no malicious patterns, malicious skills contain patterns that match YARA rules | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 2. Verify server builds successfully
  - File: `server/` directory
  - Run `pnpm build` in server directory
  - Fix any TypeScript compilation errors
  - Purpose: Ensure deployment package compiles without errors
  - _Leverage: server/package.json, server/tsconfig.json_
  - _Requirements: 1.1, 1.3_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Build the server package using pnpm build, verify no TypeScript errors, check output in dist/ | Restrictions: Do not modify source code unless fixing actual build errors | Success: Build completes with exit code 0, dist/ directory contains compiled JS | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 2: Deployment

- [x] 3. Deploy server to Vercel
  - File: `server/` directory
  - Deploy using Vercel CLI or git push
  - Verify environment variables are set in Vercel dashboard
  - Purpose: Deploy production server to mainnet
  - _Leverage: server/vercel.json, .env_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Deploy server to Vercel using `vercel --prod` from server/ directory, ensure X402_PAY_TO_ADDRESS and X402_FACILITATOR_URL are set in Vercel environment | Restrictions: Do not expose private keys, verify mainnet network (eip155:8453) | Success: Deployment completes, URL is accessible at skillguard-api.vercel.app | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 3: Free Endpoint Testing

- [x] 4. Test health endpoint
  - File: None (API test)
  - Call GET /health on deployed server
  - Verify response: `{ status: "ok", version: "0.1.0", uptime: number }`
  - Purpose: Verify server is running and accessible
  - _Leverage: server/src/routes/health.ts_
  - _Requirements: 1.4_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Test health endpoint at https://skillguard-api.vercel.app/health using curl or fetch, verify JSON response with status "ok" | Restrictions: None | Success: Endpoint returns 200 with correct JSON structure | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 5. Test pricing endpoint
  - File: None (API test)
  - Call GET /pricing on deployed server
  - Verify all three tiers are returned with correct prices
  - Purpose: Verify pricing information is accessible
  - _Leverage: server/src/routes/pricing.ts_
  - _Requirements: 1.5_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Test pricing endpoint at https://skillguard-api.vercel.app/pricing, verify quick ($0.05), standard ($0.15), deep ($0.50) tiers are returned | Restrictions: None | Success: Endpoint returns 200 with all 3 tiers and correct USD amounts | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 4: x402 Payment Testing

- [x] 6. Create test script for x402 payment flow
  - File: `examples/tests/test-x402-payment.ts`
  - Create script using SkillGuardClient SDK
  - Test quick audit with real USDC payment
  - Purpose: Verify end-to-end x402 payment and audit flow
  - _Leverage: packages/skillguard-client/src/index.ts, examples/basic-audit.ts_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Integration Engineer | Task: Create test script that initializes SkillGuardClient with private key from env, calls quickAudit on test skill, logs payment status and audit result | Restrictions: Private key must come from environment variable, not hardcoded. Handle payment errors gracefully. | Success: Script runs, payment processes, audit result returned with risk_score and recommendation | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 7. Test quick tier audit ($0.05)
  - File: Run `examples/tests/test-x402-payment.ts`
  - Execute quick audit with safe skill
  - Verify payment deducted and result received
  - Purpose: Verify quick tier payment and audit
  - _Leverage: Task 6 script_
  - _Requirements: 2.4, 3.1, 3.2, 3.3_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Run test script with tier='quick' on safe weather skill, verify $0.05 USDC payment processes, audit returns risk_score and SAFE recommendation | Restrictions: Ensure wallet has sufficient USDC before testing | Success: Payment completes, audit_id returned, risk_level is LOW, recommendation is SAFE | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 8. Test standard tier audit ($0.15)
  - File: Run test script with tier='standard'
  - Execute standard audit with safe skill
  - Verify permissions and network analysis included
  - Purpose: Verify standard tier includes full analysis
  - _Leverage: Task 6 script_
  - _Requirements: 2.5, 3.1, 3.2, 3.3_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Run test script with tier='standard' on safe weather skill, verify $0.15 USDC payment, audit result includes permissions[] and network[] arrays | Restrictions: None | Success: Payment completes, result includes permissions analysis, network call detection | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 5: Malware Detection Testing

- [x] 9. Test credential theft detection
  - File: Use malicious-credential-theft.md skill
  - Audit skill with credential access patterns
  - Verify CRITICAL severity and BLOCKED recommendation
  - Purpose: Verify credential theft detection works
  - _Leverage: examples/test-skills/malicious-credential-theft.md_
  - _Requirements: 4.1, 4.6_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Engineer | Task: Audit malicious-credential-theft.md skill, verify YARA scanner detects credential_theft_files rule, risk_level is CRITICAL, recommendation is BLOCKED | Restrictions: None | Success: Detection fires on ~/.aws/credentials pattern, severity CRITICAL, recommendation BLOCKED | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 10. Test data exfiltration detection
  - File: Use malicious-exfiltration.md skill
  - Audit skill with webhook.site POST
  - Verify HIGH severity detection
  - Purpose: Verify exfiltration detection works
  - _Leverage: examples/test-skills/malicious-exfiltration.md_
  - _Requirements: 4.2, 4.3_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Engineer | Task: Audit malicious-exfiltration.md skill, verify known_exfil_domains rule detects webhook.site, risk_level is HIGH or CRITICAL | Restrictions: None | Success: Detection fires on webhook.site pattern, severity HIGH, recommendation DANGEROUS or BLOCKED | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 11. Test clean skill returns SAFE
  - File: Use safe-weather-skill.md
  - Audit clean skill with no malicious patterns
  - Verify LOW risk and SAFE recommendation
  - Purpose: Verify false positive rate is acceptable
  - _Leverage: examples/test-skills/safe-weather-skill.md_
  - _Requirements: 4.5_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Audit safe-weather-skill.md, verify no malware matches, risk_score < 25, risk_level is LOW, recommendation is SAFE | Restrictions: None | Success: No false positives, clean skill passes audit | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 6: Payment Verification

- [x] 12. Verify wallet received USDC payments
  - File: None (blockchain verification)
  - Check wallet balance on Basescan
  - Calculate expected total from tests (quick + standard + 3 detection tests)
  - Purpose: Confirm payment flow is complete
  - _Leverage: Basescan API or UI_
  - _Requirements: 5.1, 5.2, 5.3_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Finance/Blockchain Engineer | Task: Check USDC balance at 0xdc7f6ebefe62a402e7c75dd0b6d20ed7c4cb326a on Base mainnet via Basescan, verify balance increased by expected amount from test transactions | Restrictions: None | Success: Wallet shows USDC balance increase matching test payments | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_

## Phase 7: Documentation

- [x] 13. Document test results and deployment status
  - File: `docs/DEPLOYMENT_VERIFICATION.md`
  - Record all test results
  - Document deployment URL and configuration
  - Purpose: Create audit trail and reference
  - _Leverage: All previous task results_
  - _Requirements: All_
  - _Prompt: Implement the task for spec mainnet-deployment-x402-testing, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Create DEPLOYMENT_VERIFICATION.md documenting: deployment URL, test results (health, pricing, audits, detection), payment verification, any issues found | Restrictions: Do not include private keys or sensitive data | Success: Document provides complete verification record | Instructions: Mark task as [-] in tasks.md when starting, use log-implementation tool after completion with artifacts, then mark as [x]_
