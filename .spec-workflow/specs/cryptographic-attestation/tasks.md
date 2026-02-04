# Tasks Document: Cryptographic Attestation

## Overview
Implement real EIP-712 signed attestations for x402guard deep scans.

---

- [x] 1. Add viem dependency to server package.json
  - File: server/package.json
  - Add viem as a dependency (same version as web app)
  - Run pnpm install
  - Purpose: Enable EIP-712 signing in server
  - _Leverage: apps/web/package.json for version reference_
  - _Requirements: 1, 4_

- [x] 2. Add ATTESTATION_PRIVATE_KEY to config
  - File: server/src/config/index.ts
  - Add optional ATTESTATION_PRIVATE_KEY config variable
  - Log derived public address on startup (if key provided)
  - Purpose: Configure signing key securely
  - _Leverage: Existing config patterns, OWNERSHIP_PROOF_PRIVATE_KEY example_
  - _Requirements: 4_

- [x] 3. Create attestation utility with sign and verify functions
  - File: server/src/utils/attestation.ts (NEW)
  - Implement signAttestation() using EIP-712 typed data
  - Implement verifyAttestation() to recover signer
  - Define domain and types constants
  - Purpose: Core signing/verification logic
  - _Leverage: src/utils/ownership-proof.ts patterns, viem library_
  - _Requirements: 1, 2_

- [x] 4. Update audit route to use real signing
  - File: server/src/routes/audit.ts
  - Import signAttestation from utils
  - Replace fake attestation with real signature for deep tier
  - Handle missing private key gracefully (return null signature with warning)
  - Purpose: Integrate signing into deep scan flow
  - _Leverage: src/utils/attestation.ts_
  - _Requirements: 1, 2, 5_

- [x] 5. Create verification endpoint
  - File: server/src/routes/verify.ts (NEW)
  - Create POST /api/verify endpoint
  - Accept attestation object, return verification result
  - Register route in server.ts
  - Purpose: Allow anyone to verify attestations
  - _Leverage: src/utils/attestation.ts verifyAttestation()_
  - _Requirements: 3_

- [x] 6. Update types for new attestation format
  - File: server/src/types/api.ts
  - Update Attestation interface with new structure
  - Add AttestationMessage, VerificationResult types
  - Purpose: Type safety for new attestation format
  - _Leverage: Existing types in api.ts_
  - _Requirements: 2_

- [x] 7. Update frontend to show EIP-712 attestation badge
  - File: apps/web/components/sections/Scanner.tsx (or relevant component)
  - Show "EIP-712 Signed" badge when attestation has valid signature
  - Display signer address and verification status
  - Add tooltip explaining what EIP-712 attestation means
  - Purpose: Inform users that attestation is cryptographically verified
  - _Leverage: Existing Scanner component, attestation response_
  - _Requirements: 2_

- [x] 8. Test attestation signing and verification
  - Run server locally with test private key
  - Test deep scan returns signed attestation
  - Test /api/verify validates real attestation
  - Test /api/verify rejects forged attestation
  - Test frontend displays EIP-712 badge correctly
  - Purpose: Verify implementation works correctly
  - _Requirements: All_
