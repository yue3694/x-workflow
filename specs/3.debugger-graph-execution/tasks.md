# Debugger Graph Execution — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/3.debugger-graph-execution/

## 任务列表

### 功能 1: 前置修复 — NodeConfig 字段补全

- [ ] T-001: `packages/db/src/schema/workflow.ts` 的 `NodeConfig` 与 `packages/api/src/routers/workflow.ts` 的 `nodeConfigSchema` 同步新增 `maxRetries` / `timeout` / `knowledgeBaseId` 字段 ~15min

### 功能 2: 执行引擎核心与简单节点

- [ ] T-002: 新建 `packages/api/src/utils/workflow-engine.ts`：节点排序（按 x 坐标）、`context` 传递、`withTimeout` 包装、`haltOnError` 终止逻辑、`trigger` 节点执行函数 ~30min
- [ ] T-003: 实现 `condition` 节点启发式判定执行函数与 `parallel` 节点拆分/并发聚合执行函数 ~30min

### 功能 3: 知识库融合与 LLM 节点

- [ ] T-004: `packages/api/src/utils/rag.ts` 新增 `searchSimilarChunks()` 余弦相似度检索函数；实现 `multimodal` 节点执行函数（关联知识库时检索融合，未关联时直通） ~30min
- [ ] T-005: 实现 `llm_synthesis` 节点执行函数，复用 `2.debugger-llm-integration` 的 `generateReply()`/`isGeminiConfigured()`，按 `maxRetries` 重试 ~30min

### 功能 4: 接口与前端接入

- [ ] T-006: `packages/api/src/routers/debugger.ts` 的 `chat` mutation 改为调用 `executeWorkflow()`；`getSteps` 改为按 `workflowId` 返回真实节点预览列表 ~30min
- [ ] T-007: `apps/web/src/components/debugger/debugger-view.tsx` 移除 `STEP_DELAY` 本地动画状态机，改为按后端返回的 `steps` 数组（任意数量、含 status/duration/detail）渲染轨迹面板 ~30min

### 集成与测试

- [ ] T-008: 端到端手动验证 AC-001~AC-006：字段持久化、真实节点顺序展示、条件终止、LLM 节点配置生效、知识库融合、超时处理 ~30min

## 依赖关系

- T-002 依赖 T-001
- T-003 依赖 T-002
- T-004 依赖 T-002（context 结构已定义）
- T-005 依赖 T-002，并依赖 `2.debugger-llm-integration` 的 `2.T-002`、`2.T-004`（真实 Gemini 调用能力）
- T-006 依赖 T-003、T-004、T-005（所有节点执行函数齐备）
- T-007 依赖 T-006（前端需要后端新的 `steps` 响应结构）
- T-008 依赖 T-001 至 T-007 全部完成

## 风险点

- `multimodal` 节点的相似度检索基于现有"简化 hash 向量"（非真实语义 embedding），检索质量有限，AC-005 验证时只能确认"确实引用了知识库片段"，不能期待语义相关性达到真实向量模型水平——若后续需要提升检索质量，需要单独的 PRD 评估升级到真实 embedding API。
- 按 `x` 坐标排序作为执行顺序的简化方案，若用户在画布上把节点摆放得与逻辑顺序不一致（例如把后续节点拖到了左边），执行顺序会与用户预期不符；本次不引入显式连线/有向图结构来解决这个问题，已在 design.md 技术决策中说明取舍。
