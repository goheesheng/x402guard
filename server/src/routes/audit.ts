import { Router } from "express";
import type { Router as RouterType } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { timingSafeEqual } from "crypto";
import { AppError } from "../middleware/errorHandler.js";
import { auditSkill } from "../services/auditEngine/index.js";
import { config } from "../config/index.js";
import { createX402Middleware, getPricingInfo } from "../middleware/x402.js";
import { whitelistMiddleware } from "../middleware/whitelist.js";
import { signAttestation } from "../utils/attestation.js";
import { checkScanCache, storeScanInCache, getContentHash } from "../services/scanCache.js";
import { recommendationToGateDecision } from "../types/api.js";
import type { AuditResponse, AuditTier } from "../types/api.js";
import { resolve4 } from "dns/promises";

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

// SSRF protection: block private/reserved IP ranges
function isPrivateIP(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0
    if (parts.every(p => p === 0)) return true;
  }
  // IPv6 loopback and private
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

// Fetch skill from URL with SSRF protection
async function fetchSkillContent(url: string): Promise<string> {
  if (!url.startsWith("https://")) {
    throw new AppError("Only HTTPS URLs are allowed", "INVALID_URL", 400);
  }

  // Resolve hostname and check for private IPs before fetching
  const { hostname } = new URL(url);
  try {
    const addresses = await resolve4(hostname);
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        throw new AppError("URL resolves to a private IP address", "SSRF_BLOCKED", 403);
      }
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`DNS resolution failed for ${hostname}`, "DNS_ERROR", 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const fetchResult: any = await fetch(url, {
      headers: { "User-Agent": "x402guard/1.0" },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!fetchResult.ok) {
      throw new AppError(`Failed to fetch skill: ${fetchResult.status}`, "FETCH_ERROR", 400);
    }

    // Check redirect chain (fetch follows redirects automatically, check final URL)
    const finalUrl = fetchResult.url;
    if (finalUrl !== url) {
      const { hostname: finalHost } = new URL(finalUrl);
      const finalAddrs = await resolve4(finalHost);
      for (const addr of finalAddrs) {
        if (isPrivateIP(addr)) {
          throw new AppError("Redirect target resolves to a private IP address", "SSRF_BLOCKED", 403);
        }
      }
    }

    const content = await fetchResult.text();

    if (content.length > config.MAX_SKILL_SIZE) {
      throw new AppError("Skill content exceeds maximum size", "SKILL_TOO_LARGE", 413);
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

// Helper function to run audit and build response
async function runAuditHandler(req: any, res: any, next: any, tier: AuditTier) {
  const scanStart = Date.now();
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

    const contentHash = getContentHash(content);

    // Run audit
    const auditResult = await auditSkill(content, tier);

    // Build response
    const response: AuditResponse = {
      ...auditResult,
      gate_decision: recommendationToGateDecision(auditResult.recommendation),
      audit_id: nanoid(12),
      timestamp: new Date().toISOString(),
      tier,
    };

    // Sign EIP-712 attestation for ALL tiers
    const skillUrl = skill_url || "inline-content";
    response.attestation = await signAttestation(
      response,
      skillUrl,
      config.ATTESTATION_PRIVATE_KEY
    );

    // Cache the scan result for future free cache hits
    await storeScanInCache(content, tier, {
      riskScore: auditResult.risk_score,
      riskLevel: auditResult.risk_level,
      recommendation: auditResult.recommendation,
      findings: auditResult.findings,
    });

    // Structured scan logging
    console.log(JSON.stringify({
      event: "scan_complete",
      tier,
      content_hash: contentHash,
      cache_hit: false,
      risk_score: response.risk_score,
      risk_level: response.risk_level,
      gate_decision: response.gate_decision,
      findings_count: response.findings.malware.length + response.findings.credentials.length + response.findings.network.length + response.findings.permissions.length,
      attestation_signed: !!response.attestation?.signature,
      duration_ms: Date.now() - scanStart,
      audit_id: response.audit_id,
    }));

    // Send response
    res.json(response);
  } catch (error) {
    next(error);
  }
}

// Free cache hit check (skill_content only, before payment)
// If the exact content was scanned recently, return the cached result for free.
// skill_url cache is checked AFTER payment to avoid free SSRF probing.
router.use(async (req: any, res: any, next: any) => {
  try {
  if (req.method !== "POST") return next();
  const { skill_content } = req.body || {};
  if (!skill_content) return next();

  // Determine tier from URL path
  const tierMatch = req.path.match(/\/audit\/(quick|standard|deep)/);
  const tier = (tierMatch?.[1] || "quick") as AuditTier;

  const cached = await checkScanCache(skill_content, tier);
  if (cached) {
    // Re-sign attestation with fresh timestamp and new audit_id
    const auditId = nanoid(12);
    const response: AuditResponse = {
      risk_score: cached.riskScore,
      risk_level: cached.riskLevel,
      recommendation: cached.recommendation,
      gate_decision: recommendationToGateDecision(cached.recommendation),
      findings: cached.findings,
      audit_id: auditId,
      timestamp: new Date().toISOString(),
      tier,
    };
    response.attestation = await signAttestation(response, "cached", config.ATTESTATION_PRIVATE_KEY);
    return res.json(response);
  }
  next();
  } catch (error) {
    next(error);
  }
});

// Apply whitelist check (for subscription users)
router.use(whitelistMiddleware);

// Bypass x402 payment for internal ACP calls (authenticated via shared secret)
router.use((req: any, res: any, next: any) => {
  const acpSecret = req.headers["x-acp-secret"] as string | undefined;
  const expected = config.ACP_INTERNAL_SECRET;
  if (acpSecret && expected && acpSecret.length > 0 && expected.length > 0 &&
      acpSecret.length === expected.length &&
      timingSafeEqual(Buffer.from(acpSecret), Buffer.from(expected))) {
    req.skipPayment = true;
  }
  next();
});

// Apply x402 payment middleware
router.use((req: any, res: any, next: any) => {
  if (req.skipPayment) {
    return next();
  }
  return createX402Middleware()(req, res, next);
});

// GET /audit - Return pricing info (free)
router.get("/audit", (_req: any, res: any) => {
  res.json({
    message: "x402guard Audit API",
    method: "POST",
    pricing: getPricingInfo(),
    payment: "x402 - Include X-Payment header with payment proof",
    endpoints: {
      "/audit/quick": "$0.10 - YARA malware scan",
      "/audit/standard": "$0.50 - Full analysis + permissions + network",
      "/audit/deep": "$1.00 - Complete audit + behavioral sandbox",
    },
    whitelist: {
      description: "Whitelisted wallets can bypass x402 payment with EIP-712 signature (valid until subscription expires)",
      headers: ["x-wallet-address", "x-wallet-signature", "x-expires-at"],
      sign_at: "https://x402guard.xyz/whitelist",
    },
  });
});

// POST /audit/quick - Quick audit ($0.10)
router.post("/audit/quick", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "quick");
});

// POST /audit/standard - Standard audit ($0.50)
router.post("/audit/standard", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "standard");
});

// POST /audit/deep - Deep audit ($1.00)
router.post("/audit/deep", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "deep");
});

// POST /audit - Default to quick tier (for backward compatibility)
router.post("/audit", (req: any, res: any, next: any) => {
  runAuditHandler(req, res, next, "quick");
});

export default router;
