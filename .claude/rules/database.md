---
description: Drizzle schema、migration 与查询规范
globs: packages/db/**
---

# 数据库规范

- 数据库为 SQLite（本地通过 Turso `db:local` 模拟），ORM 为 Drizzle，连接配置见 `packages/db/src/index.ts`，环境变量 `DATABASE_URL` 通过 `@x-workflow/env` 校验。
- Schema 定义在 `packages/db/src/schema/*.ts`，按领域拆分文件（如认证相关表在 `schema/auth.ts`），并在 `schema/index.ts` 统一 re-export；新增表遵循已有命名风格：
  - 表名/字段用 snake_case 字符串（如 `text("email_verified")`），TS 字段名用 camelCase。
  - 主键统一 `text("id").primaryKey()`，时间字段使用 `integer(..., { mode: "timestamp_ms" })` 并用 `sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`` 作为默认值。
  - 外键关联需补充对应 `index(...)`（参考 `session_userId_idx`）。
- Schema 变更流程：
  - 本地快速迭代用 `pnpm db:push`（不生成 migration 文件）。
  - 需要可追踪的变更历史时用 `pnpm db:generate` 生成 migration（输出到 `packages/db/src/migrations`），再用 `pnpm db:migrate` 应用。
  - 不要手动编辑已生成的 migration SQL 文件。
- 查询逻辑应封装在 `packages/db` 或调用方所在的 `packages/api` 内，不要在 `apps/*` 中直接 import drizzle client 写裸查询。
