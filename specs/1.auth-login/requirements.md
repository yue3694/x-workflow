# Auth Login — 需求规格

## 概述

Alexandria AI Orchestrator 的登录认证模块，支持邮箱/Google/GitHub SSO，主题自动切换（中英双语）。

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo (Next.js + Hono/tRPC)

## 需求版本

| 日期       | 版本 | 说明             |
| ---------- | ---- | ---------------- |
| 2026-06-18 | v1   | 初始需求         |

## 用户故事

- 作为访客，我希望使用邮箱或第三方 SSO 登录，以便安全进入 AI 编排工作空间。
- 作为用户，我希望系统根据本地时间自动切换深/浅色主题，以便在不同时间段获得最佳阅读体验。
- 作为用户，我希望在工作空间内切换中英文界面，以便根据偏好使用不同语言。

## 功能需求

1. [F-001] 登录页面布局 — 左右分栏布局：左侧品牌展示区（轮播标语+协议版本），右侧凭证输入区
2. [F-002] Google SSO 登录 — Google OAuth 按钮，点击后跳转到 Google 授权页，授权成功后创建用户并建立 session
3. [F-003] GitHub SSO 登录 — GitHub OAuth 按钮，点击后跳转到 GitHub 授权页，授权成功后创建用户并建立 session
4. [F-004] 邮箱+密码登录 — 表单输入邮箱和访问密码，后端校验通过后建立 session
5. [F-005] 忘记密码链接 — 页面显示"忘记密码？"链接（初期可仅做 UI 预留）
6. [F-006] 主题自动切换 — 根据本地时间（18:00 前为 light，18:00 后为 dark）自动切换主题，支持手动覆盖
7. [F-007] 中英双语切换 — 顶部语言切换按钮，实时切换界面文案
8. [F-008] 登录状态保持 — Session 有效期内自动保持登录状态，跳转到控制面板

## 非功能需求

- 性能: 登录页面首屏加载 < 2s
- 安全: 密码传输使用 HTTPS，session token 使用 HttpOnly Cookie
- 兼容性: 支持 Chrome/Firefox/Safari 最新两个版本

## 验收标准

- [ ] [AC-001] 用户可通过 Google 账号成功登录并跳转到控制面板
- [ ] [AC-002] 用户可通过 GitHub 账号成功登录并跳转到控制面板
- [ ] [AC-003] 用户可通过邮箱+密码成功登录（邮箱 alex@orchestrator.ai / 密码 demo123）
- [ ] [AC-004] 18:00 后访问登录页自动显示深色主题，18:00 前显示浅色主题
- [ ] [AC-005] 点击语言切换按钮可实时切换中英文界面
- [ ] [AC-006] 已登录用户访问 /login 自动重定向到 /dashboard

## 依赖

- better-auth: SSO OAuth 认证
- Google OAuth App: 需要配置 clientId/clientSecret
- GitHub OAuth App: 需要配置 clientId/clientSecret

## 开放问题

- Google/GitHub OAuth 的 clientId/clientSecret 是否已配置？
- 演示账号的初始密码如何设置？