---
description: 分支与 commit 规范
---

# Git 工作流

- 仓库刚通过 `git init` 创建，尚无历史 commit 风格可循 —— 默认采用 Conventional Commits（`feat:`、`fix:`、`chore:`、`refactor:` 等前缀），保持小而聚焦的 commit。
- 不要提交 `node_modules`、`.env`、构建产物（`dist`、`build`、`*.tsbuildinfo`）、生成文件（如 `apps/web/src/routeTree.gen.ts`）—— 均已在根 `.gitignore` 中处理，新增的同类文件需同步加入。
- 功能分支命名建议 `feature/<desc>`、`fix/<desc>`；未经用户明确要求不要直接向 `main`/`master` 强推或重写历史。
