# Debugger — 执行计划

## 概览

- Feature: 5.debugger (执行追踪与调试器)
- 技术栈: Next.js 16 + tRPC + TailwindCSS v4
- 设计稿: 无，根据 design.md 自行实现
- 依赖: feature 3 (orchestrator-canvas) 获取 LLM 节点配置

## 执行步骤

### Step 1: 创建 tRPC Router

**文件**: `packages/api/src/routers/debugger.ts`

**任务**:
- [ ] 5.T-008: 创建 `debugger.chat` protectedProcedure (zod input: `{ message: string }`)
- [ ] 5.T-008: 创建 `debugger.getStatus` protectedProcedure (returns connection status)

**实现细节**:
```typescript
// debugger.chat - 返回模拟的 LLM 响应
// debugger.getStatus - 返回 { connected: true, timestamp }

// 依赖 workflow router 的 get 接口获取 LLM 节点配置
```

### Step 2: 注册 Router

**文件**: `packages/api/src/routers/index.ts`

**任务**:
- [ ] 导入并注册 `debuggerRouter`

### Step 3: 创建 Debugger 页面

**文件**: `apps/web/src/app/debugger/page.tsx`

**任务**:
- [ ] 5.T-001: 创建页面入口
- [ ] 导入 DebuggerView 组件

### Step 4: 实现 Step Cards 组件

**文件**: `apps/web/src/components/debugger/step-cards.tsx`

**任务**:
- [ ] 5.T-002: 4 个步骤卡片 (Webhook Gateway, Security & Routing, Distributed Knowledge, LLM Synthesis)
- [ ] 5.T-003: 步骤高亮动画 (pulse/highlight effect)
- [ ] 5.T-004: 步骤顺序触发逻辑

**步骤定义**:
```typescript
const STEPS = [
  { id: 1, title: "Webhook Gateway", icon: "webhook" },
  { id: 2, title: "Security & Routing", icon: "shield" },
  { id: 3, title: "Distributed Knowledge", icon: "database" },
  { id: 4, title: "Cognitive LLM Synthesis", icon: "brain" }
]
```

### Step 5: 实现 Chat UI 组件

**文件**: `apps/web/src/components/debugger/chat-panel.tsx`

**任务**:
- [ ] 5.T-005: 消息列表 UI (user/agent 两种消息类型)
- [ ] 5.T-006: 消息输入框
- [ ] 5.T-007: 消息发送逻辑

**消息类型**:
```typescript
interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}
```

### Step 6: 实现 Log Console 组件

**文件**: `apps/web/src/components/debugger/log-console.tsx`

**任务**:
- [ ] 5.T-009: 终端风格面板 (monospace, dark theme)
- [ ] 5.T-010: 日志分级着色 (INFO=green, TRACE=pink, WARN=yellow, EXEC=cyan)
- [ ] 5.T-011: 清除日志按钮

**日志数据结构**:
```typescript
interface SystemLog {
  id: string;
  timestamp: string; // "12:00:01"
  level: "INFO" | "TRACE" | "LOG" | "WARN" | "EXEC" | "DEBUG";
  message: string;
}
```

### Step 7: 实现 DebuggerView 主组件

**文件**: `apps/web/src/components/debugger/debugger-view.tsx`

**任务**:
- [ ] 5.T-012: 整合 step-cards + chat-panel + log-console
- [ ] 5.T-012: 流水线执行模拟 (send message -> highlight steps sequentially -> show response)
- [ ] 5.T-013: 从 orchestrator 获取 LLM 节点配置

**执行流程**:
1. 用户发送消息
2. 依次高亮 Step 1-4，每个 step 停留约 500ms
3. 调用 `debugger.chat` 获取响应
4. 在 chat-panel 显示 AI 响应
5. 所有日志显示在 log-console

### Step 8: 添加导航

**文件**: `apps/web/src/components/header.tsx`

**任务**:
- [ ] 添加 Debugger 入口链接 (需登录)

## 验证清单

- [ ] pnpm check-types 无错误
- [ ] 页面渲染正常
- [ ] 步骤依次高亮
- [ ] 日志实时显示并可清除
- [ ] 聊天消息发送/接收正常

## 预计时间

- T-001 ~ T-004: 90min
- T-005 ~ T-008: 60min
- T-009 ~ T-013: 75min
- 验证与修复: 30min
- **总计: ~4.25 小时**

## 风险点

1. 步骤执行时序需要处理好 async/await 和 useEffect cleanup
2. 日志滚动性能需要注意 (使用虚拟化或限制日志数量)
3. orchestrator 节点配置获取需要确保 workflow 存在
