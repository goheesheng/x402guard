/**
 * Ownership Proof Generator for x402scan Verification
 *
 * Generates EIP-712 signatures to prove domain ownership,
 * enabling "Verified" status on x402scan.com.
 */

import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

export interface OwnershipProof {
  origin: string;
  signature: string;
  address: string;
}

/**
 * Generate an ownership proof for x402scan verification
 *
 * Signs the origin URL using the payTo private key, proving
 * control of both the domain and payment address.
 *
 * @param origin - The origin URL to prove ownership of (e.g., "https://x402guard.xyz")
 * @param privateKey - The private key corresponding to the payTo address
 * @returns Ownership proof with signature and address
 */
export async function generateOwnershipProof(
  origin: string,
  privateKey: string
): Promise<OwnershipProof> {
  // Ensure private key has 0x prefix
  const formattedKey = privateKey.startsWith("0x")
    ? (privateKey as Hex)
    : (`0x${privateKey}` as Hex);

  // Create account from private key
  const account = privateKeyToAccount(formattedKey);

  // Sign the origin URL as a simple message
  // x402scan recovers the address from this signature
  const signature = await account.signMessage({
    message: origin,
  });

  return {
    origin,
    signature,
    address: account.address,
  };
}

/**
 * Cached ownership proof to avoid regenerating on every request
 */
let cachedProof: OwnershipProof | null = null;

/**
 * Get or generate ownership proof (cached)
 *
 * @param origin - The origin URL
 * @param privateKey - The private key
 * @returns Cached or newly generated ownership proof
 */
export async function getOwnershipProof(
  origin: string,
  privateKey: string
): Promise<OwnershipProof> {
  if (cachedProof && cachedProof.origin === origin) {
    return cachedProof;
  }

  cachedProof = await generateOwnershipProof(origin, privateKey);
  return cachedProof;
}
