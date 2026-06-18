# Orchestrator Canvas — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 前端 (Next.js) + 后端 (tRPC) + 数据库

## 功能模块设计

### 模块 1: 节点库面板

**涉及层及关键设计:**

- **前端**: 左侧固定面板，展示 5 种节点类型卡片
- 节点类型配置：

```typescript
const nodeLibrary = [
  { type: "trigger", name: "触发源", config: { url: string } },
  { type: "condition", name: "分流条件", config: { haltOnError: boolean } },
  { type: "parallel", name: "并发算子", config: {} },
  { type: "multimodal", name: "多模态合成", config: {} },
  { type: "llm_synthesis", name: "LLM 合成引擎", config: { model, systemInstruction, temperature } }
]
```

### 模块 2: 可视化画布

**涉及层及关键设计:**

- **前端**: 绝对定位节点卡片，SVG 连接线
- 节点数据结构：

```typescript
interface Node {
  id: string;
  type: "trigger" | "condition" | "parallel" | "multimodal" | "llm_synthesis";
  name: string;
  x: number;
  y: number;
  config: NodeConfig;
}
```

### 模块 3: 节点配置面板

**涉及层及关键设计:**

- **前端**: 根据 `selectedNode.type` 条件渲染配置表单
- **后端**: 无状态，配置存储在前端或随 workflow 持久化

### 模块 4: 工作流持久化

**涉及层及关键设计:**

- **前端**: 节点状态存储在 React state
- **后端**: tRPC procedure 保存/加载 workflow
- **数据库**: `workflow` 表存储 JSON 序列化的 nodes

## 接口契约

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `workflow.create` | tRPC mutation | 创建新工作流 |
| `workflow.get` | tRPC query | 获取工作流详情 |
| `workflow.update` | tRPC mutation | 更新工作流节点配置 |
| `workflow.list` | tRPC query | 列表（dashboard 使用） |
| `workflow.delete` | tRPC mutation | 删除工作流 |

## 数据模型

### Workflow 表

```typescript
// packages/db/src/schema/workflow.ts
workflow: {
  id: text primaryKey
  name: text
  userId: text references user.id
  status: text // 'active' | 'paused'
  nodes: text // JSON array of Node objects
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 索引

```typescript
index("workflow_userId_idx").on(workflow.userId)
```

## 安全考虑

- 工作流数据通过 userId 隔离
- 使用 protectedProcedure 确保登录
- 验证 workflow.userId === session.user.id

## 技术决策

| 决策             | 选项                    | 理由                             |
| ---------------- | ----------------------- | -------------------------------- |
| 画布实现         | 绝对定位 + SVG 连接线   | 符合设计稿简单直观               |
| 状态管理         | React useState          | 节点数量可控，无需状态管理库     |
| 数据序列化       | JSON.stringify          | 灵活存储不同类型节点配置         |
| 节点 ID 生成     | `N-${Date.now().slice(-4)}` | 简单唯一 ID                    |