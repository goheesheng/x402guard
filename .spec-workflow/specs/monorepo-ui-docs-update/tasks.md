# Tasks Document: Monorepo UI, Documentation & SKILL.md Update

- [x] 1. Sync SKILL.md content from skillscan-web
  - Files: server/src/content/skill.md, server/src/content/skill-metadata.ts
  - Copy SKILL_MD_CONTENT from skillscan-web/lib/skill-content.ts to server/src/content/skill.md
  - Create skill-metadata.ts with SKILL_METADATA export matching skillscan-web
  - Update skill.ts route to use new metadata file
  - Purpose: Ensure consistent AI agent instructions across both projects
  - _Leverage: /Users/eesheng_eth/Desktop/skillscan-web/lib/skill-content.ts_
  - _Requirements: 1.1, 1.2, 1.3_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Sync SKILL.md content by copying SKILL_MD_CONTENT from skillscan-web/lib/skill-content.ts to server/src/content/skill.md, create skill-metadata.ts with typed SKILL_METADATA export, update routes to use new content | Restrictions: Preserve existing route structure, ensure URLs point to x402guard.xyz not x402guard.com | _Leverage: skillscan-web/lib/skill-content.ts, server/src/routes/skill.ts | _Requirements: 1.1-1.3 | Success: skill.md endpoint returns updated content, skill.json returns structured metadata | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 2. Update comprehensive documentation
  - Files: docs/*.md, README.md
  - Update API_REFERENCE.md with all endpoints and examples
  - Update SDK_REFERENCE.md with X402GuardClient methods
  - Update DETECTION_RULES.md with all YARA patterns
  - Enhance QUICKSTART.md with clearer examples
  - Purpose: Provide complete developer documentation
  - _Leverage: Existing docs/*.md files, server/src/routes/*.ts for API details_
  - _Requirements: 2.1, 2.2, 2.3_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update all documentation files in docs/ folder - enhance API_REFERENCE.md with request/response examples, update SDK_REFERENCE.md with all client methods, ensure DETECTION_RULES.md lists all 10 YARA rules with examples | Restrictions: Keep existing structure, add examples for each endpoint, include code snippets | _Leverage: docs/*.md, server/src/routes/*.ts, packages/x402guard-client/src/index.ts | _Requirements: 2.1-2.3 | Success: All docs are comprehensive with working examples, no broken links | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 3. Update README.md with new features
  - File: README.md
  - Add Web UI section describing the new interface
  - Update Quick Start with both UI and SDK options
  - Add screenshots placeholders for UI
  - Ensure all documentation links work
  - Purpose: Provide clear project overview and onboarding
  - _Leverage: Existing README.md, design mockups_
  - _Requirements: 4.1, 4.2, 4.3_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update README.md to include Web UI section, update Quick Start with both UI and SDK options, add documentation table of contents, ensure all links work | Restrictions: Keep existing security layers and detection rules sections, add not replace content | _Leverage: README.md, design.md mockups | _Requirements: 4.1-4.3 | Success: README accurately describes all features including new UI, links work | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 4. Set up web app package structure
  - Files: apps/web/package.json, apps/web/tsconfig.json, apps/web/next.config.mjs, apps/web/tailwind.config.ts
  - Create apps/web directory with Next.js 14 configuration
  - Set up Tailwind CSS with dark theme matching skillscan-web
  - Configure pnpm workspace to include apps/web
  - Add turbo.json pipeline for web app
  - Purpose: Initialize the frontend package in monorepo
  - _Leverage: skillscan-web package.json and configs, pnpm-workspace.yaml_
  - _Requirements: 3.1_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend DevOps | Task: Create apps/web with Next.js 14 setup, configure Tailwind with dark theme, update pnpm-workspace.yaml and turbo.json for new package | Restrictions: Match skillscan-web styling config, use pnpm workspaces | _Leverage: skillscan-web/package.json, skillscan-web/tailwind.config.ts, pnpm-workspace.yaml | _Requirements: 3.1 | Success: pnpm install works, pnpm dev:web starts Next.js server | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 5. Create shared-types package
  - Files: packages/shared-types/package.json, packages/shared-types/src/index.ts
  - Extract API types from server/src/types/api.ts to shared package
  - Export AuditResult, SkillMetadata, and other shared interfaces
  - Update server and client packages to use shared-types
  - Purpose: Share TypeScript types between packages
  - _Leverage: server/src/types/api.ts, packages/x402guard-client/src/index.ts_
  - _Requirements: 3.1_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Create packages/shared-types with AuditResult, SkillMetadata, and API types extracted from server/src/types/api.ts, update imports in server and client packages | Restrictions: Don't break existing code, export all necessary types | _Leverage: server/src/types/api.ts | _Requirements: 3.1 | Success: TypeScript compiles in all packages, types are properly shared | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 6. Create base UI components
  - Files: apps/web/components/ui/Button.tsx, Card.tsx, Badge.tsx, CodeBlock.tsx
  - Copy and adapt UI components from skillscan-web
  - Set up component exports in apps/web/components/ui/index.ts
  - Ensure consistent styling with existing skillscan-web theme
  - Purpose: Provide reusable UI building blocks
  - _Leverage: skillscan-web/components/ui/*.tsx_
  - _Requirements: 3.1, 5.1_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Copy Button, Card, Badge, CodeBlock components from skillscan-web/components/ui/, adapt imports for new project structure, create index.ts barrel export | Restrictions: Keep same styling, update import paths | _Leverage: skillscan-web/components/ui/*.tsx | _Requirements: 3.1, 5.1 | Success: All UI components render correctly, exports work | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 7. Create WalletProvider and useX402Payment hook
  - Files: apps/web/components/providers/WalletProvider.tsx, apps/web/lib/hooks/useX402Payment.ts
  - Copy WalletProvider from skillscan-web with wagmi setup
  - Copy useX402Payment hook with x402 integration
  - Set up wagmi config for Base mainnet
  - Purpose: Enable wallet connection and x402 payments
  - _Leverage: skillscan-web/components/providers/WalletProvider.tsx, skillscan-web/lib/hooks/useX402Payment.ts_
  - _Requirements: 3.4_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Web3 Developer | Task: Copy WalletProvider and useX402Payment hook from skillscan-web, set up wagmi config for Base mainnet, configure x402 payment handling | Restrictions: Use same x402 packages, ensure proper hydration handling | _Leverage: skillscan-web/components/providers/WalletProvider.tsx, skillscan-web/lib/hooks/useX402Payment.ts, skillscan-web/lib/wagmi.ts | _Requirements: 3.4 | Success: Wallet connects, x402 payment flow works | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 8. Create HeroToggle component
  - File: apps/web/components/sections/HeroToggle.tsx
  - Copy HeroToggle from skillscan-web
  - Update URLs to point to x402guard.xyz
  - Adapt styling for new project
  - Purpose: Dual-path hero for humans and agents
  - _Leverage: skillscan-web/components/sections/HeroToggle.tsx_
  - _Requirements: 3.2, 3.3_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer | Task: Copy HeroToggle component from skillscan-web, update URLs from x402guard.com to x402guard.xyz, ensure human/agent toggle works with both paths | Restrictions: Keep same UX pattern, update only URLs and imports | _Leverage: skillscan-web/components/sections/HeroToggle.tsx | _Requirements: 3.2, 3.3 | Success: Toggle switches between human and agent views, URLs correct | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 9. Create Scanner component
  - File: apps/web/components/sections/Scanner.tsx
  - Build interactive skill scanner with URL/paste input
  - Add tier selection cards (Quick, Standard, Deep)
  - Integrate with useX402Payment for payment flow
  - Handle scanning state and errors
  - Purpose: Interactive skill auditing interface
  - _Leverage: skillscan-web/components/sections/Scanner.tsx if exists, useX402Payment hook_
  - _Requirements: 3.2, 3.4_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer | Task: Create Scanner component with skill URL input, tier selection cards, integration with useX402Payment hook, handle loading/error states | Restrictions: Use existing UI components, follow skillscan-web patterns | _Leverage: skillscan-web/components/sections/Scanner.tsx, useX402Payment hook | _Requirements: 3.2, 3.4 | Success: Scanner accepts input, triggers audit with payment, shows loading state | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 10. Create Results component (merged into Scanner)
  - File: apps/web/components/sections/Results.tsx
  - Build results display with risk score visualization
  - Show findings breakdown by category
  - Display recommendation with color coding
  - Add "Scan Another" and "View Full Report" actions
  - Purpose: Display audit results clearly
  - _Leverage: Design mockups, AuditResult type from shared-types_
  - _Requirements: 3.5_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer | Task: Create Results component showing risk score gauge (0-100), risk level badge, recommendation, findings breakdown by category (malware, credentials, network, permissions) | Restrictions: Use shared-types for AuditResult, color code by severity | _Leverage: shared-types AuditResult, design.md mockups | _Requirements: 3.5 | Success: Results display correctly for all risk levels, findings are categorized | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 11. Create app layout and home page
  - Files: apps/web/app/layout.tsx, apps/web/app/page.tsx, apps/web/app/globals.css
  - Set up root layout with WalletProvider
  - Create home page composing HeroToggle, Scanner, Results
  - Add global styles matching skillscan-web
  - Purpose: Complete main application page
  - _Leverage: skillscan-web/app/layout.tsx, skillscan-web/app/page.tsx, skillscan-web/app/globals.css_
  - _Requirements: 3.1, 3.2_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer | Task: Create app layout with WalletProvider, metadata, fonts. Create home page composing HeroToggle, Scanner, Results sections. Copy globals.css from skillscan-web | Restrictions: Match skillscan-web structure, ensure proper metadata | _Leverage: skillscan-web/app/layout.tsx, skillscan-web/app/page.tsx, skillscan-web/app/globals.css | _Requirements: 3.1, 3.2 | Success: Home page renders with all sections, styling matches skillscan-web | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 12. Create documentation pages
  - Files: apps/web/app/docs/page.tsx, apps/web/app/docs/[slug]/page.tsx
  - Build docs index page linking to all documentation
  - Create dynamic doc page rendering markdown from docs/ folder
  - Add navigation between docs
  - Purpose: Serve documentation through web UI
  - _Leverage: docs/*.md files, Next.js dynamic routes_
  - _Requirements: 2.1_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Next.js Developer | Task: Create docs index page with links to all docs, create dynamic [slug] route that renders markdown from docs/ folder, add navigation sidebar | Restrictions: Use server components for static generation, render markdown properly | _Leverage: docs/*.md, Next.js App Router patterns | _Requirements: 2.1 | Success: All docs accessible via web UI, markdown renders correctly | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 13. Add API proxy routes
  - Files: apps/web/app/api/audit/[tier]/route.ts, apps/web/app/api/health/route.ts
  - Create API routes that proxy to backend server
  - Forward x402 payment headers correctly
  - Handle CORS for local development
  - Purpose: Enable frontend to call backend API
  - _Leverage: skillscan-web/app/api/audit/[tier]/route.ts_
  - _Requirements: 3.4_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Next.js Developer | Task: Create API proxy routes for /api/audit/[tier] and /api/health that forward requests to backend server, handle x402 payment headers (PAYMENT-REQUIRED, PAYMENT-SIGNATURE) | Restrictions: Forward all headers correctly, handle CORS | _Leverage: skillscan-web/app/api/audit/[tier]/route.ts | _Requirements: 3.4 | Success: API calls work through proxy, payment headers forwarded | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with artifacts, then mark as [x]_

- [x] 14. Test and verify implementation
  - Files: All created files
  - Run pnpm build to verify no TypeScript errors
  - Test all API endpoints manually
  - Verify UI components render correctly
  - Test wallet connection and payment flow
  - Check mobile responsiveness
  - Purpose: Ensure everything works end-to-end
  - _Leverage: pnpm build, browser testing_
  - _Requirements: All_
  - _Prompt: Implement the task for spec monorepo-ui-docs-update, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Run pnpm build in all packages, test API endpoints with curl, verify UI renders on desktop and mobile, test wallet connection, verify human/agent toggle, test scan flow end-to-end | Restrictions: Fix any bugs found, document any issues | _Leverage: pnpm build, curl, browser dev tools | _Requirements: All | Success: Build passes, all features work, responsive on mobile | Instructions: Mark task as [-] in tasks.md before starting, use log-implementation tool after completion with test results, then mark as [x]_
