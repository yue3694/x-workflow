"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "better-auth/client";
import { useRouter } from "next/navigation";
import { useAutoTheme, LANGUAGES, type Language } from "@x-workflow/ui";
import {
  Languages,
  Sun,
  Moon,
  ArrowRight,
  Eye,
  EyeOff,
  Key,
  Mail,
  Check,
  ShieldAlert,
  X,
  Copy,
  Send,
  Sparkles,
  Building,
  User,
  Activity,
  ChevronRight,
  Clock,
} from "lucide-react";
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

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const router = useRouter();
  const {
    activeTheme,
    toggleTheme,
    isAutoTheme,
    setIsAutoTheme,
    isNightTime,
    isHydrated,
  } = useAutoTheme();
  const [language, setLanguage] = useState<Language>("zh");

  // Login form state
  const [email, setEmail] = useState("alex@orchestrator.ai");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Common state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forgot modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Request access modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestDept, setRequestDept] = useState("AI Integration");
  const [requestUseCase, setRequestUseCase] = useState("");
  const [requestStep, setRequestStep] = useState(1);
  const [reqApplicationId, setReqApplicationId] = useState("");
  const [provisionProgress, setProvisionProgress] = useState(0);

  const strings = LANGUAGES[language];

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
      slogan:
        language === "en"
          ? "Autonomous Atomic Orchestration."
          : "自主原子算子，无缝编排。",
      quote:
        language === "en"
          ? "Assemble and orchestrate dozens of multi-modal execution nodes concurrently with full visual feedback."
          : "图形化多维编排多端智能算子，实时渲染执行状态与高并发管道追溯。",
      protocol:
        language === "en" ? "v2.4.0 Parallel Executor" : "v2.4.0 并行原子内核",
    },
    {
      slogan:
        language === "en"
          ? "Deep Semantic Context Fusion."
          : "深度语义检索，直连超智。",
      quote:
        language === "en"
          ? "Align multi-region knowledge archives with state-of-the-art server-side Gemini intelligence."
          : "将分布在全球各可用区的多版本海量工作流知识库，直连高吞吐、超高智能的 Gemini 认知合成引擎。",
      protocol:
        language === "en"
          ? "v2.4.0 Semantic Fusion Layer"
          : "v2.4.0 语义注意力网格",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email(
        { email, password, rememberMe: true }
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
      // OAuth sign-in - redirect to OAuth provider
      await authClient.signIn.social({ provider });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Forgot password handlers
  const handleOpenForgot = () => {
    setForgotEmail(email || "alex@orchestrator.ai");
    setForgotStep(1);
    setOtpCode("");
    setRecoveryCode("");
    setCopiedCode(false);
    setShowForgotModal(true);
  };

  const handleSendForgotToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotStep(2);
    }, 1200);
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) return;
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      const secureRandomKey =
        "ALX-KEY-" +
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      setRecoveryCode(secureRandomKey);
      setForgotStep(3);
    }, 1000);
  };

  const handleCopyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleFinalizeForgotReset = () => {
    setEmail(forgotEmail);
    setPassword(recoveryCode);
    setShowForgotModal(false);
  };

  // Request access handlers
  const handleOpenRequest = () => {
    setRequestName("");
    setRequestEmail(email || "");
    setRequestUseCase("");
    setRequestDept("AI Integration");
    setRequestStep(1);
    setProvisionProgress(0);
    const randomHexId =
      "REQ-ALX-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    setReqApplicationId(randomHexId);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestEmail || !requestUseCase) return;
    setRequestStep(2);
    setProvisionProgress(0);
  };

  useEffect(() => {
    if (showRequestModal && requestStep === 2) {
      const interval = setInterval(() => {
        setProvisionProgress((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            return 3;
          }
          return prev + 1;
        });
      }, 1400);
      return () => clearInterval(interval);
    }
  }, [showRequestModal, requestStep]);

  const handleFinalizeRequestWorkspace = () => {
    setEmail(requestEmail);
    setPassword("GUEST-ALX-" + reqApplicationId.substring(8));
    setShowRequestModal(false);
    setTimeout(() => {
      onLoginSuccess?.();
      router.push("/dashboard");
    }, 150);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isDark = activeTheme === "dark";

  return (
    <div
      className={`relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#1E293B]"
          : "bg-gradient-to-br from-[#F9FAFB] via-[#F1F5F9] to-[#E2E8F0]"
      }`}
    >
      {/* Background Layer: Animated Ambient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div
          className={`absolute top-[-15%] left-[-10%] w-[55%] aspect-square rounded-full blur-[130px] ${
            isDark
              ? "bg-gradient-to-br from-indigo-600/30 to-indigo-500/20 animate-pulse-gentle-reverse"
              : "bg-gradient-to-br from-blue-400/20 to-indigo-300/15 animate-pulse-gentle-reverse"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-5%] w-[50%] aspect-square rounded-full blur-[120px] ${
            isDark
              ? "bg-gradient-to-tr from-violet-500/25 to-primary/20 animate-pulse-gentle"
              : "bg-gradient-to-tr from-violet-400/15 to-blue-300/10 animate-pulse-gentle"
          }`}
        />
        <div
          className={`absolute top-[30%] left-[40%] w-[35%] aspect-square rounded-full blur-[100px] ${
            isDark ? "bg-indigo-500/10" : "bg-blue-300/10"
          } animate-drift-slow`}
        />

        {/* Technical Coordinate Overlays */}
        <div className="absolute top-10 left-10 text-[10px] font-mono text-muted-foreground/40 select-none hidden lg:block uppercase tracking-[0.2em] leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="font-bold text-foreground">System Ingestion Active</span>
          </div>
          <div className="opacity-60 mt-1">CORE NODE ID: AIS-COORD-80E2</div>
          <div className="opacity-60 text-[9px]">ENCRYPTION KEY: AES_256_GCM</div>
        </div>
        <div className="absolute bottom-10 right-10 text-[10px] font-mono text-muted-foreground/40 select-none hidden lg:block uppercase tracking-[0.2em] text-right leading-relaxed">
          <div className="font-bold text-foreground">Secure Socket Link</div>
          <div className="opacity-60 mt-1">SECURE PORT: 443 / SSL_READY</div>
          <div className="opacity-60 text-[9px]">
            INDEX: UTC_{new Date().toISOString().substring(11, 19)}
          </div>
        </div>

        {/* Digital Grid Network Canvas Overlay */}
        <div
          className={`absolute inset-0 opacity-[0.05] ${isDark ? "dark:opacity-[0.035]" : ""}`}
          style={{
            backgroundImage: `radial-gradient(${
              isDark ? "#6366f1" : "#2563eb"
            } 0.75px, transparent 0.75px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Main Login Card with Glassmorphism */}
      <div
        className={`relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden ${
          isDark
            ? "bg-[#111827]/80 backdrop-blur-xl border-slate-800/60"
            : "bg-white/95 backdrop-blur-xl border-border"
        } border shadow-[0_30px_70px_-15px_rgba(0,0,0,0.18)] ${
          isDark ? "dark:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.45)]" : ""
        } transition-all duration-300`}
      >
        {/* Left branding, quote cover side */}
        <div
          className={`relative hidden lg:flex flex-col justify-between p-12 lg:p-16 ${
            isDark ? "bg-[#0B0F19] border-slate-800/30" : "bg-[#F9FAFB] border-border"
          }`}
        >
          <div className="relative z-20">
            {/* Header logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/35">
                <span className="font-headline font-bold text-lg text-primary">A</span>
              </div>
              <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground">
                {strings.brand}
              </h1>
            </div>

            {/* Slogan & Quote (Dynamic Slideshow) */}
            <div className="space-y-6 max-w-sm mt-12 min-h-[220px] flex flex-col justify-center">
              <div
                key={activeSlide}
                className="animate-in fade-in duration-300 space-y-6"
              >
                <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {slides[activeSlide].slogan}
                </h2>
                <p className="text-muted-foreground text-base font-light italic leading-relaxed">
                  {slides[activeSlide].quote}
                </p>
              </div>
              <div className="h-[2px] w-12 bg-primary mt-6 opacity-60" />
            </div>
          </div>

          {/* Pagination Controller */}
          <div className="relative z-20 flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {slides[activeSlide].protocol}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary/40 ${
                    activeSlide === idx
                      ? "w-7 bg-primary shadow-sm shadow-primary/30"
                      : "w-2 bg-muted-foreground/25 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Abstract artwork background element */}
          <div className="absolute inset-x-0 bottom-0 top-1/4 z-10 items-center justify-end opacity-[0.06] hidden lg:flex">
            <div
              className={`w-[140%] aspect-square border rounded-full items-center justify-center ${
                isDark ? "border-slate-700" : "border-slate-300"
              } scale-150 animate-spin-slow`}
            />
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
              <span className="hidden sm:inline-block text-[10px] bg-muted px-2 py-0.5 rounded font-mono">
                {isNightTime ? "PM" : "AM"}
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
                className="p-1.5 rounded bg-muted border border-border hover:border-primary text-muted-foreground transition-all hover:scale-105 active:scale-95"
                title={isDark ? strings.dayMode : strings.nightMode}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
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
              <span className="font-headline font-bold text-xl">{strings.brand}</span>
            </div>
            <h3 className="font-headline text-3xl font-bold text-foreground mb-2">
              {strings.welcome}
            </h3>
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
            <div className="mb-6 px-3.5 py-2.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 px-3.5 py-2.5 rounded bg-destructive/10 border border-destructive/25 text-destructive text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Login Form */}
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
                <Label
                  htmlFor="login-email"
                  className="text-[10px] font-mono font-bold uppercase tracking-wider"
                >
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
                  <Label
                    htmlFor="login-password"
                    className="text-[10px] font-mono font-bold uppercase tracking-wider"
                  >
                    {strings.accessKeyLabel}
                  </Label>
                  <button
                    type="button"
                    onClick={handleOpenForgot}
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
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Bottom helper */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <span>{strings.noAccess}</span>
            <button
              type="button"
              onClick={handleOpenRequest}
              className="font-bold text-primary hover:underline ml-1"
            >
              {strings.requestAccess}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Utilities */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg z-20">
        <a
          href="#"
          className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          {strings.support}
        </a>
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/55" />
        <a
          href="#"
          className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          {strings.docs}
        </a>
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/55" />
        <a
          href="#"
          className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          {strings.legal}
        </a>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-[#0F172A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-background rounded-3xl p-6 md:p-8 border border-border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-wider font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Secured Socket Reset</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mt-1">
                  {language === "en" ? "Reset Access Core" : "重置访问令牌密钥"}
                </h3>
                <p className="text-xs text-muted-foreground font-light">
                  {language === "en"
                    ? "Recovery of lost quantum authentication keys"
                    : "追溯并重置离失的 Alexandria 工作区访问凭证"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotToken} className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {language === "en"
                    ? "Please enter your workspace email below. We will dispatch an automated recovery security code."
                    : "请输入您的组织级安全防护邮箱。系统将自动签发并验证重置令牌。"}
                </p>
                <div className="space-y-2">
                  <Label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "en" ? "Recovery Workspace Email" : "恢复邮箱地址"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </span>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10 pr-4"
                      placeholder="alex@orchestrator.ai"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1"
                  >
                    {language === "en" ? "Cancel/Go Back" : "返回登录主页"}
                  </Button>
                  <Button type="submit" disabled={isForgotLoading} className="flex-1">
                    {isForgotLoading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="animate-spin">⟳</span>
                        {language === "en" ? "Dispatching..." : "安全防伪签名调度中..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Send className="w-4 h-4" />
                        {language === "en" ? "Dispatch Token" : "调度重置验证安全令牌"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-5">
                <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1">
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "A confirmation token code was dispatched to:"
                      : "已向您的受防护邮箱下发了重置防伪安全码："}{" "}
                  </p>
                  <p className="font-bold font-mono text-primary select-all text-sm bg-primary/10 rounded inline-block px-1">
                    {forgotEmail}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "en"
                      ? "Token Hex Code (6 Digits)"
                      : "请输入6位验证码"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Key className="w-4 h-4" />
                    </span>
                    <Input
                      type="text"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="pl-10 pr-4 tracking-widest font-mono text-center"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {language === "en"
                      ? "Tip: Under sandbox simulation mode, you can input any 6-digit verification code."
                      : "受防护环境模拟：为便于功能体验，输入任意 6 位数字均可完美通过。"}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotStep(1)}
                    className="flex-1"
                  >
                    {language === "en" ? "Back" : "上一步"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isForgotLoading || otpCode.length < 6}
                    className="flex-1"
                  >
                    {isForgotLoading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {language === "en" ? "Verify Authenticity" : "验证安全一致性"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Success Code Reveal */}
            {forgotStep === 3 && (
              <div className="space-y-6 text-center pt-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground font-headline">
                    {language === "en"
                      ? "Rotation Keys Successfully Bound"
                      : "安全凭证重置完毕"}
                  </h4>
                  <p className="text-xs text-muted-foreground font-light max-w-xs mx-auto text-center">
                    {language === "en"
                      ? "Your temporary environment key has been rotationally generated below."
                      : "全新的工作区随机高敏临时控制密钥已被安全硬件旋转签署生产："}
                  </p>
                </div>

                <div className="bg-muted rounded-2xl p-4 border border-border space-y-2 text-left">
                  <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    {language === "en" ? "Rotated Key Secret" : "新密钥凭证"}
                  </span>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="font-mono text-sm font-bold text-primary select-all tracking-wider break-all bg-primary/5 py-1.5 px-3 rounded border border-primary/15">
                      {recoveryCode}
                    </span>
                    <Button
                      type="button"
                      variant={copiedCode ? "default" : "outline"}
                      onClick={handleCopyRecoveryCode}
                      className="flex items-center gap-1 text-xs"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="font-semibold">
                        {copiedCode
                          ? language === "en"
                            ? "Copied!"
                            : "成功复制!"
                          : language === "en"
                            ? "Copy Core Key"
                            : "一键复制"}
                      </span>
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleFinalizeForgotReset}
                  className="w-full py-3.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {language === "en" ? "Bind and Sign-in" : "同步锁定并自动进入工作区"}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Workspace Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#0F172A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-background rounded-3xl p-6 md:p-8 border border-border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-500 font-mono text-[10px] uppercase tracking-wider font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Subspace Ingestion Request</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mt-1">
                  {language === "en"
                    ? "Request Workspace Sandboxing"
                    : "申请 Alexandria 控制台专属工作区"}
                </h3>
                <p className="text-xs text-muted-foreground font-light">
                  {language === "en"
                    ? "Register a secure regional execution host partition"
                    : "注册并分配专属的高吞吐、全隔离 Alexandria 微内核执行分区"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input Request Form */}
            {requestStep === 1 && (
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "en"
                      ? "Full Name / Operator Signature"
                      : "申请操作员真实全名"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </span>
                    <Input
                      type="text"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      className="pl-10 pr-4"
                      placeholder={language === "en" ? "e.g. Alex Johnson" : "例如：李安琪"}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "en"
                      ? "Corporate/Organization Email"
                      : "工作空间关联安全邮箱"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </span>
                    <Input
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      className="pl-10 pr-4"
                      placeholder="business@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "en" ? "Department/Work Group" : "所属业务线 / 系统角色"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Building className="w-4 h-4" />
                    </span>
                    <select
                      value={requestDept}
                      onChange={(e) => setRequestDept(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring/50 appearance-none cursor-pointer"
                    >
                      <option value="AI Integration">
                        {language === "en"
                          ? "AI Pipeline & Engineering"
                          : "AI 工作流与大模型工程架构部"}
                      </option>
                      <option value="Model Ops">
                        {language === "en"
                          ? "Model Ops & Reliability"
                          : "大模型运维与算力核算部"}
                      </option>
                      <option value="Knowledge Management">
                        {language === "en"
                          ? "Knowledge Management"
                          : "知识库与非结构化检索部"}
                      </option>
                      <option value="Security & Governance">
                        {language === "en"
                          ? "Quantum SecOps"
                          : "高安全等级合规审计中心"}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "en"
                      ? "Primary Intended Use-Case"
                      : "工作流主要落地应用场景"}
                  </Label>
                  <textarea
                    rows={3}
                    value={requestUseCase}
                    onChange={(e) => setRequestUseCase(e.target.value)}
                    className="w-full p-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring/50 placeholder:text-muted-foreground"
                    placeholder={
                      language === "en"
                        ? "e.g. Automating structural synthesis of internal financial documents..."
                        : "例：拟部署自动化多流报表审核与业务文档抽取管线..."
                    }
                    required
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1"
                  >
                    {language === "en" ? "Cancel" : "取消"}
                  </Button>
                  <Button type="submit" className="flex-1">
                    <span>{language === "en" ? "Queue Provision Order" : "立即提交算力分区申请"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Live Provisioning Terminal */}
            {requestStep === 2 && (
              <div className="space-y-6 pt-2">
                <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 space-y-4 shadow-inner text-left">
                  <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-3 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] text-slate-500 ml-2">
                      ALEXANDRIA ORCHESTRATION SHIELD DEPLOYER v2.4.0
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-normal">
                    <span>
                      {language === "en" ? "Request ID:" : "专属工作区标本备案号："}{" "}
                    </span>
                    <span className="text-primary font-bold select-all">{reqApplicationId}</span>
                  </div>

                  {/* Progress Line Items */}
                  <div className="space-y-3.5 py-2">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">
                        {provisionProgress >= 1 ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] animate-spin">
                            ⚙
                          </div>
                        )}
                      </span>
                      <div className="leading-snug">
                        <span
                          className={`block font-semibold text-xs ${
                            provisionProgress >= 1 ? "text-slate-300" : "text-primary animate-pulse"
                          }`}
                        >
                          {language === "en"
                            ? "Running Compliance Validation"
                            : "运行多租户环境信息隔离性校验"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {provisionProgress >= 1
                            ? "[PASSED] Secure context profile isolation check OK"
                            : "[RUNNING] Validating company proxy alignment"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">
                        {provisionProgress >= 2 ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        ) : provisionProgress === 1 ? (
                          <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] animate-spin">
                            ⚙
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                            -
                          </div>
                        )}
                      </span>
                      <div className="leading-snug">
                        <span
                          className={`block font-semibold text-xs ${
                            provisionProgress >= 2
                              ? "text-slate-300"
                              : provisionProgress === 1
                                ? "text-primary animate-pulse"
                                : "text-slate-600"
                          }`}
                        >
                          {language === "en"
                            ? "Allocating Compute Nodes & API Proxies"
                            : "调度算力节点容器及 Gemini 服务路由组态"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {provisionProgress >= 2
                            ? "[COMPLETED] Spawner successfully routing to core cluster pipeline Node #582"
                            : provisionProgress === 1
                              ? "[RUNNING] Registering with Google-Studio Server Gemini Inundator..."
                              : "[QUEUED] Awaiting token signature approval"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">
                        {provisionProgress >= 3 ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        ) : provisionProgress === 2 ? (
                          <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] animate-spin">
                            ⚙
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                            -
                          </div>
                        )}
                      </span>
                      <div className="leading-snug">
                        <span
                          className={`block font-semibold text-xs ${
                            provisionProgress >= 3
                              ? "text-slate-300"
                              : provisionProgress === 2
                                ? "text-primary animate-pulse"
                                : "text-slate-600"
                          }`}
                        >
                          {language === "en"
                            ? "Provisioning Sandbox Metadata Store"
                            : "装配高敏数据安全套接字与元数据存储"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {provisionProgress >= 3
                            ? "[READY] Workspace database mount point locked. Tenant operational bounds synchronized."
                            : provisionProgress === 2
                              ? "[RUNNING] Mounting secure isolated Firestore collection schema..."
                              : "[QUEUED] Awaiting Node container binding"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2 border-t border-slate-800/40">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono uppercase tracking-wider">
                      <span>Deployment Core Host Thread</span>
                      <span>{Math.floor((provisionProgress / 3) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300 rounded-full"
                        style={{ width: `${(provisionProgress / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {provisionProgress < 3 ? (
                    <div className="py-2.5 px-4 bg-muted rounded-xl border border-border text-xs text-center flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                      <span>
                        {language === "en"
                          ? "Awaiting environment cluster creation..."
                          : "正在同步就绪中，专属环境配给大约需数秒..."}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-left">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground">
                          {language === "en"
                            ? "Subspace Initialized Host Operational!"
                            : "子计算空间就绪，临时访问通道授权就地部署。"}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {language === "en"
                            ? "We have generated a guest key bound to your request sequence. Click enter below to launch Sandbox."
                            : "您的入驻账号已经被暂时激活至分配的主机安全白名单中。点击下方即可一键直达，体验全新专属工作空间。"}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    disabled={provisionProgress < 3}
                    onClick={handleFinalizeRequestWorkspace}
                    className="w-full py-3.5"
                  >
                    <span>
                      {language === "en"
                        ? "Enter Newly Synthesized Workspace"
                        : "直接接入全新测试沙箱环境"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}