# Debugger Graph Execution — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 后端 API (`packages/api`)、数据库 schema 类型 (`packages/db`)、前端 (`apps/web` Debugger 组件)
- 依赖 [[2.debugger-llm-integration]] 的 `packages/api/src/utils/gemini.ts`

## 功能模块设计

### 模块 1: 修复 NodeConfig 字段缺失（前置修复）

**涉及层及关键设计:**

- `packages/db/src/schema/workflow.ts` 的 `NodeConfig` interface 新增：
  ```ts
  export interface NodeConfig {
    url?: string;
    haltOnError?: boolean;
    model?: string;
    systemInstruction?: string;
    temperature?: number;
    maxRetries?: number;
    timeout?: number;
  }
  ```
- `packages/api/src/routers/workflow.ts` 的 `nodeConfigSchema` 同步新增：
  ```ts
  maxRetries: z.number().int().min(0).max(5).optional(),
  timeout: z.number().int().min(100).max(30000).optional(),
  ```
  （取值范围参考 Orchestrator `config-panel.tsx` 现有输入框的合理边界）
- 不需要数据库 migration（`nodes` 列本身是 JSON 字符串），只是 TS 类型与 zod 校验补全。

### 模块 2: 执行引擎核心

**涉及层及关键设计:**

- 新建 `packages/api/src/utils/workflow-engine.ts`，导出 `executeWorkflow({ nodes, userId, message }): Promise<ExecutionResult>`。
- 节点执行顺序：将 `nodes` 按 `x` 坐标升序排序（与 Orchestrator 画布的左→右视觉顺序一致，沿用现状不引入额外的"连线"数据结构，因为当前 schema 里节点之间没有显式 edge）。
- `ExecutionResult` 结构：
  ```ts
  interface StepResult {
    nodeId: string;
    type: NodeType;
    name: string;
    status: "completed" | "halted" | "error";
    durationMs: number;
    detail?: string; // 人类可读的结果摘要，用于前端轨迹展示
  }
  interface ExecutionResult {
    steps: StepResult[];
    finalText: string;
    haltedAt?: string; // nodeId，如果提前终止
  }
  ```
- 引擎主循环：逐节点 `switch (node.type)` 分发到对应执行函数（见模块 3-6），累积一个 `context: { text: string; retrievedChunks?: string[] }` 在节点间传递；每个节点执行都包一层 `withTimeout(fn, node.config.timeout ?? 5000)`，超时则该步标记 `status: "error"`、`detail: "timeout"`。
- 若某步 `status !== "completed"` 且该节点 `config.haltOnError === true`，立即停止循环，记录 `haltedAt`，后续节点不出现在 `steps` 中（前端据此判断"未执行"）。

### 模块 3: trigger 节点执行

**涉及层及关键设计:**

- 沙盒环境，不发起真实 HTTP 请求。执行函数仅记录 `detail: "Trigger received input via configured endpoint: ${config.url ?? '(none)'}"`，把原始用户消息写入 `context.text`，状态始终 `completed`（无外部依赖、不会失败）。

### 模块 4: condition 节点执行

**涉及层及关键设计:**

- 启发式判定函数（无需引入额外 NLP 依赖，保持轻量）：基于 `context.text` 做规则判定，例如：
  - 文本长度 `< 2` 字符 → 判定失败（"输入过短，无法分类"）。
  - 命中预设的敏感词/格式异常关键词 → 判定失败。
  - 其余情况判定通过。
- 判定结果写入 `detail`（如 "Classification passed: general query" / "Classification failed: input too short"）；判定失败时 `status: "error"`，是否终止取决于该节点的 `haltOnError`。

### 模块 5: parallel 节点执行

**涉及层及关键设计:**

- 把 `context.text` 按句子边界拆分为多个子任务（复用 `packages/api/src/utils/rag.ts` 里 `chunkText` 的拆分思路，避免重复实现拆分算法——若其 chunk 粒度不合适可在 engine 内用更小的句子级 `split`，但优先复用而非重新发明）。
- 用 `Promise.all` 并发"处理"每个子任务（处理逻辑：简单清洗/合并，不调用外部服务），然后合并结果写回 `context.text`，`detail` 记录"Fanned out into N segments, aggregated".

### 模块 6: multimodal 节点执行

**涉及层及关键设计:**

- 若该节点 `config` 中存在知识库关联标识（沿用前端 Orchestrator UI 现有的"已关联索引"展示，具体字段命名以现有 `NodeConfig` 为准，本次新增一个可选 `knowledgeBaseId?: string` 字段，同步加入模块 1 的 schema 修复范围内）：
  - 调用 `packages/api/src/utils/rag.ts` 新增的检索函数 `searchSimilarChunks(knowledgeBaseId, queryText, topK=3)`：基于现有 `generateEmbedding()`（简化 hash 向量)对 `document_chunk.embedding` 做余弦相似度排序，取 top-K（这是本 feature 唯一需要新增的 RAG 能力，复用而非重建已有的 embedding/chunk 基础设施）。
  - 把检索到的片段拼入 `context.retrievedChunks`，并融合进 `context.text`（如 "结合以下参考资料回答：...\n\n用户问题：..."）。
