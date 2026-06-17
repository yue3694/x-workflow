---
description: Hono + tRPC API 设计与错误处理规范
globs: apps/server/**, packages/api/**, packages/auth/**
---

# 后端 API 规范

- API 路由统一定义在 `packages/api/src/routers`，通过 `packages/api/src/index.ts` 导出的 `router`/`publicProcedure`/`protectedProcedure` 组装，不要在 `apps/server` 内直接挂载裸 Hono 路由处理业务逻辑。
- 需要登录态的 procedure 必须使用 `protectedProcedure`（已在 `ctx.session` 缺失时统一抛出 `TRPCError({ code: "UNAUTHORIZED" })`），不要重复手写鉴权判断。
- procedure 的输入必须用 zod schema 通过 `.input()` 声明并校验，不要信任未校验的客户端输入。
- 业务错误通过 `TRPCError` 抛出并指定恰当的 `code`（如 `NOT_FOUND`、`BAD_REQUEST`、`FORBIDDEN`），不要用裸 `throw new Error()` 或返回错误码字段。
- 数据库访问通过 `packages/db` 提供的 Drizzle client，不要在 `packages/api` 之外（如 `apps/server`）直接拼接 SQL 或绕过 schema 访问数据。
- 服务端环境变量统一通过 `packages/env/src/server.ts` 的 `env` 对象读取（已含 zod 校验），不要直接读取裸 `process.env`。
- 服务端入口 `apps/server/src/index.ts` 仅负责 Hono app 装配与中间件挂载（CORS、tRPC adapter 等），业务逻辑下沉到 `packages/api`。
