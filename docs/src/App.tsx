import React, { useState, useEffect } from "react";
import { ActiveTab, Language, ThemeMode, Node, LANGUAGES } from "./types";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import OrchestratorView from "./components/OrchestratorView";
import DebuggerView from "./components/DebuggerView";
import AdminView from "./components/AdminView";
import KnowledgeBaseView from "./components/KnowledgeBaseView";

import { 
  Languages, Sun, Moon, LogOut, LayoutDashboard, Cpu, Database, 
  Terminal, ShieldCheck, Globe, Menu, X, ArrowUpRight, BookOpen, Clock 
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.LOGIN);
  const [language, setLanguage] = useState<Language>("zh"); // Defaulting to user's language preference
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [isAutoTheme, setIsAutoTheme] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default preset workflows
  const [nodes, setNodes] = useState<Node[]>([
    { 
      id: "N-TRG", 
      type: "trigger", 
      name: "API Ingester", 
      description: "Trigger Node", 
      x: 70, 
      y: 180, 
      config: { url: "https://api.orchestrator.ai/v1/ingest" } 
    },
    { 
      id: "N-CND", 
      type: "condition", 
      name: "Corporate Filtering", 
      description: "Heuristic classification", 
      x: 300, 
      y: 180, 
      config: { haltOnError: true } 
    },
    { 
      id: "N-SYN", 
      type: "llm_synthesis", 
      name: "Gemini Synthesis Core", 
      description: "Complex Prompt Reasoning", 
      x: 530, 
      y: 180, 
      config: { 
        model: "gemini-3.5-flash", 
        systemInstruction: "Identify cost anomalies. Summarize findings precisely into an academic checklist.", 
        temperature: 0.7 
      } 
    }
  ]);

  // Real-time ticking time clock for auto theme sync visualization
  const [localTime, setLocalTime] = useState<Date>(new Date());

  useEffect(() => {
    const ticker = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const localHour = localTime.getHours();
  // Safe Night check: before 6:00 AM or after 6:00 PM
  const isNightTime = localHour < 6 || localHour >= 18;

  // Derive theme strictly according to auto-adaptation setting OR manual Suns/Moons
  const activeTheme = isAutoTheme 
    ? (isNightTime ? "dark" : "light") 
    : themeMode;

  // Sync stateful theme class globally to the HTML document root level for flawless transition
  useEffect(() => {
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [activeTheme]);

  const currentLocalTimeStr = localTime.toLocaleDateString(language === "en" ? "en-US" : "zh-CN", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const handleLogout = () => {
    setActiveTab(ActiveTab.LOGIN);
  };

  const strings = LANGUAGES[language];

  // Dynamic CSS primary colors injection corresponding to Light and Dark
  const dynamicVariables = activeTheme === "dark" 
    ? {
        "--primary-color": "#6366f1", 
        "--primary-hover": "#4f46e5", 
        "--surface": "#0f172a", 
        "--surface-container": "rgb(30, 41, 59)", 
        "--surface-container-low": "rgba(30, 41, 59, 0.7)", 
        "--surface-container-lowest": "rgba(15, 23, 42, 0.45)", 
        "--surface-container-high": "#334155", 
        "--surface-dim": "#0b0f19",
        "--on-surface": "#ffffff",
        "--on-surface-variant": "#94a3b8", 
        "--outline": "#64748b",
        "--outline-variant": "rgba(51, 65, 85, 0.5)", 
        "--success": "#10b981",
        "--error": "#ef4444"
      } as React.CSSProperties
    : {
        "--primary-color": "#2563eb", 
        "--primary-hover": "#1d4ed8", 
        "--surface": "#ffffff",
        "--surface-container": "#ffffff", 
        "--surface-container-low": "#f8fafc", 
        "--surface-container-lowest": "#ffffff", 
        "--surface-container-high": "#f1f5f9", 
        "--surface-dim": "#f1f5f9",
        "--on-surface": "#0f172a", 
        "--on-surface-variant": "#475569", 
        "--outline": "#64748b",
        "--outline-variant": "#cbd5e1", 
        "--success": "#10b981",
        "--error": "#ef4444"
      } as React.CSSProperties;

  if (activeTab === ActiveTab.LOGIN) {
    return (
      <div 
        className={`${activeTheme === "dark" ? "dark text-white bg-[#0F172A]" : "text-slate-900 bg-[#F9FAFB]"}`}
        style={dynamicVariables}
      >
        <LoginView
          language={language}
          setLanguage={setLanguage}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          isAutoTheme={isAutoTheme}
          setIsAutoTheme={setIsAutoTheme}
          onLogin={() => setActiveTab(ActiveTab.DASHBOARD)}
          currentLocalTime={localTime.toISOString()}
          activeTheme={activeTheme}
        />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 font-sans ${
        activeTheme === "dark" 
          ? "dark bg-[#0F172A] text-white" 
          : "bg-[#F9FAFB] text-slate-900"
      }`}
      style={dynamicVariables}
    >
      {/* Mobile Header Navigation Menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface-container border-b border-outline-variant/10 z-30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">A</div>
          <span className="font-headline font-bold text-base tracking-tight">{strings.brand}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick theme status badge */}
          <span className="text-[9px] font-mono opacity-60">
            {isAutoTheme ? "Auto" : (activeTheme === "dark" ? "Night" : "Day")}
          </span>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded hover:bg-stone-500/10 text-on-surface"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Persistent Left Sidebar: Desktop and Mobile Drawer */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 w-64 bg-surface-container border-r border-outline-variant/10 z-40 transform transition-transform duration-300 flex flex-col justify-between shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-0 max-md:-translate-x-full"}
        md:translate-x-0
      `}>
        {/* Top brand header section */}
        <div className="p-6 border-b border-outline-variant/5">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/30">
              <span className="font-headline font-bold text-sm text-primary">A</span>
            </div>
            <span className="font-headline font-bold text-lg text-on-surface tracking-tight">
              {strings.brand}
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-outline">
            {strings.subtitle}
          </span>
        </div>

        {/* Navigation tabs items */}
        <nav className="flex-grow p-4 space-y-1">
          {/* Tab: Dashboard */}
          <button
            onClick={() => { setActiveTab(ActiveTab.DASHBOARD); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === ActiveTab.DASHBOARD 
                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{strings.tabDashboard}</span>
          </button>

          {/* Tab: Orchestrator */}
          <button
            onClick={() => { setActiveTab(ActiveTab.ORCHESTRATOR); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === ActiveTab.ORCHESTRATOR
                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{strings.tabOrchestrator}</span>
          </button>

          {/* Tab: Knowledge Base */}
          <button
            onClick={() => { setActiveTab(ActiveTab.KNOWLEDGE); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === ActiveTab.KNOWLEDGE
                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{strings.tabKnowledge}</span>
          </button>

          {/* Tab: Debugger */}
          <button
            onClick={() => { setActiveTab(ActiveTab.DEBUGGER); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === ActiveTab.DEBUGGER
                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{strings.tabDebugger}</span>
          </button>

          {/* Tab: Administration */}
          <button
            onClick={() => { setActiveTab(ActiveTab.ADMINISTRATION); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === ActiveTab.ADMINISTRATION
                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{strings.tabAdministration}</span>
          </button>
        </nav>

        {/* Bottom profile and helper controls panel */}
        <div className="p-4 border-t border-outline-variant/10 space-y-4">
          
          {/* User profile identifier Card */}
          <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-outline-variant/15">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-[11px] text-on-primary">
                CD
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-on-surface block line-clamp-1">Dr. Sterling</span>
                <span className="text-[9px] font-mono text-outline block leading-none">Security ADMIN</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-1 hover:text-error text-outline transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Lang, Theme preferences bar */}
          <div className="flex items-center justify-between text-xs text-outline font-mono">
            {/* Lang switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              className="flex items-center gap-1 hover:text-primary transition-colors uppercase font-bold text-[10px]"
              title="Change Workspace Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === "en" ? "ZH" : "EN"}</span>
            </button>

            {/* Sun/Moon Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAutoTheme(false); // Overrides auto-mode
                  setThemeMode(activeTheme === "dark" ? "light" : "dark");
                }}
                className="hover:text-primary transition-all p-1"
                title={strings.dayMode}
              >
                {activeTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
              </button>

              {/* Checkbox auto adaptation */}
              <label className="flex items-center gap-1 cursor-pointer select-none" title="Adapt automatically based on local time">
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
                  className="rounded border-outline-variant/10 text-primary focus:ring-primary w-3 h-3"
                />
                <span className="text-[9px] font-bold">Auto</span>
              </label>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Workspace Frame contents */}
      <main className="flex-grow p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full flex flex-col justify-between">
        
        {/* Workspace global header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 hidden md:flex pb-4 border-b border-outline-variant/5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider bg-surface border border-outline-variant/20 px-2.5 py-1 rounded">Alexandria Archive protocols v2.4.0</span>
          </div>

          {/* Time dynamic monitor */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/25">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-xs text-on-surface-variant">{currentLocalTimeStr}</span>
            </div>

            {/* Auto theme activation state tracker pill */}
            {isAutoTheme && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-mono uppercase font-bold text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {isNightTime ? strings.nightMode : strings.dayMode}
              </span>
            )}
          </div>
        </header>

        {/* Sandbox view content panels */}
        <div className="flex-grow">
          {activeTab === ActiveTab.DASHBOARD && (
            <DashboardView language={language} onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === ActiveTab.ORCHESTRATOR && (
            <OrchestratorView language={language} nodes={nodes} setNodes={setNodes} />
          )}
          {activeTab === ActiveTab.KNOWLEDGE && (
            <KnowledgeBaseView language={language} />
          )}
          {activeTab === ActiveTab.DEBUGGER && (
            <DebuggerView language={language} nodes={nodes} />
          )}
          {activeTab === ActiveTab.ADMINISTRATION && (
            <AdminView language={language} />
          )}
        </div>

        {/* Workspace custom credits foot info */}
        <footer className="mt-12 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-outline gap-3">
          <span>ALL NODE CONNECTIONS DEPLOYED AND DEEP-SECURED VIA CRYPTOGRAPHIC ENCRYPTION.</span>
          <span>© 2026 ALEXANDRIA ARCHIVE LABS.</span>
        </footer>

      </main>
    </div>
  );
}