- 若未关联知识库，直接 `detail: "No knowledge base linked, passing through raw context"`，不做检索。

### 模块 7: llm_synthesis 节点执行（复用 feature 2）

**涉及层及关键设计:**

- 直接调用 [[2.debugger-llm-integration]] 实现的 `generateReply()` / `isGeminiConfigured()`（从 `packages/api/src/utils/gemini.ts` import），传入 `context.text` 作为 `message`，节点的 `systemInstruction/temperature/model` 作为参数。
- 按节点 `config.maxRetries`（默认 0）做失败重试：每次失败间隔可用简单的固定延迟（不引入指数退避库，保持实现简单），重试耗尽后该步 `status: "error"`，`detail` 记录最后一次错误信息，是否终止由 `haltOnError` 决定（若不终止，`finalText` 退化为 [[2.debugger-llm-integration]] 已有的模拟回复兜底）。
- 这一步执行成功后的文本即为 `ExecutionResult.finalText`。

### 模块 8: `debugger.chat` 改为调用引擎

**涉及层及关键设计:**

- `packages/api/src/routers/debugger.ts` 的 `chat` mutation：
  - 仍按现有逻辑读取 `workflowId` 对应的 `nodes`（鉴权：`record.userId === userId`，沿用现状）。
  - 若 `nodes.length === 0`（未选择工作流或工作流为空），保留现状的"无工作流时走单步模拟/真实 LLM 回复"逻辑作为兼容路径，避免破坏未选择工作流时的可用性。
  - 否则调用 `executeWorkflow({ nodes, userId, message: input.message })`，把 `ExecutionResult.steps` 映射为响应里的 `steps` 字段（替换原来的 `PIPELINE_STEPS.map(...)` 写死映射），`finalText` 作为 `response`。
  - 移除不再使用的 `PIPELINE_STEPS` 常量（保留 `getSteps` query 的对外契约，但其返回值改为查询所选工作流的真实节点列表，供前端在"选择工作流但还未发消息"时也能预览步骤——若不传 `workflowId` 则回退到一个通用占位说明，而不是写死的 4 条）。

### 模块 9: 前端轨迹面板按真实步骤渲染

**涉及层及关键设计:**

- `apps/web/src/components/debugger/debugger-view.tsx`：移除 `STEP_DELAY` 计时器驱动的本地动画状态机，改为直接渲染 `chat` mutation 返回的 `steps` 数组（`status` 映射到现有的"完成/进行中/未执行"视觉样式；`halted` 状态额外显示终止原因 `detail`）。
- 步骤数量从固定 4 个改为 `steps.length`（任意数量），需要调整布局为可滚动列表而非固定 4 卡片网格（沿用现有卡片样式，仅改为基于数组动态渲染）。

## 接口契约

| Procedure | 类型 | Input | Output | 变化点 |
| --- | --- | --- | --- | --- |
| `debugger.chat` | mutation | `{ message, workflowId? }`（不变） | `{ response, llmConfig, steps: StepResult[] }`（`steps` 结构变化：增加 `status/durationMs/detail`，数量不再固定为 4） | 内部改为调用 `executeWorkflow`，前端需要适配新的 `steps` 形状 |
| `debugger.getSteps` | query | `{ workflowId? }`（新增可选参数） | 所选工作流的真实节点预览列表，或未选择时的占位说明 | 输入新增参数，输出语义变化 |

## 数据模型

- `packages/db/src/schema/workflow.ts` 的 `NodeConfig` 新增 `maxRetries?: number`、`timeout?: number`、`knowledgeBaseId?: string`（均为 JSON 字段内的可选属性，无需 migration）。
- 不新增数据表；复用 `document` / `document_chunk`（知识库）现有表做检索。

## 安全考虑

- 执行引擎内的所有"外部调用"（仅 `llm_synthesis` 一步）均复用 [[2.debugger-llm-integration]] 已落地的密钥校验与错误处理，不在引擎层重复实现密钥读取逻辑。
- `multimodal` 节点检索知识库时，必须校验该 `knowledgeBaseId` 对应文档属于当前 `userId`（沿用 `knowledge.ts` 路由现有的所有权校验模式），避免跨用户读取他人知识库内容。
- 每个节点执行都有 `timeout` 上限，避免单个恶意/异常输入导致请求无限挂起拖垮服务端。

## 技术决策

| 决策 | 选项 | 理由 |
| ---- | ---- | ---- |
| 节点执行顺序判定 | 按 `x` 坐标排序，而非引入显式 edge/连线数据结构 | 当前 schema 本来就没有连线概念，引入图结构是超出本次范围的大改动；按画布视觉顺序执行已能满足"轨迹与所搭工作流对应"的核心需求 |
| 知识库检索方式 | 复用现有 hash-based `generateEmbedding`，新增简单余弦相似度排序 | 真实向量检索（如外部向量数据库）超出本次范围；现有 embedding 基础设施已经存在，只是从未被查询过，补一个最小检索函数即可满足 multimodal 节点的语义 |
| 重试/超时落地位置 | 引擎层统一包装，而非在每个节点函数内各自实现 | 避免重复代码，`maxRetries`/`timeout` 是所有节点类型共享的运行时策略（沿用原型 Node.config 的设计意图） |
