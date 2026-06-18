import React, { useState } from "react";
import { ActiveTab, Language, ThemeMode, LANGUAGES } from "../types";
import { Languages, Sun, Moon, ArrowRight, Eye, EyeOff, Key, Mail, ShieldAlert, X, Check, Copy, Send, Sparkles, Building, User, Clock, Terminal, ChevronRight, Activity, Cpu } from "lucide-react";

interface LoginViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isAutoTheme: boolean;
  setIsAutoTheme: (val: boolean) => void;
  onLogin: () => void;
  currentLocalTime: string;
  activeTheme: "light" | "dark";
}

export default function LoginView({
  language,
  setLanguage,
  themeMode,
  setThemeMode,
  isAutoTheme,
  setIsAutoTheme,
  onLogin,
  currentLocalTime,
  activeTheme
}: LoginViewProps) {
  const [email, setEmail] = useState("alex@orchestrator.ai");
  const [accessKey, setAccessKey] = useState("••••••••••••");
  const [showKey, setShowKey] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // --- Extended Forgot Password & Workspace Request Interactive States ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Verification, 3: Revealed Secret
  const [otpCode, setOtpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestDept, setRequestDept] = useState("AI Integration");
  const [requestUseCase, setRequestUseCase] = useState("");
  const [requestStep, setRequestStep] = useState(1); // 1: Form, 2: Realtime tracking timeline
  const [reqApplicationId, setReqApplicationId] = useState("");
  const [provisionProgress, setProvisionProgress] = useState(0);

  const strings = LANGUAGES[language];

  // Translation sets for the new features to keep the file clean & self-contained
  const tForgot = {
    title: language === "en" ? "Reset Access Core" : "重置访问令牌密钥",
    subtitle: language === "en" ? "Recovery of lost quantum authentication keys" : "追溯并重置离失的 Alexandria 工作区访问凭证",
    emailPlaceholder: language === "en" ? "Enter your registered workspace email" : "输入您注册的工作空间绑定邮箱",
    enterEmail: language === "en" ? "Please enter your workspace email below. We will dispatch an automated recovery security code." : "请输入您的组织级安全防护邮箱。系统将自动签发并验证重置令牌。",
    sendBtn: language === "en" ? "Dispatch Token" : "调度重置验证安全令牌",
    sendingBtn: language === "en" ? "Dispatching..." : "安全防伪签名调度中...",
    cancel: language === "en" ? "Cancel/Go Back" : "返回登录主页",
    step2Title: language === "en" ? "Verify Security Token" : "安全口令一致性验签",
    step2Sub: language === "en" ? "A confirmation token code was dispatched to" : "已向您的受防护邮箱下发了重置防伪安全码：",
    otpLabel: language === "en" ? "Token Hex Code (6 Digits)" : "请输入6位验证码 (模拟：任意6位数字均可，或输入 123456)",
    verifyBtn: language === "en" ? "Verify Authenticity" : "验证安全一致性",
    invalidOtp: language === "en" ? "Invalid verification signature. Please check and retry." : "安全码格式或数值验签失败，请确认后重试。",
    step3Title: language === "en" ? "Rotation Keys Successfully Bound" : "安全凭证重置完毕",
    step3Sub: language === "en" ? "Your temporary environment key has been rotationally generated below." : "全新的工作区随机高敏临时控制密钥已被安全硬件旋转签署生产：",
    codeLabel: language === "en" ? "Rotated Key Secret" : "新密钥凭证",
    copyBtn: language === "en" ? "Copy Core Key" : "一键复制高敏凭证",
    copied: language === "en" ? "Copied!" : "成功复制!",
    completeBtn: language === "en" ? "Bind and Sign-in" : "同步锁定并自动进入工作区",
  };

  const tReq = {
    title: language === "en" ? "Request Workspace Sandboxing" : "申请 Alexandria 控制台专属工作区",
    subtitle: language === "en" ? "Register a secure regional execution host partition" : "注册并分配专属的高吞吐、全隔离 Alexandria 微内核执行分区",
    formName: language === "en" ? "Full Name / Operator Signature" : "申请操作员真实全名",
    formEmail: language === "en" ? "Corporate/Organization Email" : "工作空间关联安全邮箱",
    formDept: language === "en" ? "Department/Work Group" : "所属业务线 / 系统角色",
    deptOptions: [
      { v: "AI Integration", l: language === "en" ? "AI Pipeline & Engineering" : "AI 工作流与大模型工程架构部" },
      { v: "Model Ops", l: language === "en" ? "Model Ops & Reliability" : "大模型运维与算力核算部" },
      { v: "Knowledge Management", l: language === "en" ? "Knowledge Management" : "知识库与非结构化检索部" },
      { v: "Security & Governance", l: language === "en" ? "Quantum SecOps" : "高安全等级合规审计中心" }
    ],
    formUse: language === "en" ? "Primary Intended Use-Case" : "工作流主要落地应用场景",
    usePlaceholder: language === "en" ? "e.g. Automating structural synthesis of internal financial documents using server-side Gemini..." : "例：拟部署自动化多流报表审核与业务文档抽取管线，将数据流接入 server 级 Gemini 做智能分类及追溯...",
    submitBtn: language === "en" ? "Queue Provision Order" : "立即提交算力分区申请",
    statusTitle: language === "en" ? "Deploying Core Cluster Partition" : "Alexandria 弹性子环境自动化部署同步中",
    statusSub: language === "en" ? "Request ID:" : "专属工作区标本备案号：",
    stepChecking: language === "en" ? "Running Compliance Validation" : "运行多租户环境信息隔离性校验",
    stepAllocating: language === "en" ? "Allocating Compute Nodes & API Proxies" : "调度算力节点容器及 Gemini 服务路由组态",
    stepProvisioning: language === "en" ? "Provisioning Sandbox Metadata Store" : "装配高敏数据安全套接字与元数据存储",
    finishBtn: language === "en" ? "Enter Newly Synthesized Workspace" : "直接接入全新测试沙箱环境"
  };

  // Auto-slide transition effect - 5 seconds
  React.useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Helper info about automatic theme
  const localHour = new Date(currentLocalTime).getHours();
  const isNightTime = localHour < 6 || localHour >= 18;

  // --- Extended Forgot Password Handler Functions ---
  const handleOpenForgot = () => {
    setForgotEmail(email || "alex@orchestrator.ai");
    setForgotStep(1);
    setOtpCode("");
    setRecoveryCode("");
    setOtpError("");
    setCopiedCode(false);
    setShowForgotModal(true);
  };

  const handleSendForgotToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    // Simulate API dispatch time
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotStep(2);
    }, 1200);
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setOtpError(language === "en" ? "Verification code must be 6 digits." : "核验校验码必须为 6 位数字。");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      // Rotation keys successfully bound
      const secureRandomKey = "ALX-KEY-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
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
    // Fill the keys back into the Main screen
    setEmail(forgotEmail);
    setAccessKey(recoveryCode);
    setShowForgotModal(false);
  };

  // --- Extended Space Request Access Handlers ---
  const handleOpenRequest = () => {
    setRequestName("");
    setRequestEmail(email || "");
    setRequestUseCase("");
    setRequestDept("AI Integration");
    setRequestStep(1);
    setProvisionProgress(0);
    // Create random tracking ID
    const randomHexId = "REQ-ALX-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    setReqApplicationId(randomHexId);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestEmail || !requestUseCase) return;
    setRequestStep(2);
    setProvisionProgress(0);
  };

  // Run simulated step completion ticks when Request state transitions to step 2 (Terminal trace)
  React.useEffect(() => {
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
    // Inject Guest account credentials and Auto Login!
    setEmail(requestEmail);
    setAccessKey("GUEST-ALX-" + reqApplicationId.substring(8));
    setShowRequestModal(false);
    // Trigger onLogin automatically to enter with newly provisioned credentials
    setTimeout(() => {
      onLogin();
    }, 150);
  };

  const slides = [
    {
      slogan: strings.slogan,
      quote: strings.quote,
      protocol: strings.protocol
    },
    {
      slogan: language === "en" ? "Autonomous Atomic Orchestration." : "自主原子算子，无缝编排。",
      quote: language === "en" 
        ? "Assemble and orchestrate dozens of multi-modal execution nodes concurrently with full visual feedback." 
        : "“图形化多维编排多端智能算子，实时渲染执行状态与高并发管道追溯。”",
      protocol: language === "en" ? "v2.4.0 Parallel Executor" : "v2.4.0 并行原子内核"
    },
    {
      slogan: language === "en" ? "Deep Semantic Context Fusion." : "深度语义检索，直连超智。",
      quote: language === "en" 
        ? "Align multi-region knowledge archives with state-of-the-art server-side Gemini intelligence." 
        : "“将分布在全球各可用区的多版本海量工作流知识库，直连高吞吐、超高智能的 Gemini 认知合成引擎。”",
      protocol: language === "en" ? "v2.4.0 Semantic Fusion Layer" : "v2.4.0 语义注意力网格"
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-br from-surface-dim via-[#F9FAFB] to-surface-container-low dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#1E293B] transition-colors duration-500">
      {/* Background Layer: Deep Tech Aesthetic with Animated Ambient Orbs & Quantum Fields */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Dynamic Glowing Organic Blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55%] aspect-square rounded-full bg-gradient-to-br from-primary/30 to-indigo-500/20 dark:from-indigo-900/30 dark:to-primary/10 blur-[130px] animate-pulse-gentle-reverse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-violet-500/25 to-primary/20 dark:from-violet-950/25 dark:to-primary/15 blur-[120px] animate-pulse-gentle" />
        <div className="absolute top-[30%] left-[40%] w-[35%] aspect-square rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-[100px] animate-drift-slow" />
        
        {/* Futuristic Technical Coordinate Overlays */}
        <div className="absolute top-10 left-10 text-[10px] font-mono text-outline/40 select-none hidden lg:block uppercase tracking-[0.2em] leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="font-bold text-on-surface">System Ingestion Active</span>
          </div>
          <div className="opacity-60 mt-1">CORE NODE ID: AIS-COORD-80E2</div>
          <div className="opacity-60 text-[9px]">ENCRYPTION KEY: AES_256_GCM</div>
        </div>
        <div className="absolute bottom-10 right-10 text-[10px] font-mono text-outline/40 select-none hidden lg:block uppercase tracking-[0.2em] text-right leading-relaxed">
          <div className="font-bold text-on-surface">Secure Socket Link</div>
          <div className="opacity-60 mt-1">SECURE PORT: 443 / SSL_READY</div>
          <div className="opacity-60 text-[9px]">INDEX: UTC_{new Date(currentLocalTime).toISOString().substring(11, 19)}</div>
        </div>

        {/* Digital Grid Network Canvas Overlay */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.035]" 
          style={{ 
            backgroundImage: `radial-gradient(var(--primary-color) 0.75px, transparent 0.75px)`, 
            backgroundSize: "28px 28px" 
          }} 
        />
        
        {/* Diagonal Light rays / Vector lines for premium editorial feel */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <line x1="-10%" y1="10%" x2="110%" y2="90%" stroke="var(--primary-color)" strokeWidth="1.5" />
          <line x1="-10%" y1="30%" x2="110%" y2="110%" stroke="var(--primary-color)" strokeWidth="1.5" strokeDasharray="6 6" />
        </svg>

        {/* Dynamic digital data streams (Micro particles floating) */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/5 w-1 h-32 bg-gradient-to-b from-primary/30 to-transparent rounded shadow-sm opacity-50 dark:opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-2/3 right-1/4 w-1 h-24 bg-gradient-to-b from-indigo-500/30 to-transparent rounded shadow-sm opacity-40 dark:opacity-20 animate-pulse" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      {/* Main Login Card with Glassmorphism */}
      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-surface-container-lowest/95 dark:bg-[#111827]/80 backdrop-blur-xl border border-outline-variant/15 dark:border-slate-800/60 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.45)] transition-all duration-300">
        
        {/* Left branding, quote cover side */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-surface-dim overflow-hidden border-r border-outline-variant/10">
          <div className="relative z-20">
            {/* Header logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/35">
                <span className="font-headline font-bold text-lg text-primary">A</span>
              </div>
              <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                {strings.brand}
              </h1>
            </div>

            {/* Slogan & Quote (Dynamic Slideshow with fade-in and smooth transitions) */}
            <div className="space-y-6 max-w-sm mt-12 min-h-[220px] flex flex-col justify-center">
              <div key={activeSlide} className="animate-[fadeIn_0.5s_ease-out] space-y-6">
                <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface leading-tight">
                  {slides[activeSlide].slogan}
                </h2>
                <p className="text-on-surface-variant text-base font-light italic leading-relaxed">
                  {slides[activeSlide].quote}
                </p>
              </div>
              <div className="h-[2px] w-12 bg-primary mt-6 opacity-60 transition-all duration-300" />
            </div>
          </div>

          {/* Interactive Pagination Controller with Click Action */}
          <div className="relative z-20 flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-outline transition-all duration-300">
              {slides[activeSlide].protocol}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer outline-none focus:ring-1 focus:ring-primary/40 ${
                    activeSlide === idx 
                      ? "w-7 bg-primary shadow-sm shadow-primary/30" 
                      : "w-2 bg-outline/25 hover:bg-primary/50"
                  }`}
                  title={`Switch to Slide ${idx + 1}`}
                  aria-label={`Show slide ${idx + 1} our capability details`}
                />
              ))}
            </div>
          </div>

          {/* Abstract artwork background element (rotating circles overlay) */}
          <div className="absolute inset-x-0 bottom-0 top-1/4 z-10 flex items-center justify-end opacity-[0.06] dark:opacity-[0.04] translate-x-1/4 translate-y-1/4 pointer-events-none">
            <div className="w-[140%] aspect-square border border-outline rounded-full flex items-center justify-center scale-150 animate-[spin_80s_linear_infinite]">
              <div className="w-[80%] aspect-square border border-dashed border-outline rounded-full flex items-center justify-center">
                <div className="w-[60%] aspect-square border border-outline rounded-full" />
              </div>
            </div>
          </div>

          {/* Overlay Cover Texture matching screenshots */}
          <div className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay dark:mix-blend-multiply opacity-25 dark:opacity-10" 
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdgJyJ_RmUSVtqEs4FfDxHqiV4tVn-zgX4129mkotRgvyLgaH3Lg7GNftfyMi2wb3U5xrK0ctMA2geLIyM6vnEk4ArpS0eU2-aXhYFagtjwW8hyiWhN27JKEbW0N44_fgvH4K3aw5AULCOkjVbVbq7Ha_cd13cxVzp2Tsn4Dk9AUN7xwT8i5SFgWOPiHroAxBxNPaq9-P-zRkJvXXKKZCTqBM3n67iDiQx609pLlStYPifOk115_bsuYzPMAWNUmUXZ8QieLNtakk')" 
            }} 
          />
        </div>

        {/* Right input form side */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-surface-container-lowest">
          
          {/* Top custom interactive global toolbar: Local Time, Lang switch, Dark Toggle, Auto Theme */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-10 pb-6 border-b border-outline-variant/10">
            
            {/* Hour time tracking */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs text-outline">{currentLocalTime.substring(11, 16)} Local</span>
              <span className="hidden sm:inline-block text-[10px] bg-outline-variant/20 px-2 py-0.5 rounded text-outline font-mono">
                {isNightTime ? "PM" : "AM"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button 
                onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                className="p-1.5 rounded bg-surface border border-outline-variant/20 hover:border-primary/50 text-on-surface-variant flex items-center gap-1 text-xs font-mono transition-all"
                title="Switch Language"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === "en" ? "ZH" : "EN"}</span>
              </button>

              {/* Theme Manual Override */}
              <button
                type="button"
                onClick={() => {
                  setIsAutoTheme(false); // Locking manual overrides auto mode
                  setThemeMode(activeTheme === "dark" ? "light" : "dark");
                }}
                className="p-1.5 rounded bg-surface border border-outline-variant/20 hover:border-primary/50 text-on-surface-variant transition-all hover:scale-105 active:scale-95"
                title={activeTheme === "dark" ? strings.dayMode : strings.nightMode}
              >
                {activeTheme === "dark" ? <Sun className="w-4 h-4 text-amber-500 animate-[spin_8s_linear_infinite]" /> : <Moon className="w-4 h-4 text-primary" />}
              </button>

              {/* Auto Theme adaptation switch */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono select-none" title="Adapt automatically based on local time">
                <input 
                  type="checkbox" 
                  checked={isAutoTheme}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsAutoTheme(checked);
                    if (checked) {
                      setThemeMode(isNightTime ? "dark" : "light");
                    }
                  }}
                  className="rounded border-outline-variant/30 text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <span className="text-outline text-[11px] font-semibold">{language === "en" ? "Auto" : "自动时区"}</span>
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
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-2">
              {strings.welcome}
            </h3>
            <p className="text-on-surface-variant text-sm">
              {strings.signinSub}
            </p>
          </div>

          {/* Notification about auto-adaptation */}
          {isAutoTheme && (
            <div className="mb-6 px-3.5 py-2.5 rounded bg-primary/5 border border-primary/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="text-[11px] leading-snug">
                <span className="font-bold text-on-surface block sm:inline mr-1">{strings.autoThemeActive}:</span>
                <span className="text-on-surface-variant">
                  {isNightTime ? strings.nightMode : strings.dayMode}
                </span>
              </div>
            </div>
          )}

          {/* Credential Auth Form */}
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            
            {/* SSO providers */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button 
                type="button"
                onClick={onLogin}
                className="flex items-center justify-center gap-3 py-2.5 px-4 bg-surface hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-sm font-semibold text-on-surface font-mono transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button 
                type="button"
                onClick={onLogin}
                className="flex items-center justify-center gap-3 py-2.5 px-4 bg-surface hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-sm font-semibold text-on-surface font-mono transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Separator line */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-outline-variant/15" />
              <span className="absolute px-3 bg-surface-container-lowest font-mono text-[9px] uppercase tracking-widest text-outline">
                {strings.continueMail}
              </span>
            </div>

            {/* Credentials Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-2" htmlFor="email">
                  {strings.emailLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-outline/40"
                    placeholder="alex@orchestrator.ai"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password">
                    {strings.accessKeyLabel}
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline font-semibold transition-all focus:outline-none cursor-pointer"
                    onClick={handleOpenForgot}
                  >
                    {strings.forgot}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showKey ? "text" : "password"}
                    id="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-outline/40 font-mono"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transitions-all"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* CTA action button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <span>{strings.initSession}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {/* Bottom helper */}
          <div className="mt-8 text-center text-xs text-on-surface-variant">
            <span>{strings.noAccess}</span>
            <button 
              type="button" 
              className="font-bold text-primary hover:underline ml-1 cursor-pointer transition-all focus:outline-none" 
              onClick={handleOpenRequest}
            >
              {strings.requestAccess}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Utilities */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-outline-variant/10 shadow-lg z-20">
        <a href="#" className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" onClick={(e) => e.preventDefault()}>{strings.support}</a>
        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/55" />
        <a href="#" className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" onClick={(e) => e.preventDefault()}>{strings.docs}</a>
        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/55" />
        <a href="#" className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" onClick={(e) => e.preventDefault()}>{strings.legal}</a>
      </div>

      {/* 1. FORGOT PASSWORD / ACCESS KEY RECOVERY INTERACTIVE MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-[#0F172A]/85 dark:bg-[#070A13]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Elegant Background Blobs inside modal */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 dark:bg-primary/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#3b82f6]/10 dark:bg-[#3b82f6]/5 blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary/10 dark:bg-primary/20 text-primary font-mono text-[10px] uppercase tracking-wider font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Secured Socket Reset</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-slate-900 dark:text-white mt-1">
                  {tForgot.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  {tForgot.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotToken} className="space-y-5">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                  {tForgot.enterEmail}
                </p>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="forgot-email">
                    {language === "en" ? "Recovery Workspace Email" : "恢复邮箱地址"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-slate-400"
                      placeholder="alex@orchestrator.ai"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {tForgot.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isForgotLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                        <span>{tForgot.sendingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{tForgot.sendBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-5">
                <div className="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-300">
                    {tForgot.step2Sub}
                  </p>
                  <p className="font-bold font-mono text-primary select-all text-sm sm:text-base tracking-wider px-1 bg-primary/10 dark:bg-primary/20 rounded inline-block">
                    {forgotEmail}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="otp-input">
                    {tForgot.otpLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      id="otp-input"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setOtpError("");
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm tracking-widest font-mono text-center placeholder:tracking-normal placeholder:text-slate-400"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>
                  {otpError && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                      <span>●</span> {otpError}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {language === "en" ? "💡 Tip: Under sandbox simulation mode, you can input any 6-digit verification code." : "💡 受防护环境模拟：为便于功能体验，输入任意 6 位数字均可完美通过。"}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {language === "en" ? "Back" : "上一步"}
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading || otpCode.length < 6}
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isForgotLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{tForgot.verifyBtn}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Code Reveal */}
            {forgotStep === 3 && (
              <div className="space-y-6 text-center pt-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white font-headline">
                    {tForgot.step3Title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-xs mx-auto text-center">
                    {tForgot.step3Sub}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-left">
                  <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    {tForgot.codeLabel}
                  </span>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="font-mono text-sm font-bold text-indigo-500 dark:text-indigo-400 select-all tracking-wider break-all bg-indigo-500/5 dark:bg-indigo-500/10 py-1.5 px-3 rounded border border-indigo-500/15">
                      {recoveryCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRecoveryCode}
                      className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs cursor-pointer ${
                        copiedCode 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/50"
                      }`}
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="font-semibold">{copiedCode ? tForgot.copied : tForgot.copyBtn}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeForgotReset}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-xl text-sm shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{tForgot.completeBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. REQUEST WORKSPACE ACCESS INTERACTIVE MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#0F172A]/85 dark:bg-[#070A13]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Elegant Background Blobs inside modal */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Subspace Ingestion Request</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-slate-900 dark:text-white mt-1">
                  {tReq.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  {tReq.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input Request Form */}
            {requestStep === 1 && (
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="req-name">
                    {tReq.formName}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      id="req-name"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder={language === "en" ? "e.g. Alex Johnson" : "例如：李安琪"}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="req-email">
                    {tReq.formEmail}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      id="req-email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="business@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="req-dept">
                    {tReq.formDept}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <Building className="w-4 h-4" />
                    </span>
                    <select
                      id="req-dept"
                      value={requestDept}
                      onChange={(e) => setRequestDept(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                    >
                      {tReq.deptOptions.map((opt) => (
                        <option key={opt.v} value={opt.v} className="bg-white dark:bg-[#111827]">
                          {opt.l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="req-use">
                    {tReq.formUse}
                  </label>
                  <textarea
                    id="req-use"
                    rows={3}
                    value={requestUseCase}
                    onChange={(e) => setRequestUseCase(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-slate-400"
                    placeholder={tReq.usePlaceholder}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {language === "en" ? "Cancel" : "取消"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 group font-inter"
                  >
                    <span>{tReq.submitBtn}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Live Ingesting Workspace Pipeline Simulation Terminal */}
            {requestStep === 2 && (
              <div className="space-y-6 pt-2">
                <div className="p-4 bg-slate-950 dark:bg-[#070A13] border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 space-y-4 shadow-inner relative text-left">
                  {/* Subtle terminal buttons decoration */}
                  <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-3 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] text-slate-500 ml-2">ALEXANDRIA ORCHESTRATION SHIELD DEPLOYER v2.4.0</span>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-normal">
                    <span>{tReq.statusSub} </span>
                    <span className="text-primary font-bold select-all">{reqApplicationId}</span>
                  </div>

                  {/* Progress Line Items */}
                  <div className="space-y-3.5 py-2">
                    {/* Tick Item 1 */}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">
                        {provisionProgress >= 1 ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center font-bold text-[9px] animate-spin">
                            ⚙
                          </div>
                        )}
                      </span>
                      <div className="leading-snug">
                        <span className={`block font-semibold text-xs ${provisionProgress >= 1 ? "text-slate-300" : "text-primary animate-pulse"}`}>
                          {tReq.stepChecking}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {provisionProgress >= 1 ? "[PASSED] Secure context profile isolation check OK" : "[RUNNING] Validading company proxy alignment"}
                        </span>
                      </div>
                    </div>

                    {/* Tick Item 2 */}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">
                        {provisionProgress >= 2 ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        ) : provisionProgress === 1 ? (
                          <div className="w-4 h-4 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center font-bold text-[9px] animate-spin">
                            ⚙
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                            -
                          </div>
                        )}
                      </span>
                      <div className="leading-snug">
                        <span className={`block font-semibold text-xs ${
                          provisionProgress >= 2 ? "text-slate-300" : provisionProgress === 1 ? "text-primary animate-pulse" : "text-slate-600"
                        }`}>
                          {tReq.stepAllocating}
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

                    {/* Tick Item 3 */}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">
                        {provisionProgress >= 3 ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        ) : provisionProgress === 2 ? (
                          <div className="w-4 h-4 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center font-bold text-[9px] animate-spin">
                            ⚙
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                            -
                          </div>
                        )}
                      </span>
                      <div className="leading-snug">
                        <span className={`block font-semibold text-xs ${
                          provisionProgress >= 3 ? "text-slate-300" : provisionProgress === 2 ? "text-primary animate-pulse" : "text-slate-600"
                        }`}>
                          {tReq.stepProvisioning}
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

                  {/* Micro Techy Visual Progress Indicator bar */}
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
                    <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-center flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-transparent animate-spin" />
                      <span>{language === "en" ? "Awaiting environment cluster creation..." : "正在同步就绪中，专属环境配给大约需数秒..."}</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.4s_ease-out] text-left">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {language === "en" ? "Subspace Initialized Host Operational!" : "子计算空间就绪，临时访问通道授权就地部署。"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                          {language === "en" 
                            ? "We have generated a guest key bound to your request sequence. Click enter below to launch Sandbox." 
                            : "您的入驻账号已经被暂时激活至分配的主机安全白名单中。点击下方即可一键直达，体验全新专属工作空间。"}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={provisionProgress < 3}
                    onClick={handleFinalizeRequestWorkspace}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-xl text-sm shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 group font-inter"
                  >
                    <span>{tReq.finishBtn}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
