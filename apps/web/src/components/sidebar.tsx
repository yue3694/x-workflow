"use client";

import {
  Cpu,
  Database,
  LayoutDashboard,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeToggle } from "./mode-toggle";
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

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-border bg-secondary">
      <div>
        <div className="border-b border-border/50 p-6">
          <div className="mb-1.5 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
              <span className="font-headline text-sm font-bold text-primary">
                X
              </span>
            </div>
            <span className="font-headline text-lg font-bold tracking-tight text-foreground">
              x-workflow
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            AI Orchestrator
          </span>
        </div>

        <nav className="space-y-1 p-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? "border-l-2 border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-border/50 p-4">
        <UserMenu />
        <div className="flex items-center justify-end">
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
}
