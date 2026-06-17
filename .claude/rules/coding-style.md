---
description: 命名、模块、TypeScript 风格规范
---

# 编码风格

- TypeScript `strict` 模式开启，禁止引入 `any`；`noUnusedLocals`/`noUnusedParameters` 已开启，不要留未使用的变量或参数。
- 模块系统统一为 ESM（`"type": "module"`），`verbatimModuleSyntax` 已开启 —— 仅做类型导入时使用 `import type { ... }`。
- 文件命名：组件/路由文件用 kebab-case（如 `sign-in-form.tsx`、`mode-toggle.tsx`），工具文件同样 kebab-case（如 `auth-client.ts`）。
- 共享逻辑放入对应 `packages/*` 而非在 `apps/*` 内重复实现；跨包引用通过 `@x-workflow/<package>` workspace 别名。
- 未引入 ESLint/Prettier/Biome，依赖 `tsconfig.base.json` 的严格类型检查作为主要质量门槛；修改代码后运行 `pnpm check-types` 确认无类型错误。
- 不要手写 `apps/web/src/routeTree.gen.ts` 等生成文件（已在 `.gitignore` 中忽略）。
