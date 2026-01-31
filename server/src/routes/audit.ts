import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { AppError } from "../middleware/errorHandler.js";
import { auditSkill } from "../services/auditEngine/index.js";
import { config } from "../config/index.js";
import { createX402Middleware, getPricingInfo } from "../middleware/x402.js";
import type { AuditResponse } from "../types/api.js";

const router = Router();

// Request validation schema
const auditRequestSchema = z.object({
  skill_url: z.string().url().optional(),
  skill_content: z.string().max(config.MAX_SKILL_SIZE).optional(),
  tier: z.enum(["quick", "standard", "deep"]).default("quick"),
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

// Apply x402 payment middleware to the audit endpoint
router.use(createX402Middleware());

// GET /audit - Return pricing info
router.get("/audit", (_req: any, res: any) => {
  res.json({
    message: "SkillGuard Audit API",
    method: "POST",
    pricing: getPricingInfo(),
    payment: "x402 - Include X-Payment header with payment proof",
  });
});

// POST /audit - Run audit (protected by x402)
router.post("/audit", async (req: any, res: any, next: any) => {
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
    
    const { skill_url, skill_content, tier } = parseResult.data;
    
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
    
    // Send response
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
