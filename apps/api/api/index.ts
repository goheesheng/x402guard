import express from 'express';
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
app.use(express.json({ limit: '2mb' }));

// CORS
app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Payment");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Expose-Headers", "X-Payment-Response");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Config
const PAY_TO = process.env.X402_PAY_TO_ADDRESS || "0x209693bc6cfc6dE0d447f04B22e64904ea6Ed977";
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
const NETWORK = process.env.X402_NETWORK || "eip155:84532"; // Base Sepolia

// Create facilitator client and server
const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL
});

const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

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
    server,
  ),
);

// Health check (free)
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// Root info (free)
app.get('/', (_req: any, res: any) => {
  res.json({ 
    name: 'SkillGuard API',
    version: '0.1.0',
    description: 'x402-powered security auditing for AI agent skills',
    endpoints: {
      free: ['/health'],
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

// Mock audit function (replace with real implementation)
function runAudit(content: string, tier: string) {
  // Simulate YARA scan results
  const findings = {
    malware: [],
    permissions: tier !== 'quick' ? ['network:read', 'fs:read'] : [],
    network: tier !== 'quick' ? ['api.example.com'] : [],
  };
  
  const riskScore = Math.floor(Math.random() * 30); // Low risk for demo
  
  return {
    risk_score: riskScore,
    risk_level: riskScore < 25 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : riskScore < 75 ? 'HIGH' : 'CRITICAL',
    recommendation: riskScore < 25 ? 'SAFE' : riskScore < 50 ? 'CAUTION' : 'DANGEROUS',
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
    headers: { "User-Agent": "SkillGuard/0.1" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch skill: ${response.status}`);
  }
  return await response.text();
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
    
    const result = runAudit(content, 'quick');
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
    
    const result = runAudit(content, 'standard');
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
    
    const result = runAudit(content, 'deep');
    // Add attestation for deep tier
    (result as any).attestation = `0x${Buffer.from(JSON.stringify(result)).toString('hex').slice(0, 64)}...`;
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
