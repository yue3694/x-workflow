# Lessons Learned

## 2026-06-18

### Feature: auth-login

#### 技术要点

1. **Better-Auth OAuth 动态配置**
   - OAuth provider 配置需要处理可选值（credentials 未配置时不会报错）
   - 使用条件对象构建 `socialProviders`，避免 TypeScript 类型错误

2. **Next.js Route Groups**
   - 登录页不需要 Header，使用 `(auth)` route group 创建独立布局
   - 创建 `/apps/web/src/app/(auth)/layout.tsx` 实现无 Header 布局

3. **中间件 Cookie 检查**
   - better-auth 使用 `better-auth.session_token` 作为 cookie 名称
   - middleware 需要正确匹配受保护路由和公开路由

#### 遇到的问题

1. **中文引号导致 TypeScript 解析错误**
   - LANGUAGES 对象中使用 `"` 和 `"` 会导致解析失败
   - 解决: 使用标准 ASCII 引号

2. **OAuth 可选环境变量类型**
   - `socialProviders` 的 clientId/clientSecret 需要 string 类型
   - 解决: 动态构建对象，仅在 credentials 存在时添加 provider

#### 安全经验

1. **Session Cookie 安全属性**
   - better-auth 配置: `sameSite: "none", secure: true, httpOnly: true`
   - 确保 cookie 在跨域场景下正常工作

2. **callbackUrl 验证**
   - better-auth 会验证 callbackUrl 是否在 trustedOrigins 内
   - 这是防止开放重定向的关键防线

---

### Feature: auth-completion

#### 技术要点

1. **Better-Auth 真实密码重置 API 与文档/常识不符，必须读已安装版本源码确认**
   - 服务端端点实际名为 `requestPasswordReset`（不是 `forgetPassword`）和 `resetPassword`，挂载在 `auth.api.requestPasswordReset` / `auth.api.resetPassword`。
   - `sendResetPassword` 回调签名为 `({ user, url, token }, request) => Promise<void> | void`，`url` 已经是 Better-Auth 拼好的 `${baseURL}/reset-password/${token}?callbackURL=...` 跳转链接（指向 Better-Auth 自身的 GET 回调端点，校验通过后再 302 到我们前端的 `callbackURL?token=...`），不要在业务代码里自己拼接 token 链接。
   - `verification` 表里 reset token 行：`identifier = "reset-password:{token}"`，`value = 用户 id`（不是邮箱，也不是反过来）。
   - `resetPassword` 的 body 是 `{ token, newPassword }`，token 也可以走 query，但本项目统一走 body。
   - 排查方法：`grep -rln "sendResetPassword" node_modules/.pnpm/better-auth*/node_modules/better-auth/dist/api/routes/*.mjs` 直接读源码，比相信训练数据里的方法名/参数名靠谱得多——这次设计阶段写的 `auth.api.forgetPassword` 就是凭印象写的，实现前读源码才发现是错的。

2. **Better-Auth 自带的防计时攻击逻辑，不要用自己的查库判断重复包一层**
   - `requestPasswordReset` 内部对"邮箱不存在"分支会模拟一次等量耗时的 `generateId` + `findVerificationValue` 调用，专门用于防计时攻击；如果业务代码在调用它之前自己先查一次库判断邮箱是否存在再决定要不要调用，会让"邮箱存在"和"邮箱不存在"两条路径的耗时出现可观测差异，相当于抵消了 Better-Auth 自带的防护。
   - 正确做法：无条件调用 `auth.api.requestPasswordReset`，直接信任它内部已经做好的防枚举/防计时攻击逻辑，业务层不要重复判断。

3. **Next.js 16 + Turbopack dev 模式下，任意一个页面的 module-not-found 编译错误会让全站所有路由都返回 500**
   - 不是只有出错的那个路由 500，是整个 dev server 在该编译错误存在期间对所有路由都返回 500（包括完全无关的页面）。
   - 排查时如果发现"改了 A 页面，结果 B 页面也 500 了"，先看 dev server 日志里是不是有别的页面的 `Module not found`，而不是去 B 页面本身找问题。
   - 本次定位到 `apps/web/src/app/debugger/page.tsx` 等 4 个文件里有遗留的错误别名导入（`@web/*` 应为 `@/*`，`@x-workflow/ui/utils` 应为 `@x-workflow/ui/lib/utils`），这是更早的 commit 留下的、与本 feature 无关的预存在 bug，但必须修掉才能验证本 feature 的页面——纯路径修正不算 scope creep。

#### 安全经验

1. **重置链接的 `redirectTo`/`callbackURL` 必须来自服务端可信配置，不能让客户端传**
   - 本次用 `${env.CORS_ORIGIN}/reset-password`（服务端 zod 校验过的可信源），而不是接受前端传来的 URL；Better-Auth 的 `originCheck` middleware 会校验 `redirectTo` 是否在 `trustedOrigins` 内，但业务层从源头上就不给客户端篡改的机会更稳妥。

2. **`resetPassword` 失败时统一返回通用错误，不区分 token 不存在/已过期/已使用**
   - 用一个裸 `try/catch` 把 Better-Auth 抛出的所有失败原因都折叠成同一个 `TRPCError({ code: "BAD_REQUEST" })`，避免给攻击者提供"token 格式对但已过期"之类的字典攻击反馈信号。

---

