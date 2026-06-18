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
COPY apps/server/package.json ./apps/server/

RUN npm install -g pnpm@9 && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build --filter=server

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/apps/server/dist ./dist

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/index.js"]