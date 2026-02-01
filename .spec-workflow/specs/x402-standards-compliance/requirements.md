# Requirements: x402 Standards Compliance Audit

## Overview

Audit and ensure that all x402 protocol implementations in x402guard follow the official x402 V2 standard as documented at https://docs.x402.org/. This includes server-side middleware, client SDK, and test examples.

## Functional Requirements

### FR-1: Server-Side x402 Middleware Compliance

**FR-1.1**: Use official `@x402/express` paymentMiddleware
- MUST use `paymentMiddleware` from `@x402/express` package
- MUST NOT implement custom 402 response handling

**FR-1.2**: Proper x402ResourceServer setup
- MUST use `x402ResourceServer` from `@x402/core/server`
- MUST use `HTTPFacilitatorClient` for facilitator communication
- MUST register EVM scheme using `registerExactEvmScheme` from `@x402/evm/exact/server`

**FR-1.3**: Route configuration format
- MUST use `"METHOD /path"` format for route keys (e.g., `"POST /audit/quick"`)
- MUST include `accepts` array with payment options
- Each accept option MUST include: `scheme`, `price`, `network`, `payTo`
- SHOULD include `description` and `mimeType` for resource metadata

**FR-1.4**: Payment configuration
- `network` MUST use CAIP-2 format (e.g., `eip155:8453` for Base mainnet)
- `payTo` MUST be a valid Ethereum address
- `price` SHOULD use human-readable format (e.g., `"$0.05"`)
- `scheme` MUST be `"exact"` for fixed-price payments

### FR-2: Client SDK x402 Compliance

**FR-2.1**: Use official `@x402/fetch` wrapper
- MUST use `wrapFetchWithPayment` from `@x402/fetch`
- MUST NOT manually construct payment headers

**FR-2.2**: Proper x402Client setup
- MUST use `x402Client` from `@x402/core/client`
- MUST register EVM scheme using `registerExactEvmScheme` from `@x402/evm/exact/client`
- MUST pass signer object from `privateKeyToAccount` (viem/accounts)

**FR-2.3**: Payment flow
- Client MUST handle 402 responses automatically via wrapped fetch
- MUST support automatic payment signing and submission
- SHOULD support retry logic for payment verification

### FR-3: Environment Configuration

**FR-3.1**: Required environment variables
- `X402_PAY_TO_ADDRESS`: Recipient wallet address
- `X402_NETWORK`: CAIP-2 network identifier
- `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`: For facilitator authentication (optional but recommended)

**FR-3.2**: Network configuration
- MUST default to Base mainnet (`eip155:8453`) for production
- SHOULD support Base Sepolia (`eip155:84532`) for testing
- MUST validate network format matches CAIP-2 spec

### FR-4: 402 Response Format Compliance

**FR-4.1**: Response headers
- MUST return HTTP 402 status for unpaid requests
- MUST include `x-payment-required` header (base64-encoded JSON)
- Header payload MUST include: `accepts`, `network`, `payTo`, `maxDeadlineSeconds`

**FR-4.2**: Response body
- SHOULD return JSON body with payment instructions
- SHOULD include human-readable error message

### FR-5: Asset Configuration

**FR-5.1**: USDC on Base
- MUST use USDC contract address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- MUST use 6 decimal precision for amounts
- Amount `50000` = $0.05, `150000` = $0.15, `500000` = $0.50

## Non-Functional Requirements

### NFR-1: Package Dependencies
- MUST use x402 V2 packages (`^2.0.0`):
  - `@x402/core`
  - `@x402/evm`
  - `@x402/express` (server)
  - `@x402/fetch` (client)
  - `@coinbase/x402` (facilitator config)

### NFR-2: Error Handling
- MUST gracefully handle facilitator communication failures
- MUST provide clear error messages for payment failures
- SHOULD log payment events for debugging

### NFR-3: Security
- Private keys MUST only be used client-side for signing
- Server MUST NOT store or access user private keys
- Facilitator credentials MUST be stored as environment variables

## Out of Scope

- Implementing new payment schemes beyond "exact"
- Supporting chains other than Base (mainnet/testnet)
- Custom facilitator implementations
- Payment refund mechanisms

### FR-6: Documentation Updates

**FR-6.1**: Update README after changes
- MUST update root README.md to reflect any implementation changes
- MUST update code examples if API usage patterns change
- SHOULD update docs/ files if significant changes are made

## Success Criteria

1. All x402 imports use official packages
2. Server returns valid 402 responses per protocol spec
3. Client SDK correctly handles payment flow
4. All environment variables are properly validated
5. Test examples demonstrate correct usage patterns
6. README and documentation updated to reflect any changes made
