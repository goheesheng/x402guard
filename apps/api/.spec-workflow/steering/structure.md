# Structure Steering - SkillGuard API

## Project Organization

```
skillguard-api/
├── .spec-workflow/         # Spec workflow files
├── src/
│   ├── index.ts            # Entry point
│   ├── server.ts           # Express setup
│   ├── middleware/
│   │   ├── x402.ts         # Payment middleware
│   │   ├── validation.ts   # Request validation
│   │   └── errorHandler.ts # Error handling
│   ├── routes/
│   │   ├── audit.ts        # /audit endpoint
│   │   ├── health.ts       # /health endpoint
│   │   └── pricing.ts      # /pricing endpoint
│   ├── services/
│   │   ├── auditEngine/
│   │   │   ├── index.ts
│   │   │   ├── parser.ts
│   │   │   ├── yaraScanner.ts
│   │   │   ├── permissionAnalyzer.ts
│   │   │   ├── networkDetector.ts
│   │   │   └── riskCalculator.ts
│   │   └── tierManager.ts
│   ├── types/
│   │   ├── api.ts
│   │   └── audit.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── config/
│       └── index.ts
├── rules/                  # YARA rules
│   ├── credential-theft.yar
│   ├── data-exfil.yar
│   └── malicious-commands.yar
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
├── tsconfig.json
└── README.md
```

## Naming Conventions

- **Files**: camelCase (`auditEngine.ts`)
- **Tests**: `*.test.ts` suffix
- **YARA**: kebab-case (`.yar`)

## Import Order

1. Node built-ins
2. External packages  
3. Internal absolute (@/*)
4. Relative imports

## Environment Variables

```bash
PORT=3000
NODE_ENV=development
X402_PAY_TO_ADDRESS=0x...
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
X402_NETWORK=eip155:8453
PRICE_QUICK=50000
PRICE_STANDARD=150000
PRICE_DEEP=500000
```
