# Install dependencies only when needed
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui ./packages/ui
COPY packages/env ./packages/env
COPY packages/db ./packages/db
COPY packages/api ./packages/api
COPY packages/auth ./packages/auth
COPY apps/web/package.json ./apps/web/

RUN npm install -g pnpm@9 && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build --filter=web

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/apps/web/public ./public
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]