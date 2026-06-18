# Orchestrator Canvas — 执行计划

## 目标描述

实现可视化 AI 编排器，支持节点库拖拽、画布编辑、节点配置和工作流持久化。

## 原子任务列表

### 阶段 1: 数据库 Schema

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-001 | 创建 workflow 表 schema | `packages/db/src/schema/workflow.ts` | workflow 表包含 id, name, userId, status, nodes(JSON), timestamps |
| T-002 | 导出 workflow schema | `packages/db/src/schema/index.ts` | 导出 workflow 表供其他包使用 |

### 阶段 2: tRPC API

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-003 | 创建 workflow router | `packages/api/src/routers/workflow.ts` | 包含 create, get, update, delete, list procedures |
| T-004 | 注册 workflow router | `packages/api/src/routers/index.ts` | appRouter 包含 workflow 命名空间 |

### 阶段 3: 编排器页面

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-005 | 创建 orchestrator 路由 | `apps/web/src/app/orchestrator/page.tsx` | 页面存在且有基础结构 |

### 阶段 4: 节点库面板

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-006 | 实现 NodeLibrary 组件 | `apps/web/src/components/orchestrator/node-library.tsx` | 显示 5 种节点类型卡片 |
| T-007 | 实现添加节点逻辑 | `apps/web/src/components/orchestrator/orchestrator-view.tsx` | 点击节点库项可在画布添加节点 |

### 阶段 5: 可视化画布

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-008 | 实现 Canvas 组件 | `apps/web/src/components/orchestrator/canvas.tsx` | 节点卡片绝对定位显示 |
| T-009 | 实现 SVG 连接线 | `apps/web/src/components/orchestrator/canvas.tsx` | 节点间有 SVG 连线 |
| T-010 | 实现节点选择高亮 | `apps/web/src/components/orchestrator/canvas.tsx` | 点击节点显示选中状态 |
| T-011 | 实现节点删除功能 | `apps/web/src/components/orchestrator/canvas.tsx` | 选中节点可删除 |

### 阶段 6: 节点配置面板

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-012 | 实现 NodeConfig 组件 | `apps/web/src/components/orchestrator/node-config.tsx` | 根据节点类型显示对应配置 |
| T-013 | Trigger 配置 | `apps/web/src/components/orchestrator/node-config.tsx` | URL 输入框 |
| T-014 | LLM Synthesis 配置 | `apps/web/src/components/orchestrator/node-config.tsx` | 模型选择、提示词、temperature |

### 阶段 7: 工作流持久化

| Task | 描述 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| T-015 | 实现保存功能 | `apps/web/src/components/orchestrator/orchestrator-view.tsx` | 保存当前工作流到数据库 |
| T-016 | 实现加载功能 | `apps/web/src/components/orchestrator/orchestrator-view.tsx` | 从数据库加载工作流 |
| T-017 | 实现新建/重置 | `apps/web/src/components/orchestrator/orchestrator-view.tsx` | 新建空白工作流 |

## 技术方案

### 数据库 Schema

```typescript
// packages/db/src/schema/workflow.ts
export const workflow = sqliteTable("workflow", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // 'active' | 'paused'
  nodes: text("nodes", { mode: "json" }).$type<Node[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })...,
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })...,
});
```

### 节点数据结构

```typescript
interface Node {
  id: string;
  type: "trigger" | "condition" | "parallel" | "multimodal" | "llm_synthesis";
  name: string;
  x: number;
  y: number;
  config: NodeConfig;
}

interface NodeConfig {
  url?: string;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxRetries?: number;
  timeout?: number;
  haltOnError?: boolean;
}
```

### 目录结构

```
apps/web/src/
├── app/orchestrator/page.tsx
└── components/orchestrator/
    ├── orchestrator-view.tsx (主容器)
    ├── node-library.tsx (节点库)
    ├── canvas.tsx (画布)
    ├── node-card.tsx (节点卡片)
    └── node-config.tsx (配置面板)
```

## 安全影响评估

| 评估项 | 状态 | 说明 |
|--------|------|------|
| 敏感数据处理 | N/A | 工作流数据为用户业务数据，无 PII |
| 外部依赖 | 低 | 无新增外部依赖 |
| 输入校验 | 已设计 | tRPC input 使用 zod schema 校验 |
| 授权隔离 | 已设计 | 所有 procedure 使用 protectedProcedure + userId 检查 |

## 潜在风险

| 风险 | 缓解措施 |
|------|----------|
| JSON 序列化类型丢失 | 使用 Drizzle JSON mode + TypeScript 类型守卫 |
| 大量节点性能 | 初始版本限制节点数量，后续可引入虚拟化 |
| 节点配置表单动态渲染 | 使用 switch-case 条件渲染，类型安全 |

## 执行顺序

T-001 → T-002 → T-003 → T-004 → T-005 → T-006~T-017

依赖关系：
- T-003~T-017 依赖 T-001~T-002 (schema)
- T-006~T-017 依赖 T-005 (页面)