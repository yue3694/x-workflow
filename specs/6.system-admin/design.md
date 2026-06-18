# System Admin — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 前端 (Next.js) + 后端 (tRPC) + 数据库

## 功能模块设计

### 模块 1: 用户目录

**涉及层及关键设计:**

- **前端**: 表格展示用户列表
- **后端**: tRPC `admin.listUsers` 获取所有用户
- 分页支持（待后续扩展）

### 模块 2: 成员邀请

**涉及层及关键设计:**

- **前端**: 模态框表单
- **后端**: tRPC `admin.inviteMember` 创建用户
- 新用户默认无 password，通过邮箱发送邀请链接

### 模块 3: 权限拓扑

**涉及层及关键设计:**

- **前端**: 3 个开关复选框
- **后端**: tRPC `admin.updateSettings` 保存设置
- 设置存储在 `system_settings` 表

### 模块 4: RBAC

**涉及层及关键设计:**

- **后端**: middleware 检查用户角色
- **前端**: 路由守卫检查权限

## 接口契约

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `admin.listUsers` | tRPC query | 获取所有用户列表 |
| `admin.inviteMember` | tRPC mutation | 邀请新成员 |
| `admin.deleteUser` | tRPC mutation | 删除用户 |
| `admin.getSettings` | tRPC query | 获取系统设置 |
| `admin.updateSettings` | tRPC mutation | 更新系统设置 |

## 数据模型

### System Settings 表（新增）

```typescript
// packages/db/src/schema/admin.ts
systemSettings: {
  id: text primaryKey
  key: text unique
  value: text // JSON string
  updatedAt: timestamp
}
```

### Role 扩展（已有 user 表，新增 role 字段）

```typescript
// 扩展 user 表
user: {
  // ... existing fields
  role: text default "viewer" // 'admin' | 'editor' | 'viewer'
}
```

## 安全考虑

- 仅 ADMIN 角色可访问 admin 相关接口
- 使用 protectedProcedure + 额外 role 检查
- 删除用户需要确认操作
- 防止自删除（不能删除当前登录用户）

## 技术决策

| 决策             | 选项              | 理由                         |
| ---------------- | ----------------- | ---------------------------- |
| 角色检查         | 中间件 + procedure | 多层防护                     |
| 设置存储         | key-value 表      | 灵活扩展                     |
| 用户创建         | 直接创建 + 发送邀请 | 简化流程                    |