import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import { config } from "../config/index.js";
import { getOwnershipProof, type OwnershipProof } from "../utils/ownership-proof.js";

const router: RouterType = Router();

/**
 * x402 Discovery endpoint
 * See: https://github.com/Merit-Systems/x402scan/blob/main/docs/DISCOVERY.md
 */

const ORIGIN = "https://x402guard.xyz";

const BASE_DISCOVERY_DOCUMENT = {
  version: 1,
  resources: [
    "https://x402guard.xyz/api/audit/quick",
    "https://x402guard.xyz/api/audit/standard",
    "https://x402guard.xyz/api/audit/deep",
  ],
  instructions: `# x402guard - Security Scanning for AI Agent Skills

Pre-install security auditing for AI agent skills powered by x402.

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| \`/api/audit/quick\` | $0.01 USDC | Pattern malware scan (YARA-style rules) |
| \`/api/audit/standard\` | $0.05 USDC | + Permission & network analysis |
| \`/api/audit/deep\` | $0.10 USDC | + Behavioral sandbox & attestation |

## Documentation

- **Skill Document**: https://x402guard.xyz/api/skill.md
- **Skill Metadata**: https://x402guard.xyz/api/skill.json
- **Health Check**: https://x402guard.xyz/api/health

## Payment

- **Network**: Base Mainnet (eip155:8453)
- **Asset**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **PayTo**: 0x93A0baf7295d99b143cFDc480f4Cc879Cbe1B52c

## Usage

\`\`\`bash
curl -X POST https://x402guard.xyz/api/audit/quick \\
  -H "Content-Type: application/json" \\
  -d '{"skill_url": "https://example.com/skill.md"}'
\`\`\`

For more information, visit https://x402guard.xyz
`,
};

// Cached ownership proof
let cachedOwnershipProof: OwnershipProof | null = null;

/**
 * Build discovery document with optional ownership proofs
 *
 * Supports two modes:
 * 1. Pre-signed signature (RECOMMENDED): Set OWNERSHIP_PROOF_SIGNATURE
 * 2. Runtime signing: Set OWNERSHIP_PROOF_PRIVATE_KEY (not recommended for security)
 */
async function buildDiscoveryDocument(): Promise<Record<string, unknown>> {
  const doc: Record<string, unknown> = { ...BASE_DISCOVERY_DOCUMENT };

  // Option 1: Use pre-signed signature (RECOMMENDED - no private key on server)
  if (config.OWNERSHIP_PROOF_SIGNATURE) {
    doc.ownershipProofs = [{
      origin: ORIGIN,
      signature: config.OWNERSHIP_PROOF_SIGNATURE,
      address: config.X402_PAY_TO_ADDRESS,
    }];
    return doc;
  }

  // Option 2: Generate signature at runtime (NOT recommended for servers running untrusted code)
  if (config.OWNERSHIP_PROOF_PRIVATE_KEY) {
    try {
      if (!cachedOwnershipProof) {
        cachedOwnershipProof = await getOwnershipProof(
          ORIGIN,
          config.OWNERSHIP_PROOF_PRIVATE_KEY
        );
        console.log(`[discovery] Generated ownership proof for ${ORIGIN}`);
      }

      doc.ownershipProofs = [cachedOwnershipProof];
    } catch (error) {
      console.warn("[discovery] Failed to generate ownership proof:", error);
      // Continue without ownership proofs
    }
  }

  return doc;
}

// GET /.well-known/x402
router.get("/.well-known/x402", async (_req: Request, res: Response) => {
  try {
    const discoveryDoc = await buildDiscoveryDocument();

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json(discoveryDoc);
  } catch (error) {
    console.error("[discovery] Error building discovery document:", error);
    // Fall back to base document without proofs
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json(BASE_DISCOVERY_DOCUMENT);
  }
});

export default router;
