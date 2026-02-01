import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SKILL_METADATA } from "../content/skill-metadata.js";

const router: RouterType = Router();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to SKILL.md content
const SKILL_MD_PATH = join(__dirname, "../content/skill.md");

// Cache the skill content
let skillContent: string | null = null;

function getSkillContent(): string {
  if (!skillContent) {
    try {
      skillContent = readFileSync(SKILL_MD_PATH, "utf-8");
    } catch (error) {
      // Fallback content if file not found
      skillContent = `---
name: x402guard
description: Pre-install security scanning for AI agent skills
version: 1.0.0
---

# x402guard

Security scanning for AI agent skills. Visit https://x402guard.xyz for documentation.
`;
    }
  }
  return skillContent;
}

// GET /skill.md - Return SKILL.md as markdown
router.get("/skill.md", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.send(getSkillContent());
});

// GET /skill.json - Return structured metadata as JSON
router.get("/skill.json", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json(SKILL_METADATA);
});

// GET /skills/x402guard.md - Alternative path (ClawHub style)
router.get("/skills/x402guard.md", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.send(getSkillContent());
});

// GET /skills/x402guard.json - Alternative path for JSON
router.get("/skills/x402guard.json", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json(SKILL_METADATA);
});

export default router;
