# Dashboard — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/2.dashboard/

## 任务列表

### 功能 1: Dashboard 页面

- [x] T-001: 创建 `/dashboard` 路由页面，整合 DashboardView 组件 ~30min
- [x] T-002: 实现响应式布局（KPI 卡片 + 底部双列）~15min

### 功能 2: KPI 统计

- [x] T-003: 创建 `workflow` 表 schema（依赖 3.orchestrator-canvas 的 T-001）~15min
- [x] T-004: 创建 tRPC `dashboard.getStats` procedure 统计接口 ~15min
- [x] T-005: 前端调用 getStats 并渲染 KPI 卡片 ~15min

### 功能 3: 流水线列表

- [x] T-006: 创建 tRPC `workflow.list` procedure ~15min
- [x] T-007: 前端渲染流水线列表（ID、名称、节点数、状态、时间）~15min
- [x] T-008: 点击流水线跳转编排器 ~15min

### 功能 4: 模型运行时

- [x] T-009: 前端渲染模型运行时卡片（静态配置）~15min

## 依赖关系

- T-003 依赖 3.T-001（workflow schema）
- T-004 依赖 T-003
- T-005 依赖 T-004
- T-006 依赖 T-003
- T-007 依赖 T-006
- T-008 依赖 T-007

## 风险点

- 依赖 orchestrator-canvas 的 workflow schema 定义
- 后端 procedure 需使用 protectedProcedure