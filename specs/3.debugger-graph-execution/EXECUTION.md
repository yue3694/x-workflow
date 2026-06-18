# Feature 3: debugger-graph-execution — 执行计划 (N2)

## 目标描述

把 Debugger 的"4 步固定动画"改造成真正按已保存工作流的节点图（trigger → condition → parallel → multimodal → llm_synthesis）顺序执行的引擎，每种节点类型执行真实逻辑并把真实结果回传前端轨迹 UI；同时补齐被发现的前端 UI 缺口（工作流选择器、maxRetries/timeout 可编辑输入框、multimodal 知识库关联选择框），否则本 feature 的核心用户故事无法通过浏览器实际验证。

## 已读取的上下文（与原 design.md 假设的偏差，已与用户确认按"扩大范围"处理）

- `packages/db/src/schema/workflow.ts`：`NodeConfig` 当前只有 `url/haltOnError/model/systemInstruction/temperature`，确认缺 `maxRetries/timeout/knowledgeBaseId`。
- `packages/api/src/routers/workflow.ts`：`nodeConfigSchema` 同样缺这三个字段，确认会被 zod 静默丢弃。
- `apps/web/src/app/orchestrator/components/config-panel.tsx`：
  - **偏差1**：第 158-170 行"全局配置"区域的 `maxRetries`/`timeout` 是两个写死的 `<span>3</span>` / `<span>30s</span>`，**没有 `onChange`，不可编辑**，design.md 误认为"已经有输入框"。
  - **偏差2**：`multimodal`/`parallel` 节点（127-133 行）渲染的是"此节点类型暂无可配置参数"占位文案，**没有 knowledgeBaseId 选择框**。
- `apps/web/src/components/debugger/debugger-view.tsx`：
  - **偏差3**：`chatMutation.mutateAsync({ message })` 从未传 `workflowId`，整个组件树里没有任何工作流选择 UI、没有 `listWorkflows` 调用。
- `packages/api/src/routers/debugger.ts`（feature 1/2 已改造过的现状）：`chat`/`getStatus` 已接入真实 Gemini 调用与降级，`PIPELINE_STEPS` 仍是写死 4 步。
- `packages/api/src/utils/gemini.ts`（feature 2 产物）：`isGeminiConfigured()` / `generateReply()` 直接复用，不重新实现。
- `packages/db/src/schema/knowledge.ts` + `packages/api/src/routers/knowledge.ts`：`document`/`documentChunk` 表与所有权校验模式（`doc.userId !== userId` → `FORBIDDEN`）作为 multimodal 节点检索鉴权的参考实现。
- `packages/api/src/utils/rag.ts`：`generateEmbedding()`（hash 向量）已存在，`searchSimilarChunks()` 待新增。

## 原子任务列表

- [x] **T-001**: 后端字段补全 —— `packages/db/src/schema/workflow.ts` 的 `NodeConfig` 新增 `maxRetries?: number; timeout?: number; knowledgeBaseId?: string`；`packages/api/src/routers/workflow.ts` 的 `nodeConfigSchema` 同步新增 `maxRetries: z.number().int().min(0).max(5).optional()`、`timeout: z.number().int().min(100).max(30000).optional()`、`knowledgeBaseId: z.string().optional()`
  - 文件: `packages/db/src/schema/workflow.ts`、`packages/api/src/routers/workflow.ts`
  - 验收: `tsc` 通过；通过 `workflow.update` 写入这三个字段后 `workflow.get` 能读回

- [x] **T-002**: 前端补全（偏差1/2修复）—— `config-panel.tsx`："全局配置"区域的两个静态 `<span>` 换成真实输入框（`<input type="number">`，min/max 与后端 zod 一致），接入 `handleChange("maxRetries", ...)`/`handleChange("timeout", ...)`；`multimodal` 节点的配置表单从"暂无可配置参数"占位改为一个 `<select>`，选项来自 `trpc.knowledge.list` 查询结果，绑定 `knowledgeBaseId`
  - 文件: `apps/web/src/app/orchestrator/components/config-panel.tsx`
  - 验收: 在 Orchestrator 里给某节点设置 maxRetries/timeout/knowledgeBaseId 后刷新页面，值仍正确显示（对应 AC-001）

