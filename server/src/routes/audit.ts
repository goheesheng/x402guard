import { Router } from "express";
import type { Router as RouterType } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { AppError } from "../middleware/errorHandler.js";
import { auditSkill } from "../services/auditEngine/index.js";
import { config } from "../config/index.js";
import { createX402Middleware, getPricingInfo } from "../middleware/x402.js";
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
  if (!url.startsWith("https://")) {
    throw new AppError("Only HTTPS URLs are allowed", "INVALID_URL", 400);
  }

  const fetchResult: any = await fetch(url, {
    headers: { "User-Agent": "SkillGuard/0.1" },
  });

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

    // Add attestation for deep tier
    if (tier === "deep") {
      response.attestation = {
        signature: `0x${Buffer.from(JSON.stringify({ audit_id: response.audit_id, risk_score: response.risk_score })).toString('hex').slice(0, 128)}`,
        signer: config.X402_PAY_TO_ADDRESS,
        chain: config.X402_NETWORK,
      };
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
    message: "SkillGuard Audit API",
    method: "POST",
    pricing: getPricingInfo(),
    payment: "x402 - Include X-Payment header with payment proof",
    endpoints: {
      "/audit/quick": "$0.05 - YARA malware scan",
      "/audit/standard": "$0.15 - Full analysis + permissions + network",
      "/audit/deep": "$0.50 - Complete audit + behavioral sandbox",
    },
  });
});

// POST /audit/quick - Quick audit ($0.05)
router.post("/audit/quick", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "quick");
});

// POST /audit/standard - Standard audit ($0.15)
router.post("/audit/standard", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "standard");
});

// POST /audit/deep - Deep audit ($0.50)
router.post("/audit/deep", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "deep");
});

// POST /audit - Default to quick tier (for backward compatibility)
router.post("/audit", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "quick");
});

export default router;
