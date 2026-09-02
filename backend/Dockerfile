# JV Solution — API (NestJS + Prisma)
#
# Built as a Dockerfile rather than a buildpack on purpose. Prisma needs an
# explicit `prisma generate` before compilation, and npm 11 blocks lifecycle
# scripts by default — so a `postinstall` hook cannot be relied on. When that
# silently fails, `nest build` still emits dist/, and a buildpack reports a
# successful build of a broken image. Here every step is explicit.
#
# Debian slim rather than Alpine: Prisma's query engine needs OpenSSL, which
# Alpine does not ship by default.

# ---------- build ----------
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Dependencies first, so a source-only change does not reinstall them.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts

# Explicit, not incidental.
RUN npx prisma generate

COPY . .
RUN npm run build \
 && test -f dist/main.js   # fail loudly rather than shipping an empty image

# ---------- runtime ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Production dependencies only, plus the generated client they need at runtime.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --ignore-scripts \
 && npx prisma generate \
 && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Do not run as root inside the container.
RUN chown -R node:node /app
USER node

EXPOSE 4000

# `migrate deploy` is idempotent, so this is safe on every start and keeps the
# schema in step with the image that is being deployed.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
