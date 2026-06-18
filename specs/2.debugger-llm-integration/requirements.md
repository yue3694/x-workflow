# Debugger LLM Integration — 需求规格

## 概述

将 Debugger 沙盒聊天的回复从写死的随机模板替换为对 Google Gemini 的真实调用，使用对应工作流中 `llm_synthesis` 节点配置的模型/系统指令/温度参数；在未配置密钥或调用失败时优雅降级为模拟回复。

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo (Better-T-Stack)

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始需求 |

## 背景与现状

- `packages/api/src/routers/debugger.ts` 的 `chat` mutation 当前从 `RESPONSE_TEMPLATES` 数组中随机选取一句固定文案返回（第 39-44、123-126 行），并人为 `setTimeout` 200-500ms 模拟延迟。
- `getStatus` 查询当前**硬编码** `{ connected: true }`（第 60-66 行），与是否真的配置了 LLM key 无关，前端徽章显示的"已连接"信息是假的。
- 项目当前 `packages/env/src/server.ts` 未声明任何 LLM 相关密钥（无 `GEMINI_API_KEY`）。
- 已与用户确认：本次使用 **Google Gemini**，与设计原型一致（原型使用 `gemini-3.5-flash`，原型 `server.ts` 使用 `@google/genai` SDK 可参考其调用方式）。
- 本 feature **不**实现完整的节点图执行引擎（trigger/condition/parallel/multimodal 仍是 UI 展示性的 4 步可视化），只把"调用 LLM 拿到真实回复"这一核心环节做实——节点图执行引擎是 [[3.debugger-graph-execution]] 的范围。

## 用户故事

- 作为开发者，我想在 Debugger 中输入测试消息后，看到 Gemini 真实生成的回复，而不是几句固定模板循环。
- 作为没有配置 API key 的开发者，我仍然希望 Debugger 能正常工作（自动回退到模拟模式），并清楚地看到"未连接"提示。

## 功能需求

1. [F-001] `packages/env/src/server.ts` 新增 `GEMINI_API_KEY`（可选，允许应用在未配置时仍能启动）。
2. [F-002] `debugger.chat` mutation 在检测到有效 `GEMINI_API_KEY` 时，使用所选工作流 `llm_synthesis` 节点的 `model` / `systemInstruction` / `temperature` 配置真实调用 Gemini API，返回模型生成的文本。
3. [F-003] 未配置或密钥无效时，保留现有模拟回复逻辑作为兼容降级路径，不让请求报错。
4. [F-004] Gemini 调用失败（网络错误、限流等）时捕获异常，记录日志并降级为模拟回复，而不是让整个 mutation 抛 500。
5. [F-005] `debugger.getStatus` 返回值与 `GEMINI_API_KEY` 是否真实配置且可用保持一致（不再硬编码 `connected: true`）。

## 非功能需求

- 性能: 单次 Gemini 调用增加的延迟可接受（无需流式响应，本次范围为非流式一次性返回）。
- 安全: `GEMINI_API_KEY` 仅服务端可见，通过 `packages/env` 校验后使用，不出现在前端 bundle 或日志全文中。
- 兼容性: 前端现有的"已连接 / 未连接 Gemini"徽章文案（中英文）无需新增文案，只需保证其展示的状态真实。

## 验收标准

- [ ] [AC-001] 配置有效 `GEMINI_API_KEY` 后，在 Debugger 输入消息并发送，收到的回复内容明显是模型生成的（非 `RESPONSE_TEMPLATES` 中的固定句子）。
- [ ] [AC-002] 不配置 `GEMINI_API_KEY` 时，应用仍能正常启动且 Debugger 聊天可用（走模拟回复路径），前端徽章显示"未连接"。
- [ ] [AC-003] 配置了无效/过期的 key 导致 Gemini 调用失败时，聊天仍返回一句降级回复而不是报错弹窗。
- [ ] [AC-004] 选中一个带有自定义 `systemInstruction` 和 `temperature` 的工作流后，真实 Gemini 调用确实带上了这些参数（可通过临时日志或回复内容差异验证）。

## 依赖

- Google Gemini API（`@google/genai` SDK 或等价 REST 调用）
- `GEMINI_API_KEY` 环境变量

## 开放问题

无（LLM 供应商已在 PRD 阶段与用户确认为 Google Gemini；执行深度已确认本 feature 只做"真实 LLM 调用"，完整节点图执行留给 [[3.debugger-graph-execution]]）。
