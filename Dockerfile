FROM node:22-bookworm-slim

RUN corepack enable

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

RUN pnpm --filter server build
RUN pnpm --filter web build

EXPOSE 3000
CMD ["node", "apps/server/dist/index.mjs"]
