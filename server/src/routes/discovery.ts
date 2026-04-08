import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import { config } from "../config/index.js";
import { getOwnershipProof, type OwnershipProof } from "../utils/ownership-proof.js";

const router: RouterType = Router();

/**
 * x402 Discovery endpoint
 * See: https://github.com/Merit-Systems/x402scan/blob/main/docs/DISCOVERY.md
 */

function getOrigin(): string {
  return new URL(config.BASE_URL).origin;
}

function toUsdDisplay(atomic: number): string {
  return (atomic / 1_000_000).toFixed(2);
}

function buildBaseDiscoveryDocument() {
  const origin = getOrigin();
  const deepTierEnabled = Boolean(config.ATTESTATION_PRIVATE_KEY);

  const endpointRows = [
    `| \`/api/audit/quick\` | $${toUsdDisplay(config.PRICE_QUICK)} USDC | Pattern malware scan (YARA-style rules) |`,
    `| \`/api/audit/standard\` | $${toUsdDisplay(config.PRICE_STANDARD)} USDC | + Permission & network analysis |`,
  ];

  if (deepTierEnabled) {
    endpointRows.push(
      `| \`/api/audit/deep\` | $${toUsdDisplay(config.PRICE_DEEP)} USDC | + Behavioral sandbox & attestation |`
    );
  } else {
    endpointRows.push(
      "| `/api/audit/deep` | Unavailable | Attestation signing is not configured on this deployment |"
    );
  }

  const resources = [
    `${origin}/api/audit/quick`,
    `${origin}/api/audit/standard`,
    ...(deepTierEnabled ? [`${origin}/api/audit/deep`] : []),
  ];

  return {
    version: 1,
    resources,
    instructions: `# x402guard - Security Scanning for AI Agent Skills

Pre-install security auditing for AI agent skills powered by x402.

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
${endpointRows.join("\n")}

## Documentation

- **Skill Document**: ${origin}/api/skill.md
- **Skill Metadata**: ${origin}/api/skill.json
- **Health Check**: ${origin}/api/health

## Payment

- **Network**: ${config.X402_NETWORK}
- **Asset**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **PayTo**: ${config.X402_PAY_TO_ADDRESS}

## Usage

\`\`\`bash
curl -X POST ${origin}/api/audit/quick \\
  -H "Content-Type: application/json" \\
  -d '{"skill_url": "https://example.com/skill.md"}'
\`\`\`

For more information, visit ${origin}
`,
  };
}

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
  const origin = getOrigin();
  const doc: Record<string, unknown> = { ...buildBaseDiscoveryDocument() };

  // Option 1: Use pre-signed signature (RECOMMENDED - no private key on server)
  if (config.OWNERSHIP_PROOF_SIGNATURE) {
    doc.ownershipProofs = [{
      origin,
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
          origin,
          config.OWNERSHIP_PROOF_PRIVATE_KEY
        );
        console.log(`[discovery] Generated ownership proof for ${origin}`);
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
    res.json(buildBaseDiscoveryDocument());
  }
});

export default router;
