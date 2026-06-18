# Debugger LLM Integration — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/2.debugger-llm-integration/

## 任务列表

### 功能 1: Gemini Client 封装

- [ ] T-001: `packages/env/src/server.ts` 新增可选的 `GEMINI_API_KEY` zod 校验项 ~15min
- [ ] T-002: `packages/api` 加入 `@google/genai` 依赖，新建 `packages/api/src/utils/gemini.ts`（`isGeminiConfigured()` + `generateReply()`） ~30min

### 功能 2: chat mutation 接入真实调用与降级

- [ ] T-003: `packages/api/src/routers/debugger.ts` 抽取 `pickSimulatedReply()` 辅助函数（复用现有 `RESPONSE_TEMPLATES` 随机逻辑） ~15min
- [ ] T-004: `chat` mutation 改为：配置了有效 key 时调用 `generateReply()`，否则/失败时降级为 `pickSimulatedReply()` ~30min

### 功能 3: 真实连接状态

- [ ] T-005: `getStatus` 查询改为返回 `isGeminiConfigured()` 的真实结果，移除硬编码 `connected: true` ~15min

### 集成与测试

- [ ] T-006: 手动验证三种场景：(a) 配置有效 key 时收到真实 Gemini 回复且徽章显示已连接，(b) 不配置 key 时走模拟回复且徽章显示未连接，(c) 配置无效 key 时调用失败仍降级返回而不报错 ~15min

## 依赖关系

- T-002 依赖 T-001
- T-004 依赖 T-002、T-003
- T-005 依赖 T-001
- T-006 依赖 T-004、T-005
- 本 feature 完成后，`3.debugger-graph-execution` 的 `3.T-005`（复用真实 LLM 调用作为引擎最后一步）将依赖本 feature 的 T-002/T-004。

## 风险点

- `@google/genai` SDK 版本与原型使用的版本可能不完全一致，实现时需核对当前可安装版本的 API 形态（`generateContent` 调用签名）。
- 若团队尚未申请到可用的 Gemini API key，T-006 中"真实回复"场景的验证需要延后到 key 到位后补测，可先完成 (b)(c) 两种降级场景的验证。
