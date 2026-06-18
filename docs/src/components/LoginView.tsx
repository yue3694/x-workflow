import React, { useState } from "react";
import { ActiveTab, Language, ThemeMode, LANGUAGES } from "../types";
import { Languages, Sun, Moon, ArrowRight, Eye, EyeOff, Key, Mail, ShieldAlert } from "lucide-react";

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

  const strings = LANGUAGES[language];

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
                  <a href="#" className="text-xs text-primary hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
                    {strings.forgot}
                  </a>
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
            <a href="#" className="font-bold text-primary hover:underline ml-1" onClick={(e) => { e.preventDefault(); onLogin(); }}>
              {strings.requestAccess}
            </a>
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
    </div>
  );
}
