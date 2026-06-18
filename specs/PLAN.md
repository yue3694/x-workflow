# 开发计划索引

## 本次 PRD（2026-06-18）切分为 6 个 feature

| 序号 | feature              | 说明                               | 依赖         | 状态     |
| ---- | -------------------- | ---------------------------------- | ------------ | -------- |
| 1    | auth-login           | 登录认证、主题切换、国际化          | -            | ✅ 已完成 |
| 2    | dashboard            | 控制面板、KPI、流水线列表           | 1            | ✅ 已完成   |
| 3    | orchestrator-canvas  | 可视化节点编排器、工作流持久化       | 1            | ✅ 已完成   |
| 4    | knowledge-base       | 知识库文档管理、RAG 向量化          | 1            | ✅ 已完成   |
| 5    | debugger             | 执行追踪、沙盒聊天、Gemini 集成     | 3            | ✅ 已完成 |
| 6    | system-admin         | 用户目录、成员邀请、权限拓扑        | 1            | ✅ 已完成 |

**推荐执行顺序**：1 → 2/3/4/6（可并行） → 5

## ID 编号约定

- 功能需求 / 任务 / 验收标准 ID **在单个 feature 内编号**，跨 feature 用 `{序号}.` 前缀区分。
- 例：`1.T-001` = 序号 1 这个 feature 的 T-001；`5.F-005` = 序号 5 的 F-005。
- **跨 feature 依赖**写全限定 ID，如 `5.T-001 依赖 3.T-004`。

## 代码仓库映射

| 序号 | feature              | 代码项目路径                        |
| ---- | -------------------- | ----------------------------------- |
| 1    | auth-login           | {CODE_DIR} / apps/web, apps/server  |
| 2    | dashboard            | {CODE_DIR} / apps/web               |
| 3    | orchestrator-canvas  | {CODE_DIR} / apps/web, apps/server  |
| 4    | knowledge-base       | {CODE_DIR} / apps/web, apps/server  |
| 5    | debugger             | {CODE_DIR} / apps/web, apps/server  |
| 6    | system-admin         | {CODE_DIR} / apps/web, apps/server  |