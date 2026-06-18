"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "better-auth/client";
import { useRouter } from "next/navigation";
import { useAutoTheme, LANGUAGES, type Language } from "@x-workflow/ui";
import { Languages, Sun, Moon, ArrowRight, Eye, EyeOff, Key, Mail, Check } from "lucide-react";
import { Button } from "@x-workflow/ui/components/button";
import { Input } from "@x-workflow/ui/components/input";
import { Label } from "@x-workflow/ui/components/label";
import { env } from "@x-workflow/env/web";
import { trpc } from "@/utils/trpc";

const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
});

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

type ModalType = "login" | "signup" | "forgot";

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const router = useRouter();
  const { activeTheme, toggleTheme, isAutoTheme, setIsAutoTheme, isNightTime, isHydrated } =
    useAutoTheme();
  const [language, setLanguage] = useState<Language>("zh");
  const [modal, setModal] = useState<ModalType>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  // Forgot form state
  const [forgotEmail, setForgotEmail] = useState("");

  // Common state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strings = LANGUAGES[language];

  const signUpMutation = trpc.auth.signUp.useMutation();
  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation();

  // Auto-slide transition effect - 5 seconds
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const slides = [
    {
      slogan: strings.slogan,
      quote: strings.quote,
      protocol: strings.protocol,
    },
    {
      slogan: language === "en" ? "Autonomous Atomic Orchestration." : "自主原子算子，无缝编排。",
      quote:
        language === "en"
          ? "Assemble and orchestrate dozens of multi-modal execution nodes concurrently with full visual feedback."
          : "图形化多维编排多端智能算子，实时渲染执行状态与高并发管道追溯。",
      protocol: language === "en" ? "v2.4.0 Parallel Executor" : "v2.4.0 并行原子内核",
    },
    {
      slogan: language === "en" ? "Deep Semantic Context Fusion." : "深度语义检索，直连超智。",
      quote:
        language === "en"
          ? "Align multi-region knowledge archives with state-of-the-art server-side Gemini intelligence."
          : "将分布在全球各可用区的多版本海量工作流知识库，直连高吞吐、超高智能的 Gemini 认知合成引擎。",
      protocol:
        language === "en" ? "v2.4.0 Semantic Fusion Layer" : "v2.4.0 语义注意力网格",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email(
        { email, password },
        { callbackURL: "/dashboard" }
      );

      if (result?.error) {
        setError(result.error.message || "Login failed");
        return;
      }

      onLoginSuccess?.();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError(null);
    try {
      const result = await authClient.signIn.oauth({
        provider,
        callbackURL: "/dashboard",
      });

      if (result?.error) {
        setError(result.error.message || `${provider} sign in failed`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // 注册提交
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signUpMutation.mutateAsync({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
      });
      setSuccess("Account created. Please sign in.");
      setModal("login");
      setEmail(signupEmail);
      setPassword("");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 忘记密码提交
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await forgotPasswordMutation.mutateAsync({ email: forgotEmail });
      setSuccess(result.message);
      setForgotEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden ${
        activeTheme === "dark" ? "bg-[#0B0F19]" : "bg-[#F9FAFB]"
      }`}
    >
      {/* Main Login Card with Glassmorphism */}
      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-background/95 dark:bg-[#111827]/80 backdrop-blur-xl border border-border shadow-xl">
        {/* Left branding, quote cover side */}
        <div
          className={`relative hidden lg:flex flex-col justify-between p-12 lg:p-16 ${
            activeTheme === "dark" ? "bg-[#0B0F19]" : "bg-[#F9FAFB]"
          } border-r border-border`}
        >
          {/* Header logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/35">
              <span className="font-bold text-lg text-primary">A</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {strings.brand}
            </h1>
          </div>

          {/* Slogan & Quote (Dynamic Slideshow) */}
          <div className="space-y-6 max-w-sm mt-12 min-h-[220px] flex flex-col justify-center">
            <div key={activeSlide} className="animate-in fade-in duration-300 space-y-6">
              <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                {slides[activeSlide].slogan}
              </h2>
              <p className="text-muted-foreground text-base font-light italic leading-relaxed">
                {slides[activeSlide].quote}
              </p>
            </div>
            <div className="h-[2px] w-12 bg-primary mt-6 opacity-60" />
          </div>

          {/* Pagination Controller */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {slides[activeSlide].protocol}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx
                      ? "w-7 bg-primary"
                      : "w-2 bg-muted-foreground/25 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right input form side */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-background">
          {/* Top custom interactive global toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-10 pb-6 border-b border-border">
            {/* Hour time tracking */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} Local
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                className="p-1.5 rounded bg-muted border border-border hover:border-primary text-muted-foreground flex items-center gap-1 text-xs font-mono transition-all"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === "en" ? "ZH" : "EN"}</span>
              </button>

              {/* Theme Manual Override */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded bg-muted border border-border hover:border-primary text-muted-foreground transition-all"
                title={activeTheme === "dark" ? strings.dayMode : strings.nightMode}
              >
                {activeTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-primary" />
                )}
              </button>

              {/* Auto Theme adaptation switch */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono select-none">
                <input
                  type="checkbox"
                  checked={isAutoTheme}
                  onChange={(e) => setIsAutoTheme(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <span className="text-muted-foreground text-[11px] font-semibold">
                  {language === "en" ? "Auto" : "自动时区"}
                </span>
              </label>
            </div>
          </div>

          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                A
              </div>
              <span className="font-bold text-xl">{strings.brand}</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">{strings.welcome}</h3>
            <p className="text-muted-foreground text-sm">{strings.signinSub}</p>
          </div>

          {/* Notification about auto-adaptation */}
          {isAutoTheme && (
            <div className="mb-6 px-3.5 py-2.5 rounded bg-primary/5 border border-primary/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="text-[11px] leading-snug">
                <span className="font-bold text-foreground block sm:inline mr-1">
                  {strings.autoThemeActive}:
                </span>
                <span className="text-muted-foreground">
                  {isNightTime ? strings.nightMode : strings.dayMode}
                </span>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 px-3.5 py-2.5 rounded bg-green-500/10 border border-green-500/25 text-green-600 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Modal Tabs */}
          {modal !== "login" && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setModal("login"); setError(null); setSuccess(null); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded ${
                  modal === "login" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setModal("signup"); setError(null); setSuccess(null); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded ${
                  modal === "signup" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setModal("forgot"); setError(null); setSuccess(null); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded ${
                  modal === "forgot" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                Forgot Password
              </button>
            </div>
          )}

          {/* Login Form */}
          {modal === "login" && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* SSO providers */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                className="flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                className="flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Separator line */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-border" />
              <span className="absolute px-3 bg-background font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {strings.continueMail}
              </span>
            </div>

            {/* Credentials Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {strings.emailLabel}
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4"
                    placeholder="alex@orchestrator.ai"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <Label htmlFor="login-password" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    {strings.accessKeyLabel}
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setModal("forgot"); setError(null); setSuccess(null); }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {strings.forgot}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Key className="w-4 h-4" />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 font-mono"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* CTA action button */}
            <div className="pt-4">
              <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {strings.initSession}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
          )}

          {/* Sign Up Form */}
          {modal === "signup" && (
          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  type="text"
                  id="signup-name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="mt-1.5"
                  placeholder="Dr. Sterling"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Email
                </Label>
                <Input
                  type="email"
                  id="signup-email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="mt-1.5"
                  placeholder="alex@orchestrator.ai"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  type="password"
                  id="signup-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="mt-1.5 font-mono"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-confirm" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  id="signup-confirm"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  className="mt-1.5 font-mono"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
          )}

          {/* Forgot Password Form */}
          {modal === "forgot" && (
          <form className="space-y-5" onSubmit={handleForgotPassword}>
            <div>
              <Label htmlFor="forgot-email" className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Email
              </Label>
              <Input
                type="email"
                id="forgot-email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="mt-1.5"
                placeholder="alex@orchestrator.ai"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter your email to receive password reset instructions.
              </p>
            </div>

            <Button type="submit" className="w-full py-3" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Reset Link
                  <Mail className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
          )}

          {/* Bottom helper */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <span>{strings.noAccess}</span>
            <button
              type="button"
              onClick={() => { setModal("signup"); setError(null); setSuccess(null); }}
              className="font-bold text-primary hover:underline ml-1"
            >
              {strings.requestAccess}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}