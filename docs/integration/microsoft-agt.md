# Microsoft Agent Governance Toolkit Integration

Add x402guard as a PolicyProvider to any AGT-governed agent.

## Install

```bash
npm install @x402guard/agt-adapter
```

## Option 1: PolicyProvider (full AGT integration)

Register x402guard as a policy provider. AGT calls it before any tool executes.

```ts
import { X402GuardPolicyProvider } from '@x402guard/agt-adapter';

const provider = new X402GuardPolicyProvider({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  tier: 'quick',       // $0.10/scan
  onDeny: 'block',     // Block dangerous tools
  onError: 'allow',    // Allow tools if scanner is unavailable
});

// Register with AGT's AgentOS
agentOS.registerPolicyProvider(provider);
```

The provider automatically evaluates `tool.install`, `tool.execute`, and `plugin.install` actions. Other actions pass through without scanning.

## Option 2: Standalone Interceptor

For simpler integrations without full AGT:

```ts
import { createToolInterceptor } from '@x402guard/agt-adapter';

const scan = createToolInterceptor({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  tier: 'quick',
});

// Before executing any tool
const decision = await scan(toolSourceCode, 'my-tool');

if (!decision.allowed) {
  throw new Error(`Tool blocked: ${decision.reason}`);
}

// Check metadata for details
console.log(decision.metadata);
// {
//   audit_id: "abc123",
//   risk_score: 75,
//   risk_level: "HIGH",
//   gate_decision: "deny",
//   findings_count: 3,
// }
```

## Configuration

```ts
const provider = new X402GuardPolicyProvider({
  // Required
  privateKey: process.env.WALLET_PRIVATE_KEY,

  // Optional
  apiUrl: 'https://x402guard.xyz',  // Default
  tier: 'quick',                     // quick ($0.10) | standard ($0.50) | deep ($1.00)
  onDeny: 'block',                   // 'block' returns allowed:false | 'warn' returns allowed:true with warning
  onError: 'allow',                  // 'allow' passes through | 'block' returns allowed:false
  timeoutMs: 10000,                  // Scan timeout (10s default)
});
```

## Policy Decision Format

The provider returns AGT-compatible `PolicyDecision` objects:

```ts
interface PolicyDecision {
  allowed: boolean;
  reason: string;
  metadata: {
    audit_id: string;
    risk_score: number;
    risk_level: string;
    recommendation: string;
    gate_decision: string;
    tier: string;
    findings_count: number;
  };
}
```

## Local Testing (free)

```ts
const provider = new X402GuardPolicyProvider({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  apiUrl: 'http://localhost:3007',  // Local server
});
```
