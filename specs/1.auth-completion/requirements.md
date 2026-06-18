# Auth Completion — 需求规格

## 概述

打通登录页注册表单与真实后端注册接口，并基于 Resend 邮件服务实现真实的忘记密码 / 重置密码流程，替换当前的 TODO 占位逻辑。

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo (Better-T-Stack: Next.js + Hono/tRPC + Drizzle/SQLite + Better-Auth)

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始需求 |

## 背景与现状

- 后端 `packages/api/src/routers/auth.ts` 的 `signUp` mutation 已正确调用 `auth.api.signUpEmail()`（此前的 "register error" bug 已在 4d9bac4 修复），可直接使用。
- 前端 `apps/web/src/components/login-view.tsx` 的 `handleSignUp`（第 143 行）标注 `TODO: Implement server-side registration via API`，目前只显示假成功提示，**没有真正调用后端**。
- 后端 `forgotPassword` mutation（同文件第 66 行）标注 `TODO: 发送重置邮件（需要配置邮件服务）`，目前总是返回假成功。
- 后端 `resetPassword` mutation 直接 `throw new TRPCError({ code: "NOT_IMPLEMENTED" })`。
- 前端 `handleForgotPassword`（第 165 行）同样只显示假成功提示，未调用后端。
- 好消息：Better-Auth 自带的 `verification` 表（`packages/db/src/schema/auth.ts`）已经可以承载重置 token，**不需要新建数据库表**；只需要在 `packages/auth/src/index.ts` 的 `emailAndPassword` 配置中接入 `sendResetPassword` 回调，并在 tRPC 层调用 Better-Auth 提供的 `auth.api.forgetPassword` / `auth.api.resetPassword` 方法。

## 用户故事

- 作为未注册用户，我想在登录页直接提交注册表单创建账号，而不是被告知"请联系管理员"。
- 作为忘记密码的用户，我想收到一封真实的重置邮件，点击邮件中的链接后能设置新密码并重新登录。

## 功能需求

1. [F-001] 登录页注册表单提交后，真正调用后端 `auth.signUp` 接口创建账号，成功后引导用户登录。
2. [F-002] 后端 `forgotPassword` mutation 调用 Better-Auth 的 `auth.api.forgetPassword`，并通过 Resend 发送包含重置链接（携带 token）的真实邮件。
3. [F-003] 新增 `/reset-password` 页面，从 URL query 中读取 token，提供"设置新密码"表单。
4. [F-004] 后端 `resetPassword` mutation 调用 Better-Auth 的 `auth.api.resetPassword`，校验 token 有效性并更新密码。
5. [F-005] `RESEND_API_KEY` 等邮件服务密钥通过 `packages/env/src/server.ts` 的 zod schema 校验后使用，不直接读取裸 `process.env`。

## 非功能需求

- 安全: 重置 token 一次性有效、有过期时间（沿用 Better-Auth `verification` 表的 `expiresAt` 机制，默认有效期遵循 Better-Auth 默认值）；无论邮箱是否存在都返回统一的成功提示，避免邮箱枚举攻击（现有 `forgotPassword` 已有此逻辑，需保留）。
- 安全: `RESEND_API_KEY` 不得硬编码或提交到 git，仅服务端可见。
- 兼容性: 注册/重置密码表单需同时在中文/英文界面下正确显示错误与成功提示（沿用现有 i18n 文案模式，若无 i18n 框架则保持现有纯文案方式）。

## 验收标准

- [ ] [AC-001] 在登录页填写姓名/邮箱/密码提交注册后，数据库 `user` 表新增对应记录，且能用该邮箱+密码立即登录。
- [ ] [AC-002] 重复使用已注册邮箱注册时，返回 `CONFLICT` 错误并在前端展示提示（沿用后端已有逻辑，仅需前端正确捕获展示）。
- [ ] [AC-003] 在忘记密码表单提交已注册邮箱后，该邮箱收到一封来自 Resend 的真实邮件，内含可点击的重置链接。
- [ ] [AC-004] 提交未注册邮箱时，前端仍展示与已注册邮箱相同的成功提示文案（不暴露邮箱是否存在）。
- [ ] [AC-005] 点击重置邮件中的链接后跳转到 `/reset-password?token=...`，填写新密码提交后能用新密码登录，旧密码失效。
- [ ] [AC-006] token 过期或被篡改时，`/reset-password` 提交返回明确错误提示，不会更新密码。

## 依赖

- Resend（邮件发送服务，需要 `RESEND_API_KEY`）
- Better-Auth 内置 `emailAndPassword.sendResetPassword` 回调与 `auth.api.forgetPassword` / `auth.api.resetPassword` 方法

## 开放问题

无（范围与邮件服务选型已在 PRD 阶段与用户确认：使用 Resend；Workspace Request 申请流程已确认跳过，不在本 feature 范围内）。
