"use client";

import {
  Cpu,
  Database,
  LayoutDashboard,
  ShieldCheck,
  Terminal,
  LogOut,
  Languages,
  Sun,
  Moon,
  Menu,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAutoTheme, LANGUAGES, type Language } from "@x-workflow/ui";
import UserMenu from "./user-menu";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orchestrator", label: "Orchestrator", icon: Cpu },
  { href: "/knowledge", label: "Knowledge Base", icon: Database },
  { href: "/debugger", label: "Debugger", icon: Terminal },
  { href: "/admin", label: "Administration", icon: ShieldCheck },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { activeTheme, toggleTheme, isAutoTheme, setIsAutoTheme, isNightTime } = useAutoTheme();
  const [language, setLanguage] = useState<Language>("zh");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localTime, setLocalTime] = useState(new Date());

  const strings = LANGUAGES[language];
  const isDark = activeTheme === "dark";

  return (
    <>
      {/* Mobile Header Navigation Menu */}
      <div
        className={`md:hidden flex items-center justify-between p-4 border-b border-border z-30 ${
          isDark ? "bg-[#1E293B]" : "bg-background"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
            A
          </div>
          <span className="font-headline font-bold text-base tracking-tight">{strings.brand}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-muted-foreground opacity-60">
            {isAutoTheme ? "Auto" : isDark ? "Night" : "Day"}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Persistent Left Sidebar: Desktop and Mobile Drawer */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 w-64 shrink-0 z-40 transform transition-transform duration-300 flex flex-col justify-between
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-0 max-md:-translate-x-full"}
          md:translate-x-0
          ${isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"}
        `}
      >
        {/* Top brand header section */}
        <div className={`p-6 border-b ${isDark ? "border-slate-800/50" : "border-border/50"}`}>
          <div className="flex items-center gap-3 mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                isDark ? "bg-primary/15 border-primary/30" : "bg-primary/15 border-primary/30"
              }`}
            >
              <span className="font-headline font-bold text-sm text-primary">A</span>
            </div>
            <span className="font-headline font-bold text-lg text-foreground tracking-tight">
              {strings.brand}
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {strings.subtitle}
          </span>
        </div>

        {/* Navigation tabs items */}
        <nav className="flex-grow p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom profile and helper controls panel */}
        <div className={`p-4 border-t ${isDark ? "border-slate-800/50" : "border-border/50"} space-y-4`}>
          {/* User profile identifier Card */}
          <UserMenu />

          {/* Lang, Theme preferences bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            {/* Lang switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              className="flex items-center gap-1 hover:text-primary transition-colors uppercase font-bold text-[10px]"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === "en" ? "ZH" : "EN"}</span>
            </button>

            {/* Sun/Moon Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAutoTheme(false);
                  toggleTheme();
                }}
                className="hover:text-primary transition-all p-1"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-primary" />
                )}
              </button>

              {/* Checkbox auto adaptation */}
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAutoTheme}
                  onChange={(e) => setIsAutoTheme(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-3 h-3"
                />
                <span className="text-[9px] font-bold">Auto</span>
              </label>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}