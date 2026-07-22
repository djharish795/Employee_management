FROM node:20-alpine AS base

# Install necessary alpine packages for Prisma & turborepo
RUN apk update && apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Setup workspace
WORKDIR /app
RUN pnpm install -g turbo

# 1. Prune the workspace for the API project
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune --scope=api --docker

# 2. Install dependencies
FROM base AS installer
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=builder /app/out/full/ .

# Generate Prisma Client (critical for backend)
RUN pnpm --filter @naprocs/database run generate || npx prisma generate --schema=packages/database/prisma/schema.prisma || true

# Build the api project and its dependencies
RUN pnpm turbo run build --filter=api...

# 3. Create the production runner image
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the built node_modules and output from the installer
COPY --from=installer --chown=nestjs:nodejs /app .

# Expose port (default 3001 for NestJS)
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Run the NestJS application
CMD ["node", "apps/api/dist/main.js"]
