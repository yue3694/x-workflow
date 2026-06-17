---
description: 测试约定与当前覆盖现状
---

# 测试

- 项目脚手架阶段尚未引入测试框架（无 vitest/jest/playwright 依赖）。在添加测试前，先与用户确认测试框架选型；ESM + TypeScript 的栈下优先考虑 `vitest`。
- 在测试框架就位之前，代码正确性的主要防线是：
  - `pnpm check-types`：跨包类型检查，修改后必须保证通过。
  - `pnpm db:push` / `pnpm db:studio`：手动验证 Drizzle schema 变更。
  - 手动启动 `pnpm dev` 验证 web (3001) 与 server (3000) 的端到端行为。
- 新增测试时，测试文件应放在被测模块同级或对应包内的 `__tests__/`、`*.test.ts` 约定下，并在该包 `package.json` 中补充 `test` script。
