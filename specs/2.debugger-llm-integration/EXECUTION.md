# Feature 2: debugger-llm-integration — 执行计划 (N2)

## 目标描述

将 `packages/api/src/routers/debugger.ts` 的 `chat` mutation 从写死的模板随机回复，替换为对 Google Gemini 的真实调用（使用所选工作流 `llm_synthesis` 节点的 model/systemInstruction/temperature），未配置或调用失败时优雅降级为模拟回复；`getStatus` 同步反映真实的 Gemini 配置状态。

## 已读取的上下文

- `specs/2.debugger-llm-integration/{requirements,design,tasks}.md`
- 当前实现：`packages/api/src/routers/debugger.ts`（`getStatus` 硬编码 `connected: true`；`chat` 用 `setTimeout` 模拟延迟 + `RESPONSE_TEMPLATES` 随机选句）
- 当前 `packages/env/src/server.ts`：无任何 LLM 相关 key，已有 `RESEND_API_KEY` 等 `.optional()` 的先例模式可直接复用
- 设计原型参考 `docs/server.ts`（已验证可行的 `@google/genai` 调用方式）+ `docs/package.json`（`"@google/genai": "^2.4.0"`）：
  ```ts
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: message,
    config: { systemInstruction, temperature },
  });
  // response.text 即生成文本
  ```

## 原子任务列表

- [x] **T-001**: `packages/env/src/server.ts` 新增 `GEMINI_API_KEY: z.string().min(1).optional()`（沿用 `RESEND_API_KEY` 的可选模式）
  - 文件: `packages/env/src/server.ts`
  - 验收: `pnpm dev:server` 在不设置该变量时仍能正常启动

- [x] **T-002**: `packages/api` 新增依赖 `@google/genai`（版本对齐原型 `^2.4.0` 或当前可安装的兼容版本），新建 `packages/api/src/utils/gemini.ts`
  - 导出 `isGeminiConfigured(): boolean` — 校验 `env.GEMINI_API_KEY` 存在、非空、非占位字符串（如 `"MY_GEMINI_API_KEY"`，参考原型校验思路）
  - 导出 `generateReply({ message, systemInstruction, temperature, model }): Promise<string>` — 调用 `ai.models.generateContent`，内部不 catch，异常向上抛给调用方决定降级
  - 文件: `packages/api/package.json`、`packages/api/src/utils/gemini.ts`
  - 验收: `tsc` 通过；未设置 key 时 `isGeminiConfigured()` 返回 `false`

- [x] **T-003**: `packages/api/src/routers/debugger.ts` 抽取 `pickSimulatedReply()` 辅助函数，复用现有 `RESPONSE_TEMPLATES` 随机选句逻辑（不删除模拟模板，作为降级路径保留）
  - 文件: `packages/api/src/routers/debugger.ts`
  - 验收: 抽取后行为与原逻辑等价（仍是随机选一句）

- [x] **T-004**: `chat` mutation 改为：`isGeminiConfigured()` 为真时调用 `generateReply()`（用 `.catch` 捕获失败并打 `console.error` 后降级为 `pickSimulatedReply()`），否则直接走 `pickSimulatedReply()`；移除原 `setTimeout` 模拟延迟
  - 文件: `packages/api/src/routers/debugger.ts`
  - 验收: 三条路径（有效 key / 无 key / 调用失败）都不抛错，均返回 `{ response, llmConfig, steps }`

- [x] **T-005**: `getStatus` 改为 `connected: isGeminiConfigured()`，移除硬编码 `connected: true`
  - 文件: `packages/api/src/routers/debugger.ts`
  - 验收: 不设置 key 时返回 `connected: false`

- [x] **T-006**: 手动验证三种场景并记录结果
  - (a) 不配置 `GEMINI_API_KEY`：聊天走模拟回复，前端徽章显示未连接 —— 本环境必测
  - (b) 配置占位/无效 key：调用失败被捕获，仍返回降级回复而非报错 —— 本环境必测（用一个格式合法但无效的字符串模拟）
  - (c) 配置真实有效 key：收到 Gemini 真实生成内容 —— **若用户未提供真实可用的 `GEMINI_API_KEY`，本场景延后到 key 到位后补测**，不阻塞本 feature 其余验收

## 技术方案

- SDK：`@google/genai`（与设计原型一致，调用方式已在原型中验证）。
- 降级策略：`isGeminiConfigured()` 前置短路 + `generateReply()` 失败 `.catch` 兜底，双重保障 F-003/F-004。
- 接口契约不变：`chat`/`getStatus` 的 input/output 形状不变，前端无需任何改动。

## 安全影响评估

- **敏感数据流转**：用户在 Debugger 输入的消息会发送给 Gemini API（第三方）。这是 feature 预期行为（沙盒调试场景），符合 `requirements.md` 用户故事，不属于新增风险，但 `generateReply` 内部 catch 错误日志中只记录 `err` 对象本身，不记录 `message` 全文，避免日志泄露用户输入。
- **新外部依赖**：`@google/genai` 为 Google 官方 SDK，设计原型已验证可用，无需额外信任评估。
- **关键输入点校验**：`message`/`workflowId` 的 zod 校验已存在且不变；`GEMINI_API_KEY` 经 `packages/env` zod 校验后读取，不直接读裸 `process.env`，不出现在前端或日志全文。

## 潜在风险

- `@google/genai` 实际可安装版本的 `generateContent` 签名若与原型不完全一致，需要在 T-002 实现时对照实际安装的类型定义调整。
- 若本环境没有真实可用的 Gemini API key，AC-001/AC-004（真实回复内容验证）将无法完整验证，仅能验证降级路径（AC-002/AC-003）与代码逻辑正确性；这会在 N5 Validate 阶段如实标注为"部分通过/待 key 到位后补测"，不会谎报通过。

---

请确认是否可以开始执行 Feature 2 的开发？如有修改意见请告知。
