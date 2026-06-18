# Orchestrator Canvas — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/3.orchestrator-canvas/

## 任务列表

### 功能 1: 工作流 Schema

- [ ] T-001: 创建 `workflow` 表 schema（packages/db/src/schema/workflow.ts）~15min
- [ ] T-002: 在 schema/index.ts 导出 workflow ~5min

### 功能 2: tRPC API

- [ ] T-003: 创建 `workflow.create` procedure ~15min
- [ ] T-004: 创建 `workflow.get` procedure ~15min
- [ ] T-005: 创建 `workflow.update` procedure ~15min
- [ ] T-006: 创建 `workflow.delete` procedure ~15min
- [ ] T-007: 创建 `workflow.list` procedure ~15min

### 功能 3: 编排器页面

- [ ] T-008: 创建 `/orchestrator` 路由页面，整合 OrchestratorView 组件 ~30min

### 功能 4: 节点库面板

- [ ] T-009: 实现节点库面板 UI（5 种节点类型卡片）~15min
- [ ] T-010: 实现点击添加节点逻辑 ~15min

### 功能 5: 可视化画布

- [ ] T-011: 实现节点卡片渲染（绝对定位）~15min
- [ ] T-012: 实现 SVG 连接线 ~15min
- [ ] T-013: 实现节点选择高亮 ~15min
- [ ] T-014: 实现节点删除功能 ~15min

### 功能 6: 节点配置面板

- [ ] T-015: 实现 Trigger 节点配置（URL 输入）~15min
- [ ] T-016: 实现 LLM Synthesis 节点配置（模型选择、提示词、temperature）~15min
- [ ] T-017: 实现全局配置（maxRetries、timeout、haltOnError）~15min

### 功能 7: 工作流持久化

- [ ] T-018: 实现工作流保存到数据库 ~15min
- [ ] T-019: 实现从数据库加载工作流 ~15min
- [ ] T-020: 实现新建/重置工作流 ~15min

## 依赖关系

- T-003~T-007 依赖 T-001/T-002
- T-008 依赖 T-001
- T-009~T-017 依赖 T-008
- T-018~T-020 依赖 T-003~T-007

## 风险点

- 节点配置表单需要与节点类型动态匹配
- JSON 序列化/反序列化需要类型安全处理
- 大量节点时 SVG 性能可能下降