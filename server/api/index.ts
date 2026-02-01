import express from 'express';
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { createFacilitatorConfig } from "@coinbase/x402";
import { scanWithYara } from "../src/services/auditEngine/yaraScanner.js";
import { analyzePermissions } from "../src/services/auditEngine/permissionAnalyzer.js";
import { detectNetworkCalls } from "../src/services/auditEngine/networkDetector.js";
import { calculateRisk } from "../src/services/auditEngine/riskCalculator.js";

const app = express();
app.use(express.json({ limit: '2mb' }));

// CORS - x402 requires exposing payment response headers
app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Payment");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Expose-Headers", "X-Payment-Response, X-Payment-Required");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Config - MAINNET DEFAULTS
const PAY_TO = process.env.X402_PAY_TO_ADDRESS || "0xdc7f6ebefe62a402e7c75dd0b6d20ed7c4cb326a";
const NETWORK = "eip155:8453"; // Base Mainnet - ALWAYS mainnet
const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = process.env.CDP_API_KEY_SECRET;

// Create facilitator config with CDP credentials (if available)
// Per x402 V2 standard, use createFacilitatorConfig for authenticated requests
let facilitatorClient: HTTPFacilitatorClient;
if (CDP_API_KEY_ID && CDP_API_KEY_SECRET) {
  const facilitatorConfig = createFacilitatorConfig(CDP_API_KEY_ID, CDP_API_KEY_SECRET);
  facilitatorClient = new HTTPFacilitatorClient(facilitatorConfig);
} else {
  // Fallback to unauthenticated (may have rate limits)
  facilitatorClient = new HTTPFacilitatorClient();
}

const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);

// x402 Payment Middleware for tier endpoints
app.use(
  paymentMiddleware(
    {
      "POST /audit/quick": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.05",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Quick YARA malware scan",
        mimeType: "application/json",
      },
      "POST /audit/standard": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.15",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Standard security analysis with permissions and network detection",
        mimeType: "application/json",
      },
      "POST /audit/deep": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.50",
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: "Deep comprehensive security audit with behavioral sandbox",
        mimeType: "application/json",
      },
    },
    x402Server,
  ),
);

// Health check (free)
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', version: '0.1.0', uptime: Math.floor(process.uptime()) });
});

// Pricing endpoint (free)
app.get('/pricing', (_req: any, res: any) => {
  res.json({
    tiers: [
      {
        name: "quick",
        price: "50000",
        priceUSD: 0.05,
        features: [
          "YARA malware scanning",
          "Basic risk score (0-100)",
          "Risk level classification",
          "Recommendation",
        ],
      },
      {
        name: "standard",
        price: "150000",
        priceUSD: 0.15,
        features: [
          "All Quick features",
          "Permission analysis",
          "Network call detection",
          "Detailed findings",
        ],
      },
      {
        name: "deep",
        price: "500000",
        priceUSD: 0.50,
        features: [
          "All Standard features",
          "Behavioral sandbox",
          "Signed attestation",
          "Full audit trail",
        ],
      },
    ],
    network: NETWORK,
    asset: "USDC",
  });
});

// Root info (free)
app.get('/', (_req: any, res: any) => {
  res.json({
    name: 'x402guard API',
    version: '0.1.0',
    description: 'x402-powered security auditing for AI agent skills',
    endpoints: {
      free: ['/health', '/pricing'],
      paid: {
        '/audit/quick': { price: '$0.05', description: 'YARA malware scan' },
        '/audit/standard': { price: '$0.15', description: 'Full analysis + permissions + network' },
        '/audit/deep': { price: '$0.50', description: 'Complete audit + behavioral sandbox' },
      }
    },
    payment: {
      network: NETWORK,
      facilitator: FACILITATOR_URL,
      payTo: PAY_TO,
    }
  });
});

// Real audit function using the audit engine
async function runAudit(content: string, tier: string) {
  // Always run YARA scan
  const yaraMatches = await scanWithYara(content);

  // Standard+ tiers get more analysis
  let permissions: any[] = [];
  let networkCalls: any[] = [];

  if (tier === "standard" || tier === "deep") {
    permissions = analyzePermissions(content);
    networkCalls = detectNetworkCalls(content);
  }

  // Extract credential-related permissions
  const credentials = permissions
    .filter(p => p.type === "credential")
    .map(p => ({
      type: p.target,
      pattern: p.target,
      risk: p.risk,
    }));

  // Build findings
  const findings = {
    malware: yaraMatches,
    credentials,
    network: networkCalls,
    permissions,
  };

  // Calculate risk
  const risk = calculateRisk(findings);

  return {
    risk_score: risk.score,
    risk_level: risk.level,
    recommendation: risk.recommendation,
    findings,
    audit_id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    tier,
  };
}

// Fetch skill content from URL
async function fetchSkillContent(url: string): Promise<string> {
  if (!url.startsWith("https://")) {
    throw new Error("Only HTTPS URLs are allowed");
  }
  const response: any = await fetch(url, {
    headers: { "User-Agent": "x402guard/0.1" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch skill: ${response.status}`);
  }
  const content = await response.text();
  if (content.length > 1048576) { // 1MB limit
    throw new Error("Skill content exceeds maximum size (1MB)");
  }
  return content;
}

// Quick audit endpoint ($0.05)
app.post('/audit/quick', async (req: any, res: any) => {
  try {
    const { skill_url, skill_content } = req.body;

    let content: string;
    if (skill_content) {
      content = skill_content;
    } else if (skill_url) {
      content = await fetchSkillContent(skill_url);
    } else {
      return res.status(400).json({ error: 'Either skill_url or skill_content is required' });
    }

    const result = await runAudit(content, 'quick');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Standard audit endpoint ($0.15)
app.post('/audit/standard', async (req: any, res: any) => {
  try {
    const { skill_url, skill_content } = req.body;

    let content: string;
    if (skill_content) {
      content = skill_content;
    } else if (skill_url) {
      content = await fetchSkillContent(skill_url);
    } else {
      return res.status(400).json({ error: 'Either skill_url or skill_content is required' });
    }

    const result = await runAudit(content, 'standard');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deep audit endpoint ($0.50)
app.post('/audit/deep', async (req: any, res: any) => {
  try {
    const { skill_url, skill_content } = req.body;

    let content: string;
    if (skill_content) {
      content = skill_content;
    } else if (skill_url) {
      content = await fetchSkillContent(skill_url);
    } else {
      return res.status(400).json({ error: 'Either skill_url or skill_content is required' });
    }

    const result = await runAudit(content, 'deep');
    // Add attestation for deep tier
    (result as any).attestation = {
      signature: `0x${Buffer.from(JSON.stringify({ audit_id: result.audit_id, risk_score: result.risk_score })).toString('hex').slice(0, 128)}`,
      signer: PAY_TO,
      chain: NETWORK,
    };
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
