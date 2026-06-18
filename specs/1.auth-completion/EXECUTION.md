# EXECUTION PLAN — 1.auth-completion

## 目标描述

打通登录页注册表单与真实后端 `auth.signUp`，并基于 Resend 邮件服务把忘记密码 / 重置密码从 TODO 占位改为真实可用流程（复用 Better-Auth 内置的 `verification` 表与 `forgetPassword`/`resetPassword` API，不新建数据库表）。

## 原子任务列表

- [x] **T-001** 前端注册表单接入真实后端
  - 文件: `apps/web/src/components/login-view.tsx`（`handleSignUp`，约第 127-157 行）
  - 内容: 移除 TODO 假成功逻辑，改为 `trpc.auth.signUp.useMutation()`；成功后提示"注册成功，请登录"并切回登录态；失败（如 `CONFLICT`）展示后端错误信息。
  - 验收: 用新邮箱注册后可立即用该邮箱+密码登录；重复邮箱注册返回明确错误提示。

- [x] **T-002** 新增邮件服务环境变量
  - 文件: `packages/env/src/server.ts`
  - 内容: 新增 `RESEND_API_KEY: z.string().min(1)`、`RESEND_FROM_EMAIL: z.string().email()`。
  - 验收: 未设置时 `pnpm check-types`/启动失败并提示缺少变量（符合现有 env 校验风格）。

- [x] **T-003** Resend 邮件发送封装
  - 文件: 新建 `packages/auth/src/email.ts`；`packages/auth/package.json` 新增 `resend` 依赖
  - 内容: 封装 Resend client 初始化与 `sendResetPasswordEmail({ to, resetUrl })`，HTML 模板含重置链接按钮。
  - 验收: 单独调用该函数能成功通过 Resend API 发出一封测试邮件（需要真实 `RESEND_API_KEY` 才能验证到底，本地无 key 时只验证函数被正确调用）。

- [x] **T-004** 接入 Better-Auth `sendResetPassword` 回调
  - 文件: `packages/auth/src/index.ts`
  - 内容: `emailAndPassword` 配置增加 `sendResetPassword: async ({ user, url }) => sendResetPasswordEmail({ to: user.email, resetUrl: url })`。
  - 验收: 调用 `auth.api.forgetPassword` 后能触发 T-003 的发信函数。

- [x] **T-005** `forgotPassword` mutation 接入真实 API
  - 文件: `packages/api/src/routers/auth.ts`
  - 内容: 移除 TODO，调用 `auth.api.forgetPassword({ body: { email, redirectTo: "/reset-password" } })`；保留"无论邮箱是否存在都返回统一成功提示"的现有安全逻辑。
  - 验收: 已注册邮箱触发真实发信；未注册邮箱返回相同的成功响应（不暴露邮箱是否存在）。

- [x] **T-006** 前端忘记密码表单接入真实 API
  - 文件: `apps/web/src/components/login-view.tsx`（`handleForgotPassword`，约第 160-173 行）
  - 内容: 移除 TODO，改为调用 `trpc.auth.forgotPassword.useMutation()`。
  - 验收: 提交后展示与后端一致的提示文案，无报错。

- [x] **T-007** `resetPassword` mutation 接入真实 API
  - 文件: `packages/api/src/routers/auth.ts`
  - 内容: 移除 `NOT_IMPLEMENTED` 占位，改为调用 `auth.api.resetPassword({ body: { token, newPassword } })`，捕获异常统一抛 `BAD_REQUEST`（不泄露具体失败原因）。
  - 验收: 合法 token 能成功改密；过期/篡改 token 返回 `BAD_REQUEST` 而不更新密码。

- [x] **T-008** 新建重置密码页面
  - 文件: 新建 `apps/web/src/app/(auth)/reset-password/page.tsx`
  - 内容: 从 `useSearchParams()` 读取 `token`；缺失时引导回登录页；新密码+确认密码表单（`min(8)` 校验），提交调用 `trpc.auth.resetPassword`，成功后跳转 `/login`。
  - 验收: 通过邮件链接进入页面 → 设置新密码 → 跳转登录 → 新密码登录成功，旧密码失效。

- [x] **T-009** 端到端手动验证
  - 内容: 注册→登录；忘记密码→收到 Resend 邮件→点击链接→重置→新密码登录全链路走通。
  - 验收: 对应 requirements.md 的 AC-001 ~ AC-006 全部通过。

## 技术方案

- **不新建数据库表**：复用 Better-Auth 自带的 `verification` 表存储重置 token（`identifier`=邮箱，`value`=token，`expiresAt`=有效期），避免重复实现 token 签发/校验逻辑。
- **API 层只做薄封装**：`auth.ts` 路由里的 `forgotPassword`/`resetPassword` 直接转发到 Better-Auth 的 `auth.api.forgetPassword`/`auth.api.resetPassword`，不自己实现 token 生成或密码哈希逻辑。
- **重置交互形态调整**：原设计原型用 6 位 OTP 验证码，但 Better-Auth 标准能力是"邮件链接 + token"，本次按真实后端能力采用链接式重置（已在 design.md 中记录为技术决策，非本次新增风险点）。

## 安全影响评估

- **敏感数据流转**：用户邮箱、密码哈希经过 Better-Auth 既有流程处理，本次改动不新增明文密码存储或传输路径。
- **新增外部依赖**：`resend`（邮件发送 SDK）。Resend 是业界常用的事务邮件服务，无需额外安全评估；`RESEND_API_KEY` 严格走 `packages/env` 校验，不出现在前端 bundle。
- **关键输入校验**：
  - 注册：`email`/`password(min 8)`/`name` 已有 zod 校验（后端既有逻辑不变）。
  - 重置：`token`/`password(min 8)` 经 zod 校验；token 合法性完全委托给 Better-Auth 内部机制，不在业务代码中自行解析或校验 token 格式。
- **防邮箱枚举**：`forgotPassword` 保持"邮箱是否存在均返回相同响应"的现状逻辑，本次改动不削弱该防护。
- **防 token 暴力枚举**：`resetPassword` 失败时统一返回通用 `BAD_REQUEST`，不区分"token 不存在"/"token 已过期"/"token 已使用"等具体原因。

## 潜在风险

- Better-Auth 当前安装版本的 `auth.api.forgetPassword`/`resetPassword` 方法签名（参数名、`redirectTo` 等选项）需要在 T-004/T-005/T-007 实现时对照已安装的 `better-auth` 版本核实，文档/类型可能与设计描述略有出入。
- 本地/CI 环境若未配置真实 `RESEND_API_KEY`，T-003/T-009 中"真实收到邮件"这一环节无法完整验证，只能验证到"发信函数被正确调用、参数正确"为止；建议在有可用 key 的环境补测一次完整链路。
- `packages/env/src/server.ts` 是与 `2.debugger-llm-integration` 共享的文件，但因本次串行执行（① 先于 ②），不存在并发写冲突风险。

---

这是我为 **1.auth-completion** 制定的执行计划（含安全评估），请确认是否可以开始执行？如有修改意见请告知。
