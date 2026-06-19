FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
ENV CI=true

# Layer with only manifests, so dependency install is cached across source changes.
FROM base AS manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/ui/package.json packages/ui/package.json

FROM manifests AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter server build

FROM manifests AS prod-deps
RUN pnpm install --frozen-lockfile --prod --filter "server..."

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S hono -u 1001 -G nodejs

COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=hono:nodejs /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=build --chown=hono:nodejs /app/apps/server/dist ./apps/server/dist

USER hono
EXPOSE 3000
CMD ["node", "apps/server/dist/index.mjs"]
