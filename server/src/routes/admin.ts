/**
 * Admin API Routes
 *
 * Protected endpoints for managing whitelist subscriptions.
 * Requires x-admin-api-key header for authentication.
 */

import { Router, Request, Response, NextFunction } from "express";
import type { Router as RouterType } from "express";
import { timingSafeEqual } from "crypto";
import { config } from "../config/index.js";
import { getWhitelistManager } from "../services/whitelistManager.js";
import type { WhitelistPlanType } from "../types/whitelist.js";
import { WHITELIST_PRICING } from "../types/whitelist.js";

const router: RouterType = Router();

/**
 * Admin authentication middleware
 */
function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers["x-admin-api-key"] as string | undefined;

  // Also allow internal ACP calls authenticated via shared secret (timing-safe)
  const acpSecret = req.headers["x-acp-secret"] as string | undefined;
  const expectedSecret = config.ACP_INTERNAL_SECRET;
  const isInternalAcp = !!(acpSecret && expectedSecret && acpSecret.length > 0 && expectedSecret.length > 0 &&
    acpSecret.length === expectedSecret.length &&
    timingSafeEqual(Buffer.from(acpSecret), Buffer.from(expectedSecret)));

  if (!config.ADMIN_API_KEY && !isInternalAcp) {
    res.status(503).json({
      error: "Admin API not configured",
      message: "ADMIN_API_KEY environment variable is not set",
    });
    return;
  }

  if (!apiKey && !isInternalAcp) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing x-admin-api-key header",
    });
    return;
  }

  if (!isInternalAcp && apiKey !== config.ADMIN_API_KEY) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid admin API key",
    });
    return;
  }

  next();
}

// Apply admin auth to all routes
router.use(requireAdminAuth);

/**
 * GET /api/admin/whitelist
 * List all whitelist entries
 */
router.get("/whitelist", (_req: Request, res: Response) => {
  const manager = getWhitelistManager();
  const entries = manager.listAll();
  const stats = manager.getStats();

  res.json({
    entries,
    stats,
    pricing: WHITELIST_PRICING,
  });
});

/**
 * GET /api/admin/whitelist/stats
 * Get whitelist statistics
 */
router.get("/whitelist/stats", (_req: Request, res: Response) => {
  const manager = getWhitelistManager();
  const stats = manager.getStats();

  res.json(stats);
});

/**
 * GET /api/admin/whitelist/:walletAddress
 * Get specific wallet whitelist status
 */
router.get("/whitelist/:walletAddress", (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const manager = getWhitelistManager();
  const entry = manager.getEntry(walletAddress);

  if (!entry) {
    res.status(404).json({
      error: "Not found",
      message: "Wallet is not whitelisted",
      walletAddress,
    });
    return;
  }

  const isActive = new Date() < new Date(entry.expiresAt);

  res.json({
    ...entry,
    isActive,
  });
});

/**
 * POST /api/admin/whitelist
 * Add a wallet to the whitelist
 *
 * Body: { walletAddress: string, planType: 'monthly' | 'annual', notes?: string }
 */
router.post("/whitelist", (req: Request, res: Response) => {
  const { walletAddress, planType, notes } = req.body;

  if (!walletAddress || typeof walletAddress !== "string") {
    res.status(400).json({
      error: "Bad request",
      message: "walletAddress is required",
    });
    return;
  }

  if (!planType || !["monthly", "annual"].includes(planType)) {
    res.status(400).json({
      error: "Bad request",
      message: "planType must be 'monthly' or 'annual'",
    });
    return;
  }

  try {
    const manager = getWhitelistManager();

    // Check if already whitelisted
    const existing = manager.getEntry(walletAddress);
    if (existing && new Date() < new Date(existing.expiresAt)) {
      // Extend existing subscription
      const extended = manager.extendSubscription(
        walletAddress,
        planType as WhitelistPlanType
      );
      res.json({
        message: "Subscription extended",
        entry: extended,
        action: "extended",
      });
      return;
    }

    // Add new entry
    const acpSecretHeader = req.headers["x-acp-secret"] as string | undefined;
    const expectedAcp = config.ACP_INTERNAL_SECRET;
    const isAcp = !!(acpSecretHeader && expectedAcp && acpSecretHeader.length > 0 && expectedAcp.length > 0 &&
      acpSecretHeader.length === expectedAcp.length &&
      timingSafeEqual(Buffer.from(acpSecretHeader), Buffer.from(expectedAcp)));
    const createdBy = isAcp ? "acp" : "admin";
    const entry = manager.addWallet(
      walletAddress,
      planType as WhitelistPlanType,
      createdBy,
      notes
    );

    res.status(201).json({
      message: "Wallet added to whitelist",
      entry,
      action: "created",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add wallet";
    res.status(400).json({
      error: "Bad request",
      message,
    });
  }
});

/**
 * DELETE /api/admin/whitelist/:walletAddress
 * Remove a wallet from the whitelist
 */
router.delete("/whitelist/:walletAddress", (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const manager = getWhitelistManager();
  const removed = manager.removeWallet(walletAddress);

  if (!removed) {
    res.status(404).json({
      error: "Not found",
      message: "Wallet was not in whitelist",
      walletAddress,
    });
    return;
  }

  res.json({
    message: "Wallet removed from whitelist",
    walletAddress,
  });
});

/**
 * PATCH /api/admin/whitelist/:walletAddress/extend
 * Extend a wallet's subscription
 *
 * Body: { planType: 'monthly' | 'annual' }
 */
router.patch(
  "/whitelist/:walletAddress/extend",
  (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    const { planType } = req.body;

    if (!planType || !["monthly", "annual"].includes(planType)) {
      res.status(400).json({
        error: "Bad request",
        message: "planType must be 'monthly' or 'annual'",
      });
      return;
    }

    try {
      const manager = getWhitelistManager();
      const entry = manager.extendSubscription(
        walletAddress,
        planType as WhitelistPlanType
      );

      res.json({
        message: "Subscription extended",
        entry,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to extend subscription";
      res.status(404).json({
        error: "Not found",
        message,
      });
    }
  }
);

export default router;
