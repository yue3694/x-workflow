# System Admin — 执行计划

## 目标描述

实现系统管理面板，包含用户目录、成员邀请、权限拓扑功能，并添加 RBAC 访问控制。

## 原子任务列表

### 阶段 1: 数据库 Schema (T-001 ~ T-003)

- [ ] **T-001**: 创建 `system_settings` 表 schema
  - 文件: `packages/db/src/schema/admin.ts`
  - 字段: id, key (unique), value (JSON string), updatedAt
  - 验收: schema 定义符合 Drizzle 规范

- [ ] **T-002**: 扩展 `user` 表添加 role 字段
  - 文件: `packages/db/src/schema/auth.ts`
  - 字段: role (text, default "viewer")
  - 验收: role 字段类型为 'admin' | 'editor' | 'viewer'

- [ ] **T-003**: 在 schema/index.ts 导出新 schema
  - 文件: `packages/db/src/schema/index.ts`
  - 验收: export * from "./admin"

### 阶段 2: tRPC API (T-004 ~ T-008)

- [ ] **T-004**: 创建 `admin.listUsers` procedure
  - 文件: `packages/api/src/routers/admin.ts`
  - 功能: 获取所有用户列表（分页）
  - 验收: 仅 ADMIN 可访问

- [ ] **T-005**: 创建 `admin.inviteMember` procedure
  - 文件: `packages/api/src/routers/admin.ts`
  - 功能: 创建新用户（无密码）
  - 验收: 接受 name, email, role 参数

- [ ] **T-006**: 创建 `admin.deleteUser` procedure
  - 文件: `packages/api/src/routers/admin.ts`
  - 功能: 删除非管理员用户
  - 验收: 防止自删除，返回 NOT_FOUND

- [ ] **T-007**: 创建 `admin.getSettings` procedure
  - 文件: `packages/api/src/routers/admin.ts`
  - 功能: 获取系统设置
  - 验收: 返回 key-value 格式

- [ ] **T-008**: 创建 `admin.updateSettings` procedure
  - 文件: `packages/api/src/routers/admin.ts`
  - 功能: 更新系统设置
  - 验收: 创建或更新 key-value

### 阶段 3: 前端页面 (T-009 ~ T-019)

- [ ] **T-009**: 创建 `/admin` 路由页面
  - 文件: `apps/web/src/app/admin/page.tsx`
  - 验收: 页面存在，布局完整

- [ ] **T-010**: 实现用户表格 UI
  - 文件: `apps/web/src/components/admin/user-table.tsx`
  - 验收: 展示头像、姓名、邮箱、角色、时间

- [ ] **T-011**: 实现角色标签显示
  - 文件: `apps/web/src/components/admin/role-badge.tsx`
  - 验收: ADMIN=红色, EDITOR=蓝色, VIEWER=灰色

- [ ] **T-012**: 实现删除用户功能
  - 文件: `apps/web/src/components/admin/user-table.tsx`
  - 验收: 删除按钮 + 确认提示

- [ ] **T-013**: 实现邀请成员弹窗 UI
  - 文件: `apps/web/src/components/admin/invite-modal.tsx`
  - 验收: 模态框 + 表单

- [ ] **T-014**: 实现邀请表单验证
  - 文件: `apps/web/src/components/admin/invite-modal.tsx`
  - 验收: zod 校验 name/email/role

- [ ] **T-015**: 实现提交邀请逻辑
  - 文件: `apps/web/src/components/admin/invite-modal.tsx`
  - 验收: 调用 admin.inviteMember

- [ ] **T-016**: 实现权限开关 UI
  - 文件: `apps/web/src/components/admin/settings-panel.tsx`
  - 验收: 3 个 switch: Strict Hierarchy, Encryption Vault, External Access

- [ ] **T-017**: 实现开关状态保存
  - 文件: `apps/web/src/components/admin/settings-panel.tsx`
  - 验收: 调用 admin.updateSettings

- [ ] **T-018**: 实现 ADMIN 角色检查中间件
  - 文件: `packages/api/src/index.ts`
  - 验收: adminProcedure 抛出 FORBIDDEN

- [ ] **T-019**: 添加 /admin 路由守卫
  - 文件: `apps/web/src/middleware.ts`
  - 验收: 非 ADMIN 重定向到首页

## 技术方案

### 数据模型

```typescript
// system_settings 表
export const systemSettings = sqliteTable("system_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// user 表扩展
export const user = sqliteTable("user", {
  // ... existing fields
  role: text("role").default("viewer").notNull(),
});
```

### API 设计

```typescript
// admin router
export const adminRouter = router({
  listUsers: adminProcedure.query(...),
  inviteMember: adminProcedure.input(z.object({...})).mutation(...),
  deleteUser: adminProcedure.input(z.object({...})).mutation(...),
  getSettings: adminProcedure.query(...),
  updateSettings: adminProcedure.input(z.object({...})).mutation(...),
});
```

### 安全影响评估

| 风险项 | 评估 | 缓解措施 |
|--------|------|----------|
| 未授权访问 admin 接口 | 中 | adminProcedure role 检查 |
| PII 数据泄露 | 低 | 仅返回必要字段（无 password） |
| 用户自删除 | 中 | deleteUser 检查 session.user.id |
| 恶意用户注入 | 低 | zod 输入校验 |

### 潜在风险

1. **删除用户关联数据**: session/account 表已有 cascade 删除
2. **RBAC 与现有 auth 集成**: 需要扩展 better-auth session 类型
3. **权限开关持久化**: 使用 key-value 表灵活扩展

## 验收标准

- [ ] AC-001: 管理员可查看所有用户列表
- [ ] AC-002: 点击"添加成员"显示邀请表单
- [ ] AC-003: 提交邀请表单后新用户出现在列表
- [ ] AC-004: 点击删除按钮可删除用户
- [ ] AC-005: 权限开关状态保存后刷新页面保持
- [ ] AC-006: 非管理员访问 /admin 被重定向

## 依赖关系

- T-004 ~ T-008 依赖 T-001 ~ T-003
- T-009 依赖 T-001
- T-010 ~ T-012 依赖 T-009
- T-013 ~ T-015 依赖 T-009
- T-016 ~ T-017 依赖 T-007/T-008
- T-018 ~ T-019 依赖 T-004