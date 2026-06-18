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

### Feature: debugger-llm-integration

#### 技术要点

1. **`@google/genai` 真实调用方式**（已用真实 API 调用验证报错路径，确认可行）
   - `new GoogleGenAI({ apiKey })` 构造 client；`ai.models.generateContent({ model, contents, config: { systemInstruction, temperature } })` 发起调用；成功时取 `response.text`。
   - 调用失败（如 key 无效）会抛 `ApiError`，错误信息里只包含 Google 侧的通用描述（如 `"API key not valid"`），不会回显传入的 key 本身——但调用方日志仍应只打 `err` 对象、不打用户消息全文，双重避免敏感信息外泄。

2. **"配置存在" ≠ "配置可用"，两者职责要分开**
   - `isGeminiConfigured()` 只做格式/占位字符串校验（key 非空、不是 `"MY_GEMINI_API_KEY"` 之类的占位符），**不**发真实请求验证 key 是否真的有效。
   - 后果：一个格式合法但实际已失效/被吊销的 key，会让 `getStatus` 显示 `connected: true`，直到真正调用 `chat` 时才在 `.catch` 里降级。这是 design.md 阶段就接受的权衡（避免 `getStatus` 每次都触发一次真实外部调用的成本/延迟），不是 bug，但要在 PR 描述或文档里说清楚，避免被当作"误报"来排查。

3. **pnpm `allowBuilds` 不要无差别 `true`，但也不要无差别 `false`**
   - 新增 `@google/genai` 触发 pnpm 的 `ignoredBuiltDependencies` 提示。检查后发现其 `prepare` 脚本只用于从源码构建（发布的 npm 包已经带预编译好的 `dist/`），设为 `false` 不影响功能。
   - 同批出现的 `protobufjs`（`@google/genai` 的间接依赖）的 `postinstall` 脚本读了一下就回显一条版本提示到 stderr，无副作用，评估后设为 `true`。
   - 排查方法：直接读 `node_modules/.pnpm/<pkg>/node_modules/<pkg>/package.json` 的 `scripts` 字段 + 对应脚本源码，而不是凭包名"看起来像不像原生编译"去猜。

#### 安全经验

1. **降级路径要双重兜底：配置前置短路 + 调用异常捕获**
   - `isGeminiConfigured()` 为 false 时直接走模拟回复（不发请求）；为 true 时仍包一层 `.catch` 捕获真实调用失败（网络错误、key 失效等），两层叠加保证 `chat` mutation 永远不会因为 LLM 侧问题抛 500。
   - 验证方式：故意写入一个格式合法但失效的假 key，触发真实的 Gemini `400 API_KEY_INVALID` 响应，确认整条链路（捕获 → 打日志 → 降级返回 → HTTP 200）符合预期，而不是只读代码"看起来应该没问题"。

#### 验证范围说明

- 本次因环境中没有真实可用的 `GEMINI_API_KEY`，AC-001（真实回复内容）/AC-004（自定义 systemInstruction/temperature 确实生效）两项延后到 key 到位后补测，已与用户确认（2026-06-18）。已完整验证的是两条降级路径（未配置 / 配置了无效 key）与 `getStatus` 的状态切换。

---

### Feature: debugger-graph-execution

#### 技术要点

1. **`setTimeout` 包装的超时机制对"同步驱动的 async 函数"完全无效，无论超时值多小**
   - Node.js 事件循环规则：microtask 队列必须完全清空后才会检查 macrotask（包括 `setTimeout` 计时器）。如果一个 `async` 函数内部的"await"实际上是包装一个同步操作（如 better-sqlite3 这种同步驱动），它会在同一轮 microtask 内就 resolve，永远赢过任何 `setTimeout`（哪怕设成 1ms）触发的竞争。
   - 后果：`workflow-engine.ts` 的 `multimodal` 节点（底层调用 `searchSimilarChunks` → drizzle + better-sqlite3，全程同步）无法在真实端到端场景下被 `withTimeout()` 触发超时，不管 `config.timeout` 调多小。
   - 验证 `withTimeout()` 本身的正确性时，必须喂给它一个真正的宏任务延迟（如 `new Promise(resolve => setTimeout(resolve, 50))` 模拟慢操作），而不是依赖现有节点类型的真实调用链——否则会得出"超时机制没生效"的错误结论，实际上是节点本身不够"慢"。
   - 这是一个值得记录给未来开发者的通用调试陷阱，不是本次的 bug：超时包装器的实现是对的，只是当前节点执行函数全部基于同步 I/O，没有真实可触发超时的路径（除非接入有真实网络延迟的 LLM 调用）。

2. **UI 展示默认值必须与后端实际默认值保持一致，否则会误导用户**
   - `config-panel.tsx` 的 `maxRetries` 输入框最初在未配置时显示占位默认值 `3`，但 `workflow-engine.ts` 里 `executeLlmSynthesis` 的实际默认是 `node.config.maxRetries ?? 0`（design.md 明确写的"默认 0"）。这种"显示值"和"生效值"不一致的问题在 code review 时不容易被发现（两处分属前后端不同文件），N4 审计阶段交叉核对 UI 默认值与执行引擎默认值后才发现，已修正为两边都用 `0`。
   - 经验：任何"配置项有默认值"的字段，前端展示默认值与后端实际生效默认值必须在审计阶段显式核对一遍，不能假设两边写代码的人（或同一个人不同时间）记的是同一个数字。

3. **临时给私有函数加 `export` 做单元验证，验证完立刻还原，是比"改动生产代码逻辑去适配测试"更干净的验证方式**
   - 为了验证 `withTimeout()`（模块内未导出的私有函数）的真实行为，临时把它加上 `export`、用 `tsx` 直接跑一个独立脚本验证，验证完立刻把 `export` 去掉、删除临时脚本文件，不在生产代码里留下任何为了"方便测试"而新增的导出或钩子。
   - 配合 `set -a && source apps/server/.env && set +a` 手动加载服务端环境变量，可以在不依赖 vitest/jest 等框架的情况下，直接用 `tsx` 跑通需要 `packages/env` zod 校验的模块（如 `workflow-engine.ts` 间接依赖 `db`/`env`）。

#### 安全经验

1. **越权校验要在"执行时"现查，不能信任配置里存的 ID**
   - `multimodal` 节点的 `knowledgeBaseId` 来自用户保存在 Orchestrator 里的工作流配置，理论上配置数据本身也可能被篡改/复制自其他工作流。`searchSimilarChunks()` 在每次执行时都重新查询 `document.userId === userId`，不假设"配置里写的 ID 一定是当前用户自己的"，与 `knowledge.ts` 现有的越权校验模式保持一致。

#### 验证范围说明

- AC-004（`llm_synthesis` 节点的 `model/systemInstruction/temperature` 真实生效）延续 feature 2 已记录的延后约定，环境中无真实 `GEMINI_API_KEY`，只验证了配置传参的代码路径与降级回复，未验证真实 Gemini 响应内容随参数变化。
- AC-001/002/003/005/006 均通过真实调用（curl 打 tRPC 端点、直接 import 引擎函数跑脚本）验证，非仅代码审查。

---