- [x] **T-003**: 新建 `packages/api/src/utils/workflow-engine.ts`：定义 `StepResult`/`ExecutionResult` 类型，节点按 `x` 坐标排序，`context: { text, retrievedChunks? }` 在节点间传递，`withTimeout()` 包装每步执行，`haltOnError` 终止逻辑，`trigger` 节点执行函数
  - 文件: `packages/api/src/utils/workflow-engine.ts`
  - 验收: 单独跑一个只含 `trigger` 节点的最小 `nodes` 数组，`executeWorkflow()` 返回 `steps.length === 1`、`status: "completed"`

- [x] **T-004**: `condition` 节点启发式判定执行函数（文本长度 `< 2` 或命中预设关键词判定失败）+ `parallel` 节点拆分/并发聚合执行函数（复用 `rag.ts` 的 `chunkText` 思路按句子拆分，`Promise.all` 聚合）
  - 文件: `packages/api/src/utils/workflow-engine.ts`
  - 验收: 输入长度 1 的文本走 condition 节点判定失败；`haltOnError=true` 时引擎停止，`haltedAt` 被设置

- [x] **T-005**: `packages/api/src/utils/rag.ts` 新增 `searchSimilarChunks(knowledgeBaseId, queryText, topK=3)`（余弦相似度排序 `documentChunk.embedding`，校验 `document.userId === userId` 防越权）；`multimodal` 节点执行函数（关联了 `knowledgeBaseId` 时检索融合进 `context`，未关联时直通）
  - 文件: `packages/api/src/utils/rag.ts`、`packages/api/src/utils/workflow-engine.ts`
  - 验收: 关联了知识库的节点执行后 `context.retrievedChunks` 非空；跨用户尝试关联他人知识库时 `FORBIDDEN`

- [x] **T-006**: `llm_synthesis` 节点执行函数 —— 复用 `generateReply()`/`isGeminiConfigured()`（从 `gemini.ts` import，不重新实现），按节点 `config.maxRetries`（默认 0）固定延迟重试，重试耗尽 `status: "error"`，是否终止由 `haltOnError` 决定；该步成功文本即 `ExecutionResult.finalText`
  - 文件: `packages/api/src/utils/workflow-engine.ts`
  - 验收: 复用 feature 2 的降级路径——未配置 key 时仍走模拟回复兜底，不抛错

- [x] **T-007**: `packages/api/src/routers/debugger.ts`：`chat` mutation 改为 `nodes.length > 0` 时调用 `executeWorkflow()`（`steps`/`finalText` 替换原写死映射），`nodes.length === 0` 时保留 feature 1/2 已有的单步模拟/真实 LLM 兼容路径；`getSteps` 改为接收可选 `workflowId`，返回所选工作流的真实节点预览列表，不传时回退占位说明
  - 文件: `packages/api/src/routers/debugger.ts`
  - 验收: 传 `workflowId` 时 `steps` 数量与该工作流节点数一致；不传时行为与 feature 1/2 验证过的现状一致（不回归）

- [x] **T-008**: 前端补全（偏差3修复）—— `debugger-view.tsx` 新增工作流选择器（用已有的 `trpc.debugger.listWorkflows` 查询填充一个 `<select>`），选中后传入 `chatMutation.mutateAsync({ message, workflowId })` 与 `getSteps({ workflowId })`；移除 `STEP_DELAY` 本地动画状态机，改为直接渲染 mutation 返回的真实 `steps` 数组（任意数量，`status` 映射现有视觉样式，`halted` 状态显示 `detail` 终止原因）
  - 文件: `apps/web/src/components/debugger/debugger-view.tsx`、`apps/web/src/components/debugger/step-cards.tsx`（如需调整 props 以支持任意数量/新状态字段）
  - 验收: 浏览器里选中一个工作流发消息，轨迹面板按真实节点顺序展示，数量与节点数一致（对应 AC-002）

