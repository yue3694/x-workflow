# Debugger LLM Integration — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 后端 API (`packages/api`)、环境变量 (`packages/env`)。本 feature 不改动前端组件（前端已经在调用 `trpc.debugger.chat` / `getStatus`，只是后端返回值从假变真）。

## 功能模块设计

### 模块 1: Gemini Client 封装

**涉及层及关键设计:**

- 新建 `packages/api/src/utils/gemini.ts`：
  - 用 `@google/genai` SDK（与设计原型 `docs/server.ts` 一致的依赖）初始化 client，构造函数读取 `env.GEMINI_API_KEY`。
  - 导出 `isGeminiConfigured(): boolean`——校验 key 存在且非空字符串（参考原型 `server.ts` 中"排除默认占位字符串"的校验思路）。
  - 导出 `generateReply({ message, systemInstruction, temperature, model }): Promise<string>`——调用 Gemini `generateContent`，model 默认 `"gemini-3.5-flash"`（与原型/Orchestrator 节点配置的模型下拉一致）。
  - 该函数内部 try/catch 网络异常，异常向上抛出由调用方决定降级，不在此处吞掉错误（错误处理职责留给路由层，遵循"只在边界做校验/兜底"的原则）。

### 模块 2: `debugger.chat` 接入真实调用 + 降级

**涉及层及关键设计:**

- `packages/api/src/routers/debugger.ts`：
  - 保留现有读取 `workflowId` → 解析 `llmConfig`（model/systemInstruction/temperature）的逻辑（已实现，不改）。
  - 在生成回复前，替换原来的"随机选模板 + setTimeout 模拟延迟"逻辑：
    ```ts
    const replyText = isGeminiConfigured()
      ? await generateReply({
          message: input.message,
          systemInstruction: llmConfig.systemInstruction ?? "Summarize the input concisely.",
          temperature: llmConfig.temperature ?? 0.7,
          model: llmConfig.model ?? "gemini-3.5-flash",
        }).catch((err) => {
            console.error("[debugger.chat] Gemini call failed, falling back to simulation", err);
            return pickSimulatedReply();
          })
      : pickSimulatedReply();
    ```
  - 把现有"从 `RESPONSE_TEMPLATES` 随机选一句"的逻辑抽成 `pickSimulatedReply()` 辅助函数，作为未配置 key 或调用失败时的降级路径，而不是删除（保留模拟模式能力，满足 F-003/F-004）。
  - `fullResponse` 拼接 LLM 配置信息的现有逻辑保留。

### 模块 3: `debugger.getStatus` 返回真实连接状态

**涉及层及关键设计:**

- `getStatus` 查询改为：
  ```ts
  getStatus: protectedProcedure.query(() => ({
    connected: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })),
  ```
- 前端无需改动：现有徽章逻辑已经根据 `getStatus` 返回的 `connected` 字段切换"已连接/未连接 Gemini"文案样式。

## 接口契约

| Procedure | 类型 | Input | Output | 变化点 |
| --- | --- | --- | --- | --- |
| `debugger.chat` | mutation | `{ message, workflowId? }`（不变） | `{ response, llmConfig, steps }`（结构不变，`response` 内容来源变为真实/降级） | 内部实现替换，接口签名不变，前端无需改动 |
| `debugger.getStatus` | query | 无（不变） | `{ connected, timestamp, version }`（`connected` 现在反映真实配置状态） | 内部实现替换，签名不变 |

## 数据模型

无新增/变更数据表。

## 安全考虑

- `GEMINI_API_KEY` 仅通过 `packages/env/src/server.ts` 校验后读取，不直接 `process.env.GEMINI_API_KEY`。
- Gemini 调用失败日志中避免打印完整 API key 或用户消息全文中的敏感信息（仅记录错误对象）。
- `GEMINI_API_KEY` 设为 zod `.optional()`，允许应用在未配置时正常启动（不应强制要求每个开发环境都配置真实密钥）。

## 技术决策

| 决策 | 选项 | 理由 |
| ---- | ---- | ---- |
| LLM SDK | `@google/genai`（与设计原型一致） | 原型 `docs/server.ts` 已验证可行的调用方式，迁移成本最低 |
| 降级策略 | 保留现有模拟模板作为 fallback，而非要求强制配置 key | 与现有 `.claude/rules` "环境变量校验但允许可选"的模式一致，保证本地无 key 也能开发调试 |
| 执行范围 | 仅替换"调用 LLM 拿真实回复"这一步，不实现完整节点图引擎 | 已与用户确认拆分到 [[3.debugger-graph-execution]]，本 feature 聚焦最高价值的最小修复 |
