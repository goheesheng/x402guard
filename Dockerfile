# Multi-stage build for x402guard unified deployment
# Runs both Express API (port 3001 internal) and Next.js web (port 3000 external)

# =============================================================================
# Stage 1: Base with pnpm
# =============================================================================
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# =============================================================================
# Stage 2: Install dependencies
# =============================================================================
FROM base AS deps

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/x402guard-client/package.json ./packages/x402guard-client/
COPY server/package.json ./server/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Build everything
# =============================================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/x402guard-client/node_modules ./packages/x402guard-client/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy all source code
COPY . .

# Build shared packages first
RUN pnpm --filter @x402guard/shared-types build || true
RUN pnpm --filter x402guard-client build || true

# Build server
RUN cd server && pnpm build

# Build Next.js web app with production API URL
# NEXT_PUBLIC_* vars must be set at build time for Next.js
ARG NEXT_PUBLIC_API_URL=https://x402guard.xyz
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Ensure public folder exists (Next.js requires it)
RUN mkdir -p apps/web/public
RUN cd apps/web && pnpm build

# =============================================================================
# Stage 4: Production runner
# =============================================================================
FROM node:20-alpine AS runner

RUN npm install -g pnpm pm2

WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/x402guard-client/package.json ./packages/x402guard-client/
COPY server/package.json ./server/
COPY apps/web/package.json ./apps/web/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built server
COPY --from=builder /app/server/dist ./server/dist

# Copy built Next.js app
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy PM2 ecosystem config
COPY ecosystem.config.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose only port 3000 (Next.js serves externally, Express is internal)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start both services with PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
