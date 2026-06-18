# Dashboard — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 前端 (Next.js) + 后端 (tRPC)

## 功能模块设计

### 模块 1: Dashboard 页面布局

**涉及层及关键设计:**

- **前端**: Next.js App Router，路由 `/dashboard`
- 布局采用 Grid 系统：KPI 卡片一行三个，底部两列（流水线列表 + 模型运行时）
- 复用现有 `DashboardView.tsx` 设计稿样式

### 模块 2: KPI 统计

**涉及层及关键设计:**

- **前端**: 调用 tRPC `dashboard.getStats` procedure
- **后端**: 统计 user 的 workflow 数量、node 数量
- 卡片样式：带图标边框、颜色区分

### 模块 3: 流水线列表

**涉及层及关键设计:**

- **前端**: 调用 tRPC `workflow.list` procedure 获取当前用户的流水线
- **后端**: 从 `workflow` 表查询，按 updatedAt 降序
- 点击条目跳转 `/orchestrator?workflowId=xxx`

### 模块 4: 模型运行时

**涉及层及关键设计:**

- **前端**: 静态配置（设计稿为预设数据）
- 后续可扩展为从配置表读取模型列表

## 接口契约

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `dashboard.getStats` | tRPC query | 获取 KPI 统计数据 |
| `workflow.list` | tRPC query | 获取用户流水线列表 |

## 数据模型

### Workflow 表（新增）

```typescript
// packages/db/src/schema/workflow.ts
workflow: {
  id: text primaryKey
  name: text
  userId: text references user.id
  status: text // 'active' | 'paused'
  nodeCount: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Node 表（已在 orchestrator-canvas 定义）

## 安全考虑

- 仅返回当前用户创建的流水线
- 后端校验 session userId

## 技术决策

| 决策             | 选项              | 理由                       |
| ---------------- | ----------------- | -------------------------- |
| 页面路由         | /dashboard        | 登录后默认页面             |
| 数据获取方式     | tRPC + React Query | 与项目技术栈一致          |
| 导航方式         | Next.js Link      | SPA 内跳转                 |