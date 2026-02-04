# Tasks Document: x402scan Integration

- [x] 1. Create audit JSON schemas
  - File: server/src/schemas/audit-schemas.ts
  - Define JSON Schema Draft 2020-12 for audit input (skill_url, skill_content, format)
  - Define JSON Schema for audit output (AuditResponse structure)
  - Export example input/output objects for Bazaar info field
  - Purpose: Provide reusable schemas for x402scan validation
  - _Leverage: server/src/types/api.ts for AuditRequest, AuditResponse types_
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in JSON Schema | Task: Create JSON Schema definitions for audit API input/output in server/src/schemas/audit-schemas.ts, based on existing types from server/src/types/api.ts. Export auditInputSchema, auditOutputSchema, auditInputExample, auditOutputExample. | Restrictions: Use JSON Schema Draft 2020-12, must match existing TypeScript types exactly, do not modify api.ts | _Leverage: server/src/types/api.ts | _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2 | Success: Schemas compile, examples validate against schemas, structure matches x402scan expectations. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 2. Create Bazaar extension factory
  - File: server/src/schemas/bazaar-extensions.ts
  - Import declareDiscoveryExtension from @x402/extensions
  - Create createAuditBazaarExtension(tier) function that returns extension object
  - Use auditInputSchema, auditOutputSchema, and examples from audit-schemas.ts
  - Purpose: Generate properly structured Bazaar extensions for each audit tier
  - _Leverage: @x402/extensions declareDiscoveryExtension, server/src/schemas/audit-schemas.ts_
  - _Requirements: 1.1, 2.1, 2.2, 2.3_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer with x402 protocol knowledge | Task: Create Bazaar extension factory in server/src/schemas/bazaar-extensions.ts using declareDiscoveryExtension from @x402/extensions. Function createAuditBazaarExtension(tier: AuditTier) returns Record<string, unknown> with bazaar extension. | Restrictions: Must use declareDiscoveryExtension(), method must be POST, bodyType must be json, must include both input and output schemas | _Leverage: @x402/extensions declareDiscoveryExtension, server/src/schemas/audit-schemas.ts | _Requirements: 1.1, 2.1, 2.2, 2.3 | Success: Extension validates with @x402/extensions validateDiscoveryExtension(), structure matches x402scan expectations. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 3. Register Bazaar extension with x402 resource server
  - File: server/src/middleware/x402.ts (modify existing)
  - Import bazaarResourceServerExtension from @x402/extensions
  - Call x402Server.registerExtension(bazaarResourceServerExtension) after server creation
  - Purpose: Enable Bazaar extension enrichment in 402 responses
  - _Leverage: @x402/extensions bazaarResourceServerExtension, existing x402Server instance_
  - _Requirements: 1.1_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with x402 middleware experience | Task: Modify server/src/middleware/x402.ts to register bazaarResourceServerExtension with x402Server. Import from @x402/extensions and call registerExtension after x402ResourceServer creation. | Restrictions: Do not change existing middleware logic, only add extension registration | _Leverage: @x402/extensions bazaarResourceServerExtension | _Requirements: 1.1 | Success: Extension is registered, no runtime errors on server start. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 4. Add Bazaar extensions to route configurations
  - File: server/src/middleware/x402.ts (modify existing)
  - Import createAuditBazaarExtension from bazaar-extensions.ts
  - Add extensions field to each route config (POST /audit/quick, POST /audit/standard, POST /audit/deep, POST /audit)
  - Purpose: Include Bazaar extension in 402 response for each endpoint
  - _Leverage: server/src/schemas/bazaar-extensions.ts createAuditBazaarExtension_
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with x402 middleware experience | Task: Modify route configurations in server/src/middleware/x402.ts to include extensions field with createAuditBazaarExtension() for each tier. Add extensions: createAuditBazaarExtension("quick") to POST /audit/quick, etc. | Restrictions: Must add extensions to all 4 POST /audit routes, do not change accepts/description/mimeType | _Leverage: server/src/schemas/bazaar-extensions.ts createAuditBazaarExtension | _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2 | Success: Each route has extensions field, 402 responses include extensions.bazaar. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 5. Create ownership proof generator utility
  - File: server/src/utils/ownership-proof.ts
  - Create generateOwnershipProof(origin, privateKey) function
  - Use viem for EIP-712 signature generation
  - Sign message: origin URL string using payTo private key
  - Purpose: Enable domain ownership verification on x402scan
  - _Leverage: viem signMessage or signTypedData_
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Blockchain Developer with viem/ethers experience | Task: Create ownership proof generator in server/src/utils/ownership-proof.ts. Function generateOwnershipProof(origin: string, privateKey: string): Promise<{origin, signature, address}>. Use viem privateKeyToAccount and signMessage. | Restrictions: Must use viem (already a dependency), signature must be recoverable to payTo address | _Leverage: viem privateKeyToAccount, signMessage | _Requirements: 4.1, 4.2, 4.3, 4.4 | Success: Signature can be verified to recover correct address. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 6. Add ownership proofs to discovery document
  - File: server/src/routes/discovery.ts (modify existing)
  - Import generateOwnershipProof and config
  - Add ownershipProofs array to DISCOVERY_DOCUMENT if OWNERSHIP_PROOF_PRIVATE_KEY is set
  - Generate proof at startup (or lazily on first request)
  - Purpose: Enable "Verified" status on x402scan
  - _Leverage: server/src/utils/ownership-proof.ts, server/src/config/index.ts_
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Modify server/src/routes/discovery.ts to include ownershipProofs in discovery document. Only add if OWNERSHIP_PROOF_PRIVATE_KEY env var is set. Generate proof for origin https://x402guard.xyz using generateOwnershipProof. | Restrictions: Must be optional (no crash if key missing), proof should be cached not regenerated per request | _Leverage: server/src/utils/ownership-proof.ts, server/src/config/index.ts | _Requirements: 4.1, 4.2, 4.3, 4.4 | Success: Discovery document includes ownershipProofs when configured, "Ownership verified" passes on x402scan. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 7. Add OWNERSHIP_PROOF_PRIVATE_KEY to config
  - File: server/src/config/index.ts (modify existing)
  - Add optional OWNERSHIP_PROOF_PRIVATE_KEY environment variable
  - No validation required (optional field)
  - Purpose: Support ownership proof generation without breaking existing deployments
  - _Leverage: server/src/config/index.ts existing pattern_
  - _Requirements: 4.1_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Add OWNERSHIP_PROOF_PRIVATE_KEY to server/src/config/index.ts as optional string. Follow existing pattern for optional env vars. | Restrictions: Must be optional, do not add validation that would cause startup failure | _Leverage: server/src/config/index.ts existing pattern | _Requirements: 4.1 | Success: Config loads with or without the env var set. Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [x] 8. Test x402scan validation locally
  - Manual testing step
  - Start server locally with npm run dev
  - Use curl to test 402 response includes extensions.bazaar
  - Decode payment-required header (base64) to verify structure
  - Test discovery endpoint includes ownershipProofs
  - Purpose: Verify implementation before production deployment
  - _Leverage: curl, base64 decode_
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Test x402scan integration locally. Run server, curl POST /api/audit/quick without payment, decode payment-required header, verify extensions.bazaar present with info and schema. Test /.well-known/x402 for ownershipProofs. | Restrictions: This is a manual testing task, document results | _Leverage: curl, base64 | _Requirements: 5.1, 5.2, 5.3, 5.4 | Success: 402 response has valid extensions.bazaar, discovery has ownershipProofs (if configured). Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._

- [ ] 9. Deploy and verify on x402scan Developer Hub
  - Manual testing step
  - Deploy updated server to production
  - Visit x402scan.com Developer Hub
  - Test https://x402guard.xyz/api/audit/quick in Resource Preview
  - Verify all validation checklist items pass
  - Purpose: Confirm x402scan compatibility in production
  - _Leverage: x402scan.com Developer Hub_
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - _Prompt: Implement the task for spec x402scan-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Deploy updated server to production and verify x402scan validation. Use x402scan Developer Hub Resource Preview to test all endpoints. Confirm all checklist items pass: Returns 402, x402 parses, Has accepts, Input schema, Output schema, Ownership verified. | Restrictions: Deploy only after local testing passes | _Leverage: x402scan.com Developer Hub | _Requirements: 5.1, 5.2, 5.3, 5.4 | Success: All x402scan validation checks pass, service shows as "Verified". Set task in progress in tasks.md before starting, use log-implementation after completion, mark complete when done._
