---
description: Next.js 前端组件、状态管理、UI 复用规范
globs: apps/web/**, packages/ui/**
---

# 前端规范

- 路由使用 Next.js App Router（`apps/web/src/app`），页面文件统一为 `page.tsx`，嵌套路由用目录表达（如 `app/dashboard/page.tsx`）。
- UI 基础组件统一从 `packages/ui`（shadcn/ui 封装）导入，例如 `import { Button } from "@x-workflow/ui/components/button"`；不要在 `apps/web` 内重复实现已有的共享组件。
  - 新增共享 primitive：在仓库根目录运行 `npx shadcn@latest add <component> -c packages/ui`。
  - 仅当组件是 app 专属、不需跨应用复用时，才在 `apps/web` 本地新建组件。
- 全局样式与设计 token 在 `packages/ui/src/styles/globals.css` 中维护，不要在 `apps/web` 内散落重复的全局样式定义。
- 服务端通信通过 tRPC client（`apps/web/src/utils/trpc.ts` + `@tanstack/react-query`），不要直接用裸 `fetch` 调用后端 API。
- 认证状态通过 `apps/web/src/lib/auth-client.ts`（Better-Auth client）读取，不要自行解析 cookie/token。
- 环境变量通过 `@x-workflow/env`（`packages/env/src/web.ts`）读取，新增前端可见变量需以 `NEXT_PUBLIC_` 前缀声明并补充 zod schema。
