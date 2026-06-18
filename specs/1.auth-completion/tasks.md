# Auth Completion — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/1.auth-completion/

## 任务列表

### 功能 1: 注册表单接入真实后端

- [x] T-001: 前端 `login-view.tsx` 的 `handleSignUp` 改为调用 `trpc.auth.signUp.useMutation()`，移除 TODO 占位逻辑，正确展示成功/`CONFLICT` 错误 ~30min

### 功能 2: 忘记密码真实邮件发送

- [x] T-002: `packages/env/src/server.ts` 新增 `RESEND_API_KEY` / `RESEND_FROM_EMAIL` 的 zod 校验项 ~15min
- [x] T-003: 新建 `packages/auth/src/email.ts`，封装 Resend client 与 `sendResetPasswordEmail()`，加入 `resend` 依赖 ~30min
- [x] T-004: `packages/auth/src/index.ts` 的 `emailAndPassword` 配置接入 `sendResetPassword` 回调，调用 T-003 的发信函数 ~15min
- [x] T-005: `packages/api/src/routers/auth.ts` 的 `forgotPassword` mutation 改为调用 `auth.api.forgetPassword`，移除 TODO ~15min
- [x] T-006: 前端 `handleForgotPassword` 改为调用 `trpc.auth.forgotPassword.useMutation()`，移除 TODO 假成功逻辑 ~15min

### 功能 3: 重置密码页面与接口

- [x] T-007: `packages/api/src/routers/auth.ts` 的 `resetPassword` mutation 改为调用 `auth.api.resetPassword`，移除 `NOT_IMPLEMENTED` 占位 ~30min
- [x] T-008: 新建 `apps/web/src/app/(auth)/reset-password/page.tsx`，读取 URL token，提供新密码表单并调用 `trpc.auth.resetPassword` ~30min

### 集成与测试

- [x] T-009: 端到端手动验证：注册新账号→登录；忘记密码→收到 Resend 邮件→点击链接→设置新密码→用新密码登录成功 ~30min

## 依赖关系

- T-001 无依赖（后端 `signUp` 已实现）
- T-004 依赖 T-002、T-003
- T-005 依赖 T-004
- T-006 依赖 T-005
- T-008 依赖 T-007
- T-009 依赖 T-001、T-006、T-008

## 风险点

- Better-Auth 的 `auth.api.forgetPassword` / `resetPassword` 具体方法签名需在实现时核对当前安装版本的 API（不同小版本字段可能略有差异）。
- 本地开发若未配置真实 `RESEND_API_KEY`，T-009 的邮件收发验证需要在测试环境使用有效 Resend key 或沙箱域名完成，否则只能验证到"邮件发送函数被调用"为止。
