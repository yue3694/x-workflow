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

