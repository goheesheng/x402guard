# LangChain Integration

Add security scanning to any LangChain agent in 3 lines.

## Install

```bash
npm install @x402guard/langchain
```

## Option 1: Callback Handler (scan tools at runtime)

Scans every tool before it executes. Blocks dangerous tools automatically.

```ts
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { X402GuardCallbackHandler } from '@x402guard/langchain';

// Create the security handler
const securityHandler = new X402GuardCallbackHandler({
  privateKey: process.env.WALLET_PRIVATE_KEY,  // For x402 payment
  tier: 'quick',       // $0.10/scan
  onDeny: 'block',     // Throw error on dangerous tools
  onError: 'allow',    // Allow tools if scanner is unavailable
});

// Add to your agent
const agent = new AgentExecutor({
  agent: await createOpenAIFunctionsAgent({ llm, tools, prompt }),
  tools,
  callbacks: [securityHandler],  // ← This is the only change
});

// Tools are now scanned before every execution
const result = await agent.invoke({ input: "What's the weather?" });
```

## Option 2: Pre-Registration Scan (scan tool source code)

Scan a tool's source code before registering it with your agent. Use this when you have the tool source and want to verify it once.

```ts
import { scanTool } from '@x402guard/langchain';

// Scan the tool source
const result = await scanTool({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  content: toolSourceCode,
  toolName: 'weather-tool',
  tier: 'standard',  // $0.50 for deeper analysis
});

if (!result.allowed) {
  console.error(`Tool rejected: ${result.reason}`);
  console.error(`Risk score: ${result.risk_score}`);
  console.error(`Findings: ${result.findings_count}`);
  process.exit(1);
}

// Safe to register
agent.addTool(weatherTool);
```

## Configuration

```ts
const handler = new X402GuardCallbackHandler({
  // Required
  privateKey: process.env.WALLET_PRIVATE_KEY,

  // Optional
  apiUrl: 'https://x402guard.xyz',  // Default
  tier: 'quick',                     // quick ($0.10) | standard ($0.50) | deep ($1.00)
  onDeny: 'block',                   // 'block' throws error | 'warn' logs warning
  onError: 'allow',                  // 'allow' lets tool run | 'block' stops it
  timeoutMs: 10000,                  // Scan timeout (10s default)
  skipTools: ['calculator'],         // Tools to skip scanning
});
```

## What happens when a tool is blocked

```
Error: [x402guard] Tool "data-fetcher" blocked: DANGEROUS (risk_score: 75, audit_id: abc123)
```

Your agent catches this error and refuses to use the tool. The user sees a safe failure instead of a silent compromise.

## Local Testing (free)

Point the adapter at your local server to test without paying:

```ts
const handler = new X402GuardCallbackHandler({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  apiUrl: 'http://localhost:3007',  // Local server
  tier: 'quick',
});
```

Start the local server with `ACP_INTERNAL_SECRET=test-secret PORT=3007 npx tsx src/index.ts` in the server directory.
