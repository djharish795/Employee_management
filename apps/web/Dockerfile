FROM node:20-alpine AS base

# Install necessary alpine packages
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Setup workspace
WORKDIR /app
RUN npm install -g turbo

# 1. Prune the workspace for the WEB project
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune --scope=web --docker

# 2. Install dependencies and Build
FROM base AS installer
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=builder /app/out/full/ .

# Ensure UI packages are built if they depend on Next.js build
# Set telemetry disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Inject public API URLs at build time (Next.js bakes these into static assets)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build the web project and its dependencies
# Assuming next.config.js has output: "standalone"
RUN pnpm turbo run build --filter=web...

# 3. Create the production runner image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy standalone output — with outputFileTracingRoot at monorepo root,
# Next.js preserves the full path: server.js is at apps/web/server.js inside standalone
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Static files must be alongside server.js at apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Public folder must be alongside server.js at apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Expose port (default 3000 for NextJS)
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js lives at apps/web/server.js inside the standalone output
CMD ["node", "apps/web/server.js"]
