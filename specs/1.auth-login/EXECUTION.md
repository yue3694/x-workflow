# Auth Login — 执行计划

## 目标描述

实现 Alexandria AI Orchestrator 的完整登录认证系统：
- 邮箱 + 密码登录
- Google / GitHub OAuth SSO
- 主题自动切换（根据本地时间）
- 中英双语界面
- 登录状态保持与路由保护

## 原子任务列表

### 阶段 1: 登录页面基础

| # | 任务 | 文件 | 预期结果 | 状态 |
|---|------|------|----------|------|
| 1 | 创建 `/login` 路由页面，整合 LoginView 组件 | `apps/web/src/app/(auth)/login/page.tsx` | 登录页渲染，左侧品牌+右侧表单 | [x] |
| 2 | 提取 LANGUAGES 到共享 i18n | `packages/ui/src/lib/i18n.ts` | 中英双语文案统一管理 | [x] |
| 3 | 实现登录表单提交，调用 Better-Auth | `apps/web/src/components/login-view.tsx` | 邮箱+密码登录成功 | [x] |

### 阶段 2: 主题与国际化

| # | 任务 | 文件 | 预期结果 | 状态 |
|---|------|------|----------|------|
| 4 | 提取主题逻辑到 `useAutoTheme` hook | `packages/ui/src/hooks/use-auto-theme.ts` | 主题状态统一管理 | [x] |
| 5 | 在 App layout 应用主题类名 | `apps/web/src/app/layout.tsx` | html 元素添加 dark class | [x] |

### 阶段 3: 路由保护

| # | 任务 | 文件 | 预期结果 | 状态 |
|---|------|------|----------|------|
| 6 | 添加 middleware：已登录访问 /login 重定向到 /dashboard | `apps/web/src/middleware.ts` | 防止已登录用户停留在登录页 | [x] |
| 7 | 添加 middleware：未登录访问受保护路由重定向到 /login | `apps/web/src/middleware.ts` | 保护 Dashboard/Admin 等页面 | [x] |

### 阶段 4: OAuth 集成

| # | 任务 | 文件 | 预期结果 | 状态 |
|---|------|------|----------|------|
| 8 | 在 Better-Auth 添加 Google provider | `packages/auth/src/index.ts` | 支持 Google OAuth | [x] |
| 9 | 添加 Google OAuth 环境变量校验 | `packages/env/src/server.ts` | GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET | [x] |
| 10 | 在 Better-Auth 添加 GitHub provider | `packages/auth/src/index.ts` | 支持 GitHub OAuth | [x] |
| 11 | 添加 GitHub OAuth 环境变量校验 | `packages/env/src/server.ts` | GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET | [x] |

### 阶段 5: SSO UI 绑定

| # | 任务 | 文件 | 预期结果 | 状态 |
|---|------|------|----------|------|
| 12 | 绑定 SSO 按钮到 OAuth 跳转 | `apps/web/src/components/login-view.tsx` | 点击 Google/GitHub 按钮触发 OAuth | [x] |

## 技术方案

| 模块 | 方案 | 理由 |
|------|------|------|
| 登录页面 | 迁移 LoginView.tsx 设计稿到 Next.js | 复用设计稿样式 |
| OAuth | Better-Auth OAuth 插件 | 已有 better-auth 基础设施 |
| 主题 | Tailwind dark class + localStorage | 与项目 Tailwind v4 一致 |
| 国际化 | React state + LANGUAGES 对象 | 功能简单，无需 i18n 框架 |
| 路由保护 | Next.js middleware | 全局拦截，高效 |
| 认证状态 | Better-Auth useSession hook | 与 better-auth 配套 |

## 安全影响评估

| 项目 | 评估 | 缓解措施 |
|------|------|----------|
| OAuth credentials | 敏感数据 | 环境变量，.gitignore 忽略 |
| Session token | HttpOnly Cookie | 已在 better-auth 配置 sameSite:none, secure |
| 路由保护 | 未登录可访问敏感页面 | middleware 全局拦截 |
| CSRF | OAuth 流程 | better-auth 内置 state 参数 |

## 潜在风险

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| OAuth credentials 未配置 | 中 | 中 | 功能降级，隐藏 SSO 按钮 |
| CORS 配置错误 | 低 | 高 | 测试环境验证 |
| 跨域 Cookie | 中 | 中 | 检查 sameSite/secure 属性 |

## 执行顺序

```
阶段 1 (3 tasks) → 阶段 2 (2 tasks) → 阶段 3 (2 tasks) → 阶段 4 (4 tasks) → 阶段 5 (1 task)
     ↓                  ↓                  ↓                   ↓
  可串行            可串行            可串行              可串行
```

**预估总时间**: ~3.5h（12 tasks × ~15-30min）