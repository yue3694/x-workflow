---
description: 密钥处理、认证授权基线、依赖审查要求
---

# 安全基线

## 密钥与环境变量

- 所有密钥/连接串通过环境变量管理，禁止硬编码到代码或提交到 git。`.env`、`.env*.local` 已在 `.gitignore` 中忽略，新增的敏感文件需同步加入。
- 环境变量必须通过 `packages/env`（`@t3-oss/env-core` / `@t3-oss/env-nextjs`）的 zod schema 校验后使用，禁止在业务代码中直接读取未校验的 `process.env.*`。
  - 服务端必填项：`DATABASE_URL`、`BETTER_AUTH_SECRET`（最少 32 字符）、`BETTER_AUTH_URL`、`CORS_ORIGIN`。
  - 前端公开变量需以 `NEXT_PUBLIC_` 前缀声明在 `packages/env/src/web.ts` 中，且只暴露真正需要客户端可见的值。

## 认证授权方案

- 认证基于 Better-Auth（`packages/auth`），session/account/verification 表定义在 `packages/db/src/schema/auth.ts`。
- tRPC 侧的权限边界在 `packages/api/src/index.ts`：`publicProcedure` 无鉴权，`protectedProcedure` 强制要求 `ctx.session` 存在。新增需要登录的接口必须使用 `protectedProcedure`，禁止在 handler 内部手写重复的 session 判断逻辑。
- 不要在客户端组件或公开 API 中暴露 `BETTER_AUTH_SECRET`、数据库连接串等服务端专属变量。

## 输入校验

- API 输入统一用 zod 校验（项目已引入 `zod` 作为 catalog 依赖），tRPC procedure 的 `input()` 必须声明 schema，禁止跳过校验直接信任客户端传参。

## 依赖审查

- 新增依赖前检查是否已有 workspace 包提供同等能力（如 UI 组件应复用 `packages/ui`，不要重复引入组件库）。
- `pnpm-workspace.yaml` 中的 `allowBuilds` 控制哪些依赖允许执行安装期脚本（postinstall 等），新增需要构建脚本的依赖时要显式评估是否可信后再设为 `true`，不要无差别放行。
- 涉及鉴权、加密、支付的第三方依赖在引入前应向用户确认必要性与信任来源。
