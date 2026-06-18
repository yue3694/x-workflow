# Auth Login — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/1.auth-login/

## 任务列表

### 功能 1: 登录页面 UI

- [ ] T-001: 创建 `/login` 路由页面，整合 LoginView 组件 ~30min
- [ ] T-002: 实现登录表单提交逻辑，调用 Better-Auth email 登录 API ~15min
- [ ] T-003: 添加 SSO 按钮（Google/GitHub），绑定 OAuth 跳转 ~15min

### 功能 2: 主题自动切换

- [ ] T-004: 提取 LoginView 的主题逻辑到共享 hooks（`useAutoTheme`）~15min
- [ ] T-005: 在 App 布局层统一应用主题类名 ~15min

### 功能 3: 国际化

- [ ] T-006: 抽取 LANGUAGES 对象到共享 utils（`packages/ui/src/lib/i18n.ts`）~15min

### 功能 4: 登录状态与重定向

- [ ] T-007: 添加 middleware 检查已登录用户访问 /login 时重定向到 /dashboard ~15min
- [ ] T-008: 添加未登录用户访问受保护路由时重定向到 /login ~15min

### 功能 5: Google OAuth

- [ ] T-009: 在 Better-Auth 配置中添加 Google provider ~30min
- [ ] T-010: 添加 Google OAuth 环境变量校验（GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET）~15min

### 功能 6: GitHub OAuth

- [ ] T-011: 在 Better-Auth 配置中添加 GitHub provider ~30min
- [ ] T-012: 添加 GitHub OAuth 环境变量校验（GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET）~15min

## 依赖关系

- T-002 依赖 T-001
- T-009/T-010 依赖 T-001
- T-011/T-012 依赖 T-001
- T-007/T-008 依赖 T-002（登录 API 就绪）

## 风险点

- OAuth credentials 未配置时功能降级处理
- 跨域 Cookie 设置需要 CORS 正确配置