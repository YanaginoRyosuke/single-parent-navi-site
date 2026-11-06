# syntax=docker/dockerfile:1
# ---- 依存関係 ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- ビルド ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# LINE公式アカウントのURL（ビルド時に埋め込まれる）
ARG NEXT_PUBLIC_LINE_URL=
ENV NEXT_PUBLIC_LINE_URL=$NEXT_PUBLIC_LINE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 実行 ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
