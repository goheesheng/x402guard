import { privateKeyToAccount } from "viem/accounts";
import { verifyTypedData } from "viem";
import type { Hex, Address } from "viem";
import type { AuditResponse } from "../types/api.js";

// EIP-712 Domain
export const ATTESTATION_DOMAIN = {
  name: "x402guard",
  version: "1",
  chainId: 8453, // Base mainnet
} as const;

// EIP-712 Types
export const ATTESTATION_TYPES = {
  Attestation: [
    { name: "audit_id", type: "string" },
    { name: "skill_url", type: "string" },
    { name: "risk_score", type: "uint8" },
    { name: "risk_level", type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

export interface AttestationMessage {
  audit_id: string;
  skill_url: string;
  risk_score: number;
  risk_level: string;
  timestamp: number;
}

export interface Attestation {
  message: AttestationMessage;
  signature: string | null;
  signer: string | null;
  domain: {
    name: string;
    version: string;
    chainId: number;
  };
  warning?: string;
}

export interface VerificationResult {
  valid: boolean;
  signer: string | null;
  expectedSigner: string | null;
  matches: boolean;
  error?: string;
}

/**
 * Sign an audit result using EIP-712 typed data
 */
export async function signAttestation(
  auditResult: AuditResponse,
  skillUrl: string,
  privateKey: string | undefined
): Promise<Attestation> {
  const message: AttestationMessage = {
    audit_id: auditResult.audit_id,
    skill_url: skillUrl,
    risk_score: auditResult.risk_score,
    risk_level: auditResult.risk_level,
    timestamp: Math.floor(Date.now() / 1000),
  };

  // If no private key, return unsigned attestation
  if (!privateKey) {
    return {
      message,
      signature: null,
      signer: null,
      domain: ATTESTATION_DOMAIN,
      warning: "Attestation signing not configured. Set ATTESTATION_PRIVATE_KEY to enable.",
    };
  }

  try {
    // Ensure key is properly formatted
    const formattedKey = privateKey.startsWith("0x")
      ? (privateKey as Hex)
      : (`0x${privateKey}` as Hex);

    const account = privateKeyToAccount(formattedKey);

    // Sign using EIP-712
    const signature = await account.signTypedData({
      domain: ATTESTATION_DOMAIN,
      types: ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: {
        audit_id: message.audit_id,
        skill_url: message.skill_url,
        risk_score: message.risk_score,
        risk_level: message.risk_level,
        timestamp: BigInt(message.timestamp),
      },
    });

    return {
      message,
      signature,
      signer: account.address,
      domain: ATTESTATION_DOMAIN,
    };
  } catch (error) {
    console.error("[Attestation] Signing error:", error);
    return {
      message,
      signature: null,
      signer: null,
      domain: ATTESTATION_DOMAIN,
      warning: `Signing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Verify an attestation signature
 */
export async function verifyAttestation(
  attestation: Attestation,
  expectedSigner?: string
): Promise<VerificationResult> {
  // Can't verify without signature
  if (!attestation.signature) {
    return {
      valid: false,
      signer: null,
      expectedSigner: expectedSigner || null,
      matches: false,
      error: "No signature provided",
    };
  }

  try {
    // Verify and recover signer
    const isValid = await verifyTypedData({
      address: attestation.signer as Address,
      domain: ATTESTATION_DOMAIN,
      types: ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: {
        audit_id: attestation.message.audit_id,
        skill_url: attestation.message.skill_url,
        risk_score: attestation.message.risk_score,
        risk_level: attestation.message.risk_level,
        timestamp: BigInt(attestation.message.timestamp),
      },
      signature: attestation.signature as Hex,
    });

    const matches = expectedSigner
      ? attestation.signer?.toLowerCase() === expectedSigner.toLowerCase()
      : true;

    return {
      valid: isValid,
      signer: attestation.signer,
      expectedSigner: expectedSigner || null,
      matches: isValid && matches,
    };
  } catch (error) {
    return {
      valid: false,
      signer: null,
      expectedSigner: expectedSigner || null,
      matches: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Get the signer address from a private key (for logging on startup)
 */
export function getSignerAddress(privateKey: string | undefined): string | null {
  if (!privateKey) return null;

  try {
    const formattedKey = privateKey.startsWith("0x")
      ? (privateKey as Hex)
      : (`0x${privateKey}` as Hex);
    const account = privateKeyToAccount(formattedKey);
    return account.address;
  } catch {
    return null;
  }
}
