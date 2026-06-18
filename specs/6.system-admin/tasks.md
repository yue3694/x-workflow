# System Admin — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/6.system-admin/

## 任务列表

### 功能 1: 用户目录 Schema

- [ ] T-001: 创建 `system_settings` 表 schema ~15min
- [ ] T-002: 扩展 `user` 表添加 role 字段 ~15min
- [ ] T-003: 在 schema/index.ts 导出 ~5min

### 功能 2: tRPC API

- [ ] T-004: 创建 `admin.listUsers` procedure ~15min
- [ ] T-005: 创建 `admin.inviteMember` procedure ~15min
- [ ] T-006: 创建 `admin.deleteUser` procedure ~15min
- [ ] T-007: 创建 `admin.getSettings` procedure ~15min
- [ ] T-008: 创建 `admin.updateSettings` procedure ~15min

### 功能 3: 系统管理页面

- [ ] T-009: 创建 `/admin` 路由页面，整合 AdminView 组件 ~30min

### 功能 4: 用户目录

- [ ] T-010: 实现用户表格 UI ~15min
- [ ] T-011: 实现角色标签显示 ~15min
- [ ] T-012: 实现删除用户功能 ~15min

### 功能 5: 成员邀请

- [ ] T-013: 实现邀请成员弹窗 UI ~15min
- [ ] T-014: 实现邀请表单验证 ~15min
- [ ] T-015: 实现提交邀请逻辑 ~15min

### 功能 6: 权限拓扑

- [ ] T-016: 实现权限开关 UI ~15min
- [ ] T-017: 实现开关状态保存 ~15min

### 功能 7: 访问控制

- [ ] T-018: 实现 ADMIN 角色检查中间件 ~15min
- [ ] T-019: 添加 /admin 路由守卫 ~15min

## 依赖关系

- T-004~T-008 依赖 T-001~T-003
- T-009 依赖 T-001
- T-010~T-012 依赖 T-009
- T-013~T-015 依赖 T-009
- T-016~T-017 依赖 T-007/T-008
- T-018~T-019 依赖 T-004

## 风险点

- RBAC 实现需要与现有 auth 系统集成
- 删除用户需要处理好关联数据