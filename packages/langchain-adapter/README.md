# @x402guard/langchain

Security scanner for [LangChain](https://langchain.com) tool registration and execution.

Scans tools via [x402guard](https://x402guard.xyz) before they execute. Pays per scan via x402 protocol (USDC on Base).

## Setup

```bash
npm install @x402guard/langchain
```

## Quick Start: Callback Handler

Add to any LangChain agent to scan tools before execution:

```ts
import { X402GuardCallbackHandler } from '@x402guard/langchain';

const handler = new X402GuardCallbackHandler({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  tier: 'quick',       // $0.10/scan
  onDeny: 'block',     // throw on dangerous tools
});

const agent = new AgentExecutor({
  tools,
  llm,
  callbacks: [handler],
});
```

## Pre-Registration Scanning

Scan tool source code before registering:

```ts
import { scanTool } from '@x402guard/langchain';

const result = await scanTool({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  content: toolSourceCode,
  toolName: 'my-tool',
});

if (!result.allowed) {
  throw new Error(`Tool rejected: ${result.reason}`);
}
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `privateKey` | required | Wallet private key for x402 payments |
| `apiUrl` | `https://x402guard.xyz` | x402guard API URL |
| `tier` | `quick` | Scan tier: quick ($0.10), standard ($0.50), deep ($1.00) |
| `onDeny` | `block` | Action on deny: `block` throws, `warn` logs |
| `timeoutMs` | `10000` | Scan timeout in milliseconds |
| `onError` | `allow` | Action on scan failure: `allow` or `block` |
| `skipTools` | `[]` | Tool names to skip scanning |

## Payment

Scans are paid via x402 protocol (USDC on Base mainnet). The adapter handles payment signing automatically.

## License

MIT
