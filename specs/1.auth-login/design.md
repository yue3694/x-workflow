# Auth Login — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 前端 (Next.js) + 后端 (Hono/tRPC + Better-Auth)

## 功能模块设计

### 模块 1: 登录页面 (LoginView)

**涉及层及关键设计:**

- **前端**: Next.js App Router，路由 `/login`
- 组件复用现有 `LoginView.tsx` 设计稿样式
- 登录成功后调用 `router.push('/dashboard')`
- 主题状态存储在 localStorage，通过 CSS 变量实现主题切换

### 模块 2: SSO OAuth 集成

**涉及层及关键设计:**

- **前端**: Better-Auth 提供的 OAuth 跳转
- **后端**: Better-Auth 插件配置 Google/GitHub provider
- 回调路由 `/auth/callback/google`、`/auth/callback/github`
- 登录成功后设置 HttpOnly session cookie

### 模块 3: 主题自动切换

**涉及层及关键设计:**

- **前端**: 检测 `new Date().getHours()`，< 18 为 light，>= 18 为 dark
- `isAutoTheme` 状态控制自动模式开关
- 主题类名 `dark` 挂载到 `<html>` 元素
- CSS 变量定义颜色体系（已在 LoginView 中使用 `--primary-color` 等）

### 模块 4: 国际化

**涉及层及关键设计:**

- **前端**: 语言状态 `Language = "en" | "zh"`，存储在 React state
- 文案定义在 `types.ts` 的 `LANGUAGES` 对象中
- 切换语言触发组件重新渲染

### 模块 5: Session 管理

**涉及层及关键设计:**

- **后端**: Better-Auth 自动管理 session
- **前端**: 通过 `useSession` hook 读取当前用户
- 已登录用户访问 `/login` 通过 middleware 重定向

## 接口契约

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/auth/sign-in/google` | GET | 跳转 Google OAuth |
| `/auth/callback/google` | GET | Google OAuth 回调 |
| `/auth/sign-in/github` | GET | 跳转 GitHub OAuth |
| `/auth/callback/github` | GET | GitHub OAuth 回调 |
| `/auth/sign-in/email` | POST | 邮箱密码登录 |
| `/auth/sign-out` | POST | 退出登录 |

## 数据模型

### User 表（已有）

```typescript
// packages/db/src/schema/auth.ts
user: {
  id: text primaryKey
  name: text
  email: text unique
  emailVerified: boolean
  image: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Account 表（已有，存储 OAuth 信息）

```typescript
account: {
  id: text primaryKey
  accountId: text  // OAuth provider 的用户 ID
  providerId: text // 'google' | 'github'
  userId: text references user.id
  accessToken: text
  refreshToken: text
  // ...
}
```

## 安全考虑

- Session token 存储在 HttpOnly Cookie，防止 XSS 攻击
- CORS 配置仅允许指定域名访问
- OAuth state 参数防止 CSRF 攻击
- 密码最小长度要求（项目规范）

## 技术决策

| 决策                     | 选项                        | 理由                                         |
| ------------------------ | --------------------------- | -------------------------------------------- |
| 认证框架                 | Better-Auth                 | 已有基础设施，支持 OAuth + Email/Password    |
| OAuth providers          | Google + GitHub             | 设计稿需求                                   |
| 主题管理                 | CSS 变量 + Tailwind dark class | 与设计稿实现方式一致                      |
| 国际化方案               | React state + LANGUAGES 对象 | 功能简单，无需 i18n 框架                    |