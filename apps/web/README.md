# SkillScan Web

> **Landing page for SkillScan** — Pre-install security auditing for AI agent skills

## Tech Stack

- ⚡ **Next.js 14** — React framework
- 🎨 **Tailwind CSS** — Utility-first styling
- 🎬 **Framer Motion** — Smooth animations
- 🎯 **Lucide Icons** — Beautiful icon set
- 🌙 **Dark mode** — Sleek dark theme with green accents

## Features

### Sections

| Section | Description |
|---------|-------------|
| **Hero** | Animated headline, x402 badge, CTA buttons |
| **Problem** | 3 cards explaining the unsigned skill problem |
| **Solution** | Trust stack diagram, feature checklist |
| **Pricing** | 3 tiers with x402 USDC prices |
| **Demo** | Interactive skill audit simulator |
| **Integration** | Code example for API usage |
| **Footer** | Links to GitHub, x402 Protocol |

### Design

- Glass morphism effects
- Grid pattern backgrounds
- Scroll-triggered animations
- Responsive design
- Gradient accents

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

None required for the landing page. The demo uses simulated data.

For connecting to the actual API:

```bash
NEXT_PUBLIC_API_URL=https://skillscan.ai
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

## Project Structure

```
skillscan-web/
├── app/
│   ├── globals.css      # Tailwind + custom styles
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main landing page
├── public/              # Static assets
├── tailwind.config.ts   # Tailwind configuration
├── next.config.mjs      # Next.js configuration
└── package.json
```

## Related

- **API Backend:** https://github.com/goheesheng/skillguard-api
- **x402 Protocol:** https://x402.org
- **x402-secure:** https://github.com/t54-labs/x402-secure

## License

MIT © [Eesheng](https://github.com/goheesheng)
