# Debugger — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 前端 (Next.js) + 后端 (tRPC)

## 功能模块设计

### 模块 1: 执行步骤追踪

**涉及层及关键设计:**

- **前端**: 4 个步骤卡片，根据 `activeStep` 状态显示高亮
- 步骤定义：

```typescript
const STEPS = [
  { id: 1, title: "Webhook Gateway", desc: "Authorized digital gateway..." },
  { id: 2, title: "Security & Routing Condition", desc: "Gating authentication..." },
  { id: 3, title: "Distributed Knowledge Vector", desc: "Aligning references..." },
  { id: 4, title: "Cognitive LLM Synthesis", desc: "Calling Deep Gemini-04..." }
]
```

### 模块 2: 沙盒聊天

**涉及层及关键设计:**

- **前端**: 消息列表 + 输入框，消息类型 `user` | `agent`
- **后端**: tRPC `debugger.chat` procedure 处理消息

### 模块 3: 执行日志

**涉及层及关键设计:**

- **前端**: 终端风格面板，monospace 字体，颜色编码
- 日志数据结构：

```typescript
interface SystemLog {
  timestamp: string; // "12:00:01"
  level: "INFO" | "TRACE" | "LOG" | "WARN" | "EXEC" | "DEBUG";
  message: string;
}
```

### 模块 4: 流水线执行模拟

**涉及层及关键设计:**

- **前端**: 使用 `delay()` 函数模拟步骤间延迟
- 流程：
  1. 发送消息到后端
  2. 前端依次高亮 Step 1-4
  3. 后端返回 LLM 响应

## 接口契约

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `debugger.chat` | tRPC mutation | 发送消息获取 LLM 响应 |
| `debugger.getStatus` | tRPC query | 获取后端连接状态 |

## 数据模型

无新增数据模型。Debugger 使用 orchestrator-canvas 的 workflow 数据。

## 安全考虑

- 沙盒环境不修改真实数据
- 消息内容不过滤（允许测试各种输入）
- 限制消息频率防止滥用

## 技术决策

| 决策             | 选项              | 理由                         |
| ---------------- | ----------------- | ---------------------------- |
| LLM 调用         | 模拟响应（脚手架）| 用户确认无需真实 API         |
| 执行模拟         | 前端 delay 模拟   | 简化实现，无需真实执行引擎   |
| 日志存储         | 前端 useState     | 临时显示，不持久化           |