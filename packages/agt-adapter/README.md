# @x402guard/agt-adapter

Security scanner adapter for [Microsoft Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit).

Scans agent tools and skills via [x402guard](https://x402guard.xyz) before allowing execution. Pays per scan via x402 protocol (USDC on Base).

## Setup

```bash
npm install @x402guard/agt-adapter
```

## Quick Start

```ts
import { X402GuardPolicyProvider } from '@x402guard/agt-adapter';

const provider = new X402GuardPolicyProvider({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  tier: 'quick',       // $0.10/scan
  onDeny: 'block',     // block tools that fail scanning
  onError: 'allow',    // allow tools if scanner is unavailable
});

// Register with AGT's AgentOS
agentOS.registerPolicyProvider(provider);
```

## Standalone Interceptor

For simpler integrations without full AGT:

```ts
import { createToolInterceptor } from '@x402guard/agt-adapter';

const scan = createToolInterceptor({
  privateKey: process.env.WALLET_PRIVATE_KEY,
});

const decision = await scan(toolSourceCode, 'my-tool');
if (!decision.allowed) {
  throw new Error(`Tool blocked: ${decision.reason}`);
}
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `privateKey` | required | Wallet private key for x402 payments |
| `apiUrl` | `https://x402guard.xyz` | x402guard API URL |
| `tier` | `quick` | Scan tier: quick ($0.10), standard ($0.50), deep ($1.00) |
| `onDeny` | `block` | Action on deny: `block` or `warn` |
| `timeoutMs` | `10000` | Scan timeout in milliseconds |
| `onError` | `allow` | Action on scan failure: `allow` or `block` |

## Payment

Scans are paid via x402 protocol (USDC on Base mainnet). The adapter handles payment signing automatically using the provided wallet private key.

## License

MIT
