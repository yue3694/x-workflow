# 开发计划索引

## 本次 PRD（2026-06-18）切分为 3 个 feature

来源：对比 `docs/`（Alexandria AI Orchestrator 设计原型，一个独立的 React/Vite 应用）与现有 `x-workflow` 代码后发现，原型描述的大部分功能（Dashboard、Orchestrator 画布、Knowledge Base、Admin）已经在仓库中真实实现并接入数据库/tRPC。本次切分只覆盖**仍缺失或被模拟（mock）的部分**。

| 序号 | feature                      | 说明                                                                   | 依赖 | 状态   |
| ---- | ----------------------------- | ---------------------------------------------------------------------- | ---- | ------ |
| 1    | auth-completion                | 打通注册表单与真实后端、用 Resend 实现真实忘记密码/重置密码邮件流程     | -    | 已完成 |
| 2    | debugger-llm-integration       | Debugger 聊天用真实 Google Gemini 调用替换写死的模拟回复                | -    | 待开发 |
| 3    | debugger-graph-execution       | Debugger 真正按已保存的工作流节点图（trigger→condition→parallel→multimodal→llm_synthesis）执行，而非 4 个写死的可视化步骤 | 2    | 待开发 |

**推荐执行顺序**：1、2 可并行 → 3（依赖 2 中实现的真实 LLM 调用）

## 范围说明（本次 PRD 已确认跳过的部分）

- **Workspace Request（访客自助申请工作空间）流程**：原型中的 3 步模拟审批动画（部门选择 + 用例说明 + 进度条）被判定为 AI Studio 模板的装饰性演示功能，无真实业务价值（已有 Admin 邀请制可覆盖入职场景），本次**不纳入**开发范围。
- Dashboard / Orchestrator 画布 / Knowledge Base（RAG 上传与分块） / Admin 用户与权限管理：均已在代码中真实实现（非 mock），**本次不重复生成 specs**。

## ID 编号约定

- 功能需求 / 任务 / 验收标准 ID **在单个 feature 内编号**，跨 feature 用 `{序号}.` 前缀区分。
- 例：`1.T-001` = 序号 1 这个 feature 的 T-001；`3.F-002` = 序号 3 的 F-002。
- **跨 feature 依赖**写全限定 ID，如 `3.T-006 依赖 2.T-003`。

## 代码仓库映射

monorepo 单仓库，所有 feature 均落地到同一个代码项目路径。

| 序号 | feature                  | 代码项目路径                                   |
| ---- | ------------------------- | ----------------------------------------------- |
| 1    | auth-completion            | /Users/dream/Documents/Coding/dream/x-workflow   |
| 2    | debugger-llm-integration   | /Users/dream/Documents/Coding/dream/x-workflow   |
| 3    | debugger-graph-execution   | /Users/dream/Documents/Coding/dream/x-workflow   |
