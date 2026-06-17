# x-workflow

Better-T-Stack monorepo: Next.js 前端 + Hono/tRPC 后端 + Drizzle/SQLite 数据库 + Better-Auth 认证。

## 技术栈

- 语言: TypeScript (strict)
- 前端: Next.js 16 + TailwindCSS v4 + shadcn/ui (`packages/ui`)
- 后端: Hono + tRPC 11
- 数据库: SQLite/Turso + Drizzle ORM
- 认证: Better-Auth
- 包管理: pnpm workspace (monorepo)

## 常用命令

- 安装依赖: `pnpm install`
- 开发运行: `pnpm dev`（同时启动 web:3001 + server:3000，也可用 `pnpm dev:web` / `pnpm dev:server` 单独启动）
- 构建: `pnpm build`
- 类型检查: `pnpm check-types`
- 数据库推送: `pnpm db:push`
- 数据库迁移生成: `pnpm db:generate`
- 数据库可视化: `pnpm db:studio`
- 本地 SQLite: `pnpm db:local`

## 目录结构

```
x-workflow/
├── apps/
│   ├── web/              # Next.js 前端 (apps/web/src/app, components, lib, utils)
│   └── server/           # Hono + tRPC 服务端入口 (apps/server/src/index.ts)
├── packages/
│   ├── ui/                # 共享 shadcn/ui 组件与全局样式
│   ├── api/                # tRPC router 定义 (packages/api/src/routers)
│   ├── auth/                # Better-Auth 配置
│   ├── db/                # Drizzle schema 与 migrations (packages/db/src/schema)
│   ├── env/                # 环境变量校验 (t3-env, web.ts / server.ts)
│   └── config/            # 共享 tsconfig
```

## 规则

@rules/coding-style.md
@rules/testing.md
@rules/security.md
@rules/git-workflow.md
@rules/frontend.md
@rules/backend-api.md
@rules/database.md

## 工作流协同

使用 `/x:ai` 命令进行反思式工程开发。该工作流包含：规划 (Strategize) -> 执行 (Execute) -> 审计 (Audit) -> 验证 (Validate)。
经验沉淀记录在 `.claude/LESSONS.md`（`/x:ai` 的 N4/N6 节点会读写此文件，无需手动创建）。
