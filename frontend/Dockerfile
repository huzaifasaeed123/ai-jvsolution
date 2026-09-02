# JV Solution — web (Next.js)
#
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, not
# read at runtime. They therefore arrive as build args: setting them only as
# runtime environment variables would leave the browser bundle pointing at
# whatever was baked in earlier. In Coolify, tick "Build Variable" on each of
# these so they are passed through here.

# ---------- build ----------
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./

# --include=dev for the same reason as the API image: `next build` needs the
# TypeScript toolchain, which an injected NODE_ENV=production would omit.
RUN npm ci --include=dev

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BRAND_NAME
ARG NEXT_PUBLIC_DEFAULT_LOCALE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_BRAND_NAME=$NEXT_PUBLIC_BRAND_NAME \
    NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE \
    NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npm run build \
 && test -d .next   # fail loudly rather than shipping an empty image

# ---------- runtime ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# `next start` needs the production dependency tree, not the build toolchain.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
