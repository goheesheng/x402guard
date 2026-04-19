import { Router } from "express";
import type { Router as RouterType } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { verifyAttestation, type Attestation } from "../utils/attestation.js";

const router: RouterType = Router();

// Request validation schema
const verifyRequestSchema = z.object({
  message: z.object({
    audit_id: z.string(),
    skill_url: z.string(),
    risk_score: z.number(),
    risk_level: z.string(),
    timestamp: z.number(),
  }),
  signature: z.string().nullable(),
  signer: z.string().nullable(),
  domain: z.object({
    name: z.string(),
    version: z.string(),
    chainId: z.number(),
  }),
  warning: z.string().optional(),
});

// POST /verify - Verify an attestation signature (free)
router.post("/verify", async (req: any, res: any, next: any) => {
  try {
    // Validate request
    const parseResult = verifyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        parseResult.error.issues[0].message,
        "VALIDATION_ERROR",
        400
      );
    }

    const attestation = parseResult.data as Attestation;

    // Optional: expected signer from query param
    const expectedSigner = req.query.expected_signer as string | undefined;

    // Verify the attestation
    const result = await verifyAttestation(attestation, expectedSigner);

    res.json({
      verification: result,
      attestation: {
        audit_id: attestation.message.audit_id,
        skill_url: attestation.message.skill_url,
        risk_score: attestation.message.risk_score,
        risk_level: attestation.message.risk_level,
        timestamp: attestation.message.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /verify - Return API info
router.get("/verify", (_req: any, res: any) => {
  res.json({
    message: "x402guard Attestation Verification API",
    method: "POST",
    description: "Verify EIP-712 signed attestations from all scan tiers",
    request: {
      body: "Attestation object from deep scan response",
      query: {
        expected_signer: "(optional) Address to verify against",
      },
    },
    response: {
      verification: {
        valid: "boolean - signature is cryptographically valid",
        signer: "string - recovered signer address",
        expectedSigner: "string | null - expected signer if provided",
        matches: "boolean - signer matches expected (if provided)",
        error: "string | undefined - error message if verification failed",
      },
    },
  });
});

export default router;
