"use client";

import * as React from "react";
import { cn } from "@x-workflow/ui/lib/utils";
import type { NodeType } from "@x-workflow/db/schema/workflow";
import { useAutoTheme, LANGUAGES, type Language } from "@x-workflow/ui";
import { Server, GitMerge, Layers3, FileText, Cpu } from "lucide-react";

interface NodeLibraryItem {
  type: NodeType;
  name: string;
  subtitle: string;
  desc: string;
  colorClass: string;
  icon: React.ReactNode;
}

interface NodeLibraryProps {
  onAddNode: (type: NodeType) => void;
}

export function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  const { activeTheme } = useAutoTheme();
  const [language, setLanguage] = React.useState<Language>("zh");
  const strings = LANGUAGES[language];
  const isDark = activeTheme === "dark";

  const nodeTypes: NodeLibraryItem[] = [
    {
      type: "trigger",
      name: strings.triggerNode,
      subtitle: strings.triggerSub,
      desc: "API Endpoint, Event Trigger, Cron Timer",
      colorClass: "bg-amber-500/10 border-amber-500/30 text-amber-500",
      icon: <Server className="size-4" />,
    },
    {
      type: "condition",
      name: strings.conditionNode,
      subtitle: strings.conditionSub,
      desc: "Heuristic classification & validation gating",
      colorClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
      icon: <GitMerge className="size-4" />,
    },
    {
      type: "parallel",
      name: strings.parallelNode,
      subtitle: strings.parallelSub,
      desc: "High throughput chunk mapper",
      colorClass: "bg-sky-500/10 border-sky-500/30 text-sky-500",
      icon: <Layers3 className="size-4" />,
    },
    {
      type: "multimodal",
      name: strings.multimodalNode,
      subtitle: strings.multimodalSub,
      desc: "Vision and text vector fusion",
      colorClass: "bg-purple-500/10 border-purple-500/30 text-purple-500",
      icon: <FileText className="size-4" />,
    },
    {
      type: "llm_synthesis",
      name: strings.llmSynthesisTitle,
      subtitle: strings.llmSynthesisDesc,
      desc: "Complex cognitive prompt summarization",
      colorClass: "bg-primary/10 border-primary/30 text-primary",
      icon: <Cpu className="size-4" />,
    },
  ];

  return (
    <div
      className={cn(
        "w-72 shrink-0 p-4 overflow-y-auto",
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"
      )}
    >
      <div className="mb-4">
        <h2 className="text-xs font-bold font-mono tracking-widest text-muted-foreground uppercase mb-1">
          {strings.nodeLibrarySub}
        </h2>
        <h1 className="font-headline text-lg font-bold text-foreground">
          {strings.nodeLibraryTitle}
        </h1>
      </div>

      <div className="space-y-3">
        {nodeTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddNode(item.type)}
            className={cn(
              "group w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 shadow-sm",
              isDark
                ? "bg-[#1E293B] border-slate-800 hover:border-primary/50 hover:bg-[#1E293B]"
                : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                item.colorClass
              )}
            >
              {item.icon}
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-foreground leading-tight">{item.name}</h3>
                <span className="text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold font-mono">
                  + {language === "en" ? "ADD" : "添加"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-light line-clamp-2 leading-snug">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}