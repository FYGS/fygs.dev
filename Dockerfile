# syntax=docker/dockerfile:1.7
# Production image of fygs.dev (Next.js standalone), deployable as is on Coolify (build pack: Dockerfile).
# docker-entrypoint.sh applies the pending migrations when RUN_MIGRATIONS=1, then starts the server (see docs/COOLIFY.md).

# ---------- 1. Dependencies ----------
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --ignore-scripts: the postinstall (prisma generate) needs the schema, it runs in the build stage
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# ---------- 2. Build ----------
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values and the storage hosts are frozen into the build: in Coolify tick "Build Variable" on each of them.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_YANDEX_VERIFICATION
ARG NEXT_PUBLIC_NORTON_VERIFICATION
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_RELEASE
ARG S3_PUBLIC_URL
ARG S3_IMAGES_PUBLIC_URL
ARG IMAGE_REMOTE_HOSTS
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION \
    NEXT_PUBLIC_YANDEX_VERIFICATION=$NEXT_PUBLIC_YANDEX_VERIFICATION \
    NEXT_PUBLIC_NORTON_VERIFICATION=$NEXT_PUBLIC_NORTON_VERIFICATION \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_SENTRY_RELEASE=$NEXT_PUBLIC_SENTRY_RELEASE \
    S3_PUBLIC_URL=$S3_PUBLIC_URL \
    S3_IMAGES_PUBLIC_URL=$S3_IMAGES_PUBLIC_URL \
    IMAGE_REMOTE_HOSTS=$IMAGE_REMOTE_HOSTS \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max_old_space_size=4096

# The build needs no database, cache or payment key (same placeholders as the CI build); none of them is kept in the image.
RUN pnpm prisma generate \
 && DATABASE_URL=postgresql://build:build@localhost:5432/build \
    BETTER_AUTH_SECRET=docker-build-placeholder-secret-32chars!! \
    STRIPE_SECRET_KEY=sk_test_docker_build_placeholder \
    SKIP_ENV_VALIDATION=true \
    pnpm build \
 && node -p "require('prisma/package.json').version" > /prisma-version

# ---------- 3. Migration tools (prisma CLI only, same version as the project) ----------
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS migrate
RUN apk add --no-cache openssl
WORKDIR /opt/migrate
COPY --from=builder /prisma-version /prisma-version
COPY --from=builder /app/package.json /tmp/package.json
RUN npm init -y >/dev/null \
 && npm install --no-audit --no-fund --omit=dev \
      "prisma@$(cat /prisma-version)" \
      "dotenv@$(node -p "require('/tmp/package.json').dependencies.dotenv.replace(/^[\^~]/, '')")" \
 && rm -rf /root/.npm
COPY prisma ./prisma
COPY prisma.config.ts ./

# ---------- 4. Runtime ----------
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS runner
RUN apk add --no-cache libc6-compat openssl tini
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Blog posts are read from disk at run time (lib/types.ts), the file tracer cannot see them
COPY --from=builder --chown=nextjs:nodejs /app/content/blog ./content/blog
# Prisma CLI used by docker-entrypoint.sh (the standalone server has no CLI)
COPY --from=migrate --chown=nextjs:nodejs /opt/migrate /opt/migrate
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

# Liveness only: /api/health reads in-process counters, it does not depend on the database or Redis
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1

# tini forwards signals: a redeployment stops the server cleanly
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["docker-entrypoint.sh"]
