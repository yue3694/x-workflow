# Auth Completion — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo (pnpm workspace)
- 涉及层: 前端 (`apps/web`)、后端 API (`packages/api`)、认证配置 (`packages/auth`)、环境变量 (`packages/env`)
- 不涉及数据库 schema 变更：Better-Auth 自带的 `verification` 表已可承载重置 token。

## 功能模块设计

### 模块 1: 注册表单接入真实后端

**涉及层及关键设计:**

- 后端: `packages/api/src/routers/auth.ts` 的 `signUp` mutation **已实现且正确**（调用 `auth.api.signUpEmail()`），无需改动。
- 前端: `apps/web/src/components/login-view.tsx` 的 `handleSignUp`（约第 127-157 行）：
  - 移除 `TODO` 占位逻辑与假成功提示。
  - 改为调用 `trpc.auth.signUp.useMutation()`（沿用 `apps/web/src/utils/trpc.ts` 既有 client 用法，与 `handleLogin` 风格一致）。
  - 成功后：`setSuccess("注册成功，请登录")`、清空表单、`setModal("login")`、预填邮箱（沿用现有清空逻辑）。
  - 失败（如 `CONFLICT`）：捕获 `TRPCClientError`，展示 `err.message`（如 "Email already registered"）。
  - 不在 handler 内部重复手写鉴权或邮箱重复校验逻辑——后端已处理，前端只负责展示错误。

### 模块 2: 忘记密码 — 真实邮件发送（Resend）

**涉及层及关键设计:**

- 环境变量: `packages/env/src/server.ts` 新增：
  ```ts
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  ```
  两者均为服务端专属变量，不暴露给前端。
- 认证配置: `packages/auth/src/index.ts` 的 `betterAuth({...})` 配置中，`emailAndPassword` 增加：
  ```ts
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ to: user.email, resetUrl: url });
    },
  },
  ```
  其中 `url` 是 Better-Auth 自动生成、携带 token 的重置链接（`{BETTER_AUTH_URL}/reset-password?token=...`，可通过 Better-Auth 的 `resetPasswordTokenExpiresIn` 等选项调整有效期，默认值即可满足本次需求）。
- 新建 `packages/auth/src/email.ts`：封装 Resend client 初始化与 `sendResetPasswordEmail()` 函数（HTML 邮件模板含一个明显的"重置密码"按钮链接），供上面的 `sendResetPassword` 回调调用。Resend 依赖加入 `packages/auth/package.json`。
- API 层: `packages/api/src/routers/auth.ts` 的 `forgotPassword` mutation 改为调用：
  ```ts
  await auth.api.forgetPassword({ body: { email: input.email, redirectTo: "/reset-password" } });
  ```
  保留现有"无论邮箱是否存在都返回统一成功提示"的安全逻辑（已实现，不需改动）。
- 前端: `login-view.tsx` 的 `handleForgotPassword` 改为调用 `trpc.auth.forgotPassword.useMutation()`，移除 TODO 与假成功提示，错误时展示真实错误信息。

### 模块 3: 重置密码页面与接口

**涉及层及关键设计:**

- 新建路由: `apps/web/src/app/(auth)/reset-password/page.tsx`（与现有 `(auth)/login/page.tsx` 同级，复用 `(auth)/layout.tsx` 的视觉外壳）。
  - 从 `useSearchParams()` 读取 `token`；缺失 token 时展示错误态并引导回登录页。
  - 表单字段：新密码、确认新密码（沿用 `login-view.tsx` 中已有的密码强度/匹配校验风格，`min(8)` 字符）。
  - 提交时调用 `trpc.auth.resetPassword.useMutation({ token, password })`，成功后跳转 `/login` 并提示"密码已更新，请重新登录"。
- API 层: `packages/api/src/routers/auth.ts` 的 `resetPassword` mutation 改为：
  ```ts
  resetPassword: publicProcedure
    .input(z.object({ token: z.string().min(1), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      try {
        await auth.api.resetPassword({ body: { token: input.token, newPassword: input.password } });
        return { success: true };
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token" });
      }
    }),
  ```
  移除现有的 `NOT_IMPLEMENTED` 占位抛错。

## 接口契约

| Procedure | 类型 | Input | Output | 鉴权 |
| --- | --- | --- | --- | --- |
| `auth.signUp` | mutation | `{ email, password, name }` | `{ success, user }` | public（已实现，不改） |
| `auth.forgotPassword` | mutation | `{ email }` | `{ success, message }` | public |
| `auth.resetPassword` | mutation | `{ token, password }` | `{ success }` | public |

## 数据模型

无新增表。沿用 Better-Auth 的 `verification` 表（`packages/db/src/schema/auth.ts`）存储重置 token（`identifier` = 用户邮箱，`value` = token，`expiresAt` 控制有效期）。

## 安全考虑

- 遵循 `.claude/rules/security.md`：`RESEND_API_KEY`、`RESEND_FROM_EMAIL` 必须经 `packages/env` 的 zod schema 校验后使用。
- 维持邮箱枚举防护：`forgotPassword` 对存在/不存在的邮箱返回相同响应。
- `resetPassword` 失败时返回通用 `BAD_REQUEST`，不泄露 token 失效的具体原因（避免暴力枚举 token）。
- 重置链接使用 Better-Auth 内置 token 生成与校验机制，不自行实现 token 签发逻辑。

## 技术决策

| 决策 | 选项 | 理由 |
| ---- | ---- | ---- |
| 邮件服务商 | Resend（已与用户确认） | 与 Next.js/Better-Auth 生态集成简单，API key 即可发信，无需自建 SMTP |
| 重置 token 存储 | 复用 Better-Auth `verification` 表，不新建表 | 该表已存在且正是为此场景设计，避免重复造轮子，符合 `.claude/CLAUDE.md` "不要重复实现已有能力"原则 |
| 重置流程形态 | 链接 + token（而非原型中的 6 位 OTP 验证码） | Better-Auth 标准能力是 token 链接式重置，没有内置 OTP 表；继续使用 token 链接更安全、改动更小，原型的 OTP UI 仅为演示效果，本次按真实后端能力调整交互 |