- [x] **T-009**: 端到端手动验证 AC-001~AC-006
  - 文件: 无（验证任务）
  - 验收: 见下方"验收标准核验计划"

## 验收标准核验计划

| AC | 验证方式 |
|---|---|
| AC-001 | 浏览器 Orchestrator 设置 `maxRetries=2,timeout=3000`，刷新页面值仍显示 |
| AC-002 | 浏览器创建 5 节点工作流，Debugger 选中后发消息，轨迹按真实顺序/数量展示 |
| AC-003 | condition 节点设 `haltOnError=true` 且输入触发判定失败，后续步骤标记未执行，回复说明终止原因 |
| AC-004 | llm_synthesis 节点自定义 systemInstruction/temperature，沿用 feature 2 已验证的真实调用能力（若无真实 key，复用 feature 2 已记录的延后约定） |
| AC-005 | multimodal 节点关联一个已上传文档的知识库，回复体现引用了检索片段 |
| AC-006 | 临时把某节点 `timeout` 调到极小值（如 1ms），该步被标记 error/timeout 而非无限等待 |

## 技术方案

- 执行顺序：按节点 `x` 坐标排序，不引入显式连线/有向图结构（与 design.md 技术决策一致，当前 schema 本就没有 edge 概念）。
- 检索质量：复用现有 hash-based `generateEmbedding`，新增余弦相似度排序，非真实语义向量模型——AC-005 只验证"确实引用了片段"，不要求语义高度相关。
- 重试/超时：引擎层统一包装（`withTimeout` + 固定延迟重试），不在每个节点函数内各自实现，避免重复代码。

## 安全影响评估

- **敏感数据流转**：`multimodal` 节点检索知识库内容会拼入发给 Gemini 的 prompt——这是 F-006 预期行为；检索前必须校验 `document.userId === ctx.session.user.id`，复用 `knowledge.ts` 现有所有权校验模式，防止跨用户读取他人知识库（design.md 安全考虑已指出，T-005 落地）。
- **新外部依赖**：无新增第三方包，复用 feature 2 的 `@google/genai` 与现有 `rag.ts` 基础设施。
- **关键输入点校验**：`maxRetries`(0-5)/`timeout`(100-30000ms) 的 zod 范围与前端 `config-panel.tsx` 输入框的 min/max 保持一致，防止用户配置出导致服务端长时间挂起或过度重试的极端值；每个节点执行都有 `withTimeout` 上限，防止单个异常输入拖垮请求。
- **越权访问**：`multimodal` 节点的 `knowledgeBaseId` 来自用户在 Orchestrator 里保存的配置，执行时仍需在 `searchSimilarChunks` 内部重新校验所属关系，不能假设"既然配置里写了就一定是本人的"（配置数据本身也可能被篡改或复制自其他工作流）。

## 潜在风险

- T-002/T-008 涉及前端表单与状态管理改动，范围比 design.md 原计划更大（已与用户确认，按"扩大范围"处理），需要额外的浏览器手动验证。
- `parallel` 节点的"并发聚合"是语义模拟（清洗/合并），不接入真实外部并行系统，符合 F-005 的沙盒环境要求。
- AC-005 依赖知识库内已有至少一个 `ready` 状态的文档；若当前账号下没有已上传文档，T-009 验证前需要先通过 Knowledge Base 页面上传一个测试文档。
- AC-004 的"真实调用"部分如果环境仍无可用 `GEMINI_API_KEY`，会延续 feature 2 已记录的延后约定，只验证降级路径与配置传参的代码正确性。

---

请确认是否可以开始执行 Feature 3 的开发？如有修改意见请告知。
