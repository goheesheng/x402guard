import { Router } from "express";
import type { Router as RouterType } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { AppError } from "../middleware/errorHandler.js";
import { auditSkill } from "../services/auditEngine/index.js";
import { config } from "../config/index.js";
import { createX402Middleware, getPricingInfo } from "../middleware/x402.js";
import { signAttestation } from "../utils/attestation.js";
import { assertSafeOutboundUrl, getSecureFetchOptions } from "../utils/urlSecurity.js";
import type { AuditResponse, AuditTier } from "../types/api.js";

const router: RouterType = Router();

// Request validation schema
const auditRequestSchema = z.object({
  skill_url: z.string().url().optional(),
  skill_content: z.string().max(config.MAX_SKILL_SIZE).optional(),
  format: z.enum(["json", "markdown"]).default("json"),
}).refine(
  (data) => data.skill_url || data.skill_content,
  { message: "Either skill_url or skill_content is required" }
);

// Fetch skill from URL
async function fetchSkillContent(url: string): Promise<string> {
  let safeUrl: URL;
  try {
    safeUrl = await assertSafeOutboundUrl(url);
  } catch (error) {
    throw new AppError(
      (error as Error).message || "Invalid URL",
      "INVALID_URL",
      400
    );
  }

  let fetchResult: any;
  try {
    fetchResult = await fetch(
      safeUrl.toString(),
      getSecureFetchOptions("x402guard/0.1")
    );
  } catch (error) {
    throw new AppError(
      `Failed to fetch skill: ${(error as Error).message}`,
      "FETCH_ERROR",
      400
    );
  }

  if (!fetchResult.ok) {
    throw new AppError(`Failed to fetch skill: ${fetchResult.status}`, "FETCH_ERROR", 400);
  }

  const content = await fetchResult.text();

  if (content.length > config.MAX_SKILL_SIZE) {
    throw new AppError("Skill content exceeds maximum size", "SKILL_TOO_LARGE", 413);
  }

  return content;
}

// Helper function to run audit and build response
async function runAuditHandler(req: any, res: any, next: any, tier: AuditTier) {
  try {
    // Validate request
    const parseResult = auditRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        parseResult.error.issues[0].message,
        "VALIDATION_ERROR",
        400
      );
    }

    const { skill_url, skill_content } = parseResult.data;

    // Get skill content
    let content: string;
    if (skill_content) {
      content = skill_content;
    } else if (skill_url) {
      content = await fetchSkillContent(skill_url);
    } else {
      throw new AppError("No skill content provided", "MISSING_CONTENT", 400);
    }

    // Run audit
    const auditResult = await auditSkill(content, tier);

    // Build response
    const response: AuditResponse = {
      ...auditResult,
      audit_id: nanoid(12),
      timestamp: new Date().toISOString(),
      tier,
    };

    // Add EIP-712 signed attestation for deep tier
    if (tier === "deep") {
      if (!config.ATTESTATION_PRIVATE_KEY) {
        throw new AppError(
          "Deep audit requires ATTESTATION_PRIVATE_KEY for signed attestations",
          "ATTESTATION_NOT_CONFIGURED",
          503
        );
      }

      const skillUrl = skill_url || "inline-content";
      response.attestation = await signAttestation(
        response,
        skillUrl,
        config.ATTESTATION_PRIVATE_KEY
      );

      if (!response.attestation.signature || !response.attestation.signer) {
        throw new AppError(
          "Failed to generate signed attestation",
          "ATTESTATION_SIGNING_FAILED",
          503,
          response.attestation.warning
        );
      }
    }

    // Send response
    res.json(response);
  } catch (error) {
    next(error);
  }
}

// Apply x402 payment middleware to the audit endpoints
router.use(createX402Middleware());

// GET /audit - Return pricing info (free)
router.get("/audit", (_req: any, res: any) => {
  res.json({
    message: "x402guard Audit API",
    method: "POST",
    pricing: getPricingInfo(),
    payment: "x402 - Include X-Payment header with payment proof",
    endpoints: {
      "/audit/quick": "$0.01 - Pattern malware scan (YARA-style rules)",
      "/audit/standard": "$0.05 - Full analysis + permissions + network",
      "/audit/deep": "$0.10 - Complete audit + behavioral sandbox",
    },
  });
});

// POST /audit/quick - Quick audit ($0.01)
router.post("/audit/quick", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "quick");
});

// POST /audit/standard - Standard audit ($0.05)
router.post("/audit/standard", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "standard");
});

// POST /audit/deep - Deep audit ($0.10)
router.post("/audit/deep", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "deep");
});

// POST /audit - Default to quick tier (for backward compatibility)
router.post("/audit", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "quick");
});

export default router;
