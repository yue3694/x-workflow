# Debugger Graph Execution — 需求规格

## 概述

把 Debugger 的"4 步执行轨迹"从写死的可视化动画，改造成真正按已保存工作流的节点图（trigger → condition → parallel → multimodal → llm_synthesis）顺序执行的引擎：每种节点类型都执行对应的真实逻辑，并把每一步的真实结果/耗时回传给前端轨迹 UI。

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo (Better-T-Stack)

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始需求 |

## 背景与现状

- `packages/api/src/routers/debugger.ts` 的 `PIPELINE_STEPS` 是写死的 4 个步骤名称（Webhook Gateway / Security & Routing / Distributed Knowledge / Cognitive LLM Synthesis），与用户实际保存的工作流节点**没有任何关联**——无论工作流里配置了哪些节点、什么顺序，Debugger 都只走这 4 个固定步骤。
- 前端 `apps/web/src/components/debugger/debugger-view.tsx` 用固定的 `STEP_DELAY` 顺序点亮 4 个步骤做动画，与后端处理进度无关，纯粹是前端计时器驱动的"进度剧场"。
- `packages/db/src/schema/workflow.ts` 的 `NodeConfig` 类型目前只有 `url / haltOnError / model / systemInstruction / temperature`，**缺少** `maxRetries / timeout`；而 Orchestrator 前端 `config-panel.tsx` 已经有这两个字段的输入框，但 `packages/api/src/routers/workflow.ts` 的 `nodeConfigSchema` 没有声明这两个字段，保存时会被 zod 静默丢弃——这是一个已存在的 bug，本 feature 需要先修复它，否则执行引擎读不到用户配置的重试/超时策略。
- 依赖 [[2.debugger-llm-integration]]：本 feature 的 `llm_synthesis` 节点执行步骤复用该 feature 实现的真实 Gemini 调用（`packages/api/src/utils/gemini.ts`），不重复实现。
- 已与用户确认采用"完整节点图执行"方案（而非仅替换 LLM 回复的轻量方案）。

## 用户故事

- 作为工作流设计者，我想在 Debugger 里测试我搭建的工作流时，看到的执行步骤真的对应我在 Orchestrator 里搭的节点（包括它们的类型、顺序、配置），而不是 4 个与我的设计无关的固定步骤。
- 作为工作流设计者，我想在某个 condition 节点配置了 `haltOnError` 且条件判定失败时，整条流水线真的停在那一步，后续节点不会被执行。

## 功能需求

1. [F-001] 修复 `NodeConfig` / `nodeConfigSchema` 缺失 `maxRetries`、`timeout` 字段的问题，使 Orchestrator 中配置的这两项能真正持久化到数据库。
2. [F-002] 新增工作流执行引擎：按所选工作流 `nodes` 数组的顺序（以 `x` 坐标从左到右排序，与 Orchestrator 画布的视觉顺序一致）依次执行每个节点。
3. [F-003] `trigger` 节点：作为入口，记录触发信息（如配置的 `url`），不做实际外部请求（沙盒环境，不能对真实第三方系统发起调用）。
4. [F-004] `condition` 节点：执行启发式条件判定（基于用户输入文本做简单规则判定，如关键词/长度等），判定失败且该节点 `haltOnError=true` 时终止后续节点执行，并把终止原因返回给前端。
5. [F-005] `parallel` 节点：模拟"并行分发"——把输入拆分为多个子任务（如分句/分块）并发处理后聚合结果，体现"高吞吐分发"的语义，不依赖真实外部并行系统。
6. [F-006] `multimodal` 节点：若配置了 `connectedIndex`（关联知识库），从 [[Knowledge Base]] 已有的 RAG 检索能力中取回相关上下文片段并与用户输入融合；若未关联知识库，直接传递原始上下文。
7. [F-007] `llm_synthesis` 节点：复用 `2.debugger-llm-integration` 实现的真实 Gemini 调用，传入累积的上下文与节点配置的 `model/systemInstruction/temperature`，并尊重该节点配置的 `maxRetries`（失败重试次数）与 `timeout`（单步超时毫秒数）。
8. [F-008] `debugger.chat` mutation 按真实节点图执行后，返回每一步的真实状态（`completed` / `halted` / `error`）、真实耗时、以及最终回复文本，供前端轨迹 UI 渲染。
9. [F-009] 前端 Debugger 轨迹面板按后端返回的真实步骤列表渲染（节点类型、名称、状态、耗时），不再使用前端固定 `STEP_DELAY` 计时器驱动的动画;若工作流节点数与原 4 步不一致，轨迹面板需要能展示任意数量的步骤。

## 非功能需求

- 性能: 单次 chat 请求总耗时应在所有节点的 `timeout` 总和的合理范围内（不应无限阻塞）；引擎需要在每个节点上强制执行其 `timeout` 配置。
- 健壮性: 任意一步抛出非预期异常时，引擎应捕获并把该步骤标记为 `error`，按 `haltOnError` 决定是否继续后续步骤，而不是让整个 HTTP 请求 500。
- 兼容性: 现有"未配置 Gemini key 时降级模拟回复"的能力（来自 [[2.debugger-llm-integration]]）必须在新引擎下继续有效。

## 验收标准

- [ ] [AC-001] 保存 `maxRetries=2, timeout=3000` 的 `llm_synthesis` 节点后，重新打开该工作流，配置值仍正确显示（验证 F-001 持久化修复）。
- [ ] [AC-002] 创建一个包含 5 种节点类型、按 Orchestrator 画布顺序排列的工作流，在 Debugger 选中该工作流发消息后，轨迹面板按真实节点顺序逐一展示，数量与节点数一致(而非固定 4 步)。
- [ ] [AC-003] 给某个 `condition` 节点设置会判定失败的输入且 `haltOnError=true` 时，该节点之后的节点状态显示为未执行/已终止，最终回复中说明了终止原因。
- [ ] [AC-004] `llm_synthesis` 节点配置的 `model/systemInstruction/temperature` 在引擎执行时真实生效（沿用 [[2.debugger-llm-integration]] 已验证的真实调用能力）。
- [ ] [AC-005] 关联了知识库的 `multimodal` 节点执行后，最终回复体现出引用了知识库中的内容（可通过检索到的片段文本比对验证）。
- [ ] [AC-006] 人为让某节点执行超过其 `timeout` 配置（如临时调小 timeout 到极小值测试），该步骤被标记为超时/error 而不是无限等待。

## 依赖

- [[2.debugger-llm-integration]]（复用其真实 Gemini 调用能力）
- 已有的 Knowledge Base RAG 检索能力（`packages/api/src/utils/rag.ts`）

## 开放问题

无（执行深度已在 PRD 阶段与用户确认为"完整节点图执行"）。
