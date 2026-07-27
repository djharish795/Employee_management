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

# Build the web project and its dependencies
# Assuming next.config.js has output: "standalone"
RUN pnpm turbo run build --filter=web...

# 3. Create the production runner image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Copy public folder
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy standalone output
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Expose port (default 3000 for NextJS)
EXPOSE 3000
ENV PORT=3000

# Server.js is created by next build from the standalone output
# It runs the next server without the full node_modules
CMD ["node", "apps/web/server.js"]
