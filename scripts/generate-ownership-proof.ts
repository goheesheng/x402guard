#!/usr/bin/env npx tsx
/**
 * Generate Ownership Proof for x402scan Verification
 *
 * Run this script LOCALLY on your secure machine (NOT on the server).
 * It will output the signature that you can safely deploy to your server.
 *
 * Usage:
 *   npx tsx scripts/generate-ownership-proof.ts <private-key>
 *
 * Example:
 *   npx tsx scripts/generate-ownership-proof.ts 0x1234...abcd
 *
 * The output signature can be set as OWNERSHIP_PROOF_SIGNATURE in your .env
 */

import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

const ORIGIN = "https://x402guard.xyz";

async function main() {
  const privateKey = process.argv[2];

  if (!privateKey) {
    console.error("Usage: npx tsx scripts/generate-ownership-proof.ts <private-key>");
    console.error("");
    console.error("Example:");
    console.error("  npx tsx scripts/generate-ownership-proof.ts 0x1234567890abcdef...");
    process.exit(1);
  }

  // Ensure private key has 0x prefix
  const formattedKey = privateKey.startsWith("0x")
    ? (privateKey as Hex)
    : (`0x${privateKey}` as Hex);

  try {
    // Create account from private key
    const account = privateKeyToAccount(formattedKey);

    console.log("=== x402scan Ownership Proof Generator ===\n");
    console.log(`Origin: ${ORIGIN}`);
    console.log(`Address: ${account.address}`);
    console.log("");

    // Sign the origin URL
    const signature = await account.signMessage({
      message: ORIGIN,
    });

    console.log("=== Generated Signature ===\n");
    console.log(signature);
    console.log("");
    console.log("=== Add to your server .env file ===\n");
    console.log(`OWNERSHIP_PROOF_SIGNATURE=${signature}`);
    console.log("");
    console.log("=== Verification ===\n");
    console.log("The signature proves ownership of:");
    console.log(`  - Origin: ${ORIGIN}`);
    console.log(`  - Address: ${account.address}`);
    console.log("");
    console.log("This signature is safe to deploy - it cannot be used to access your funds.");

  } catch (error) {
    console.error("Error generating signature:", error);
    process.exit(1);
  }
}

main();
