"use client";

import * as React from "react";
import { cn } from "@x-workflow/ui/lib/utils";
import type { NodeType } from "@x-workflow/db/schema/workflow";

interface NodeLibraryItem {
  type: NodeType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const nodeTypes: NodeLibraryItem[] = [
  {
    type: "trigger",
    name: "触发源",
    description: "Webhook / 定时触发",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    type: "condition",
    name: "分流条件",
    description: "条件分支判断",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    ),
  },
  {
    type: "parallel",
    name: "并发算子",
    description: "并行执行任务",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    type: "multimodal",
    name: "多模态合成",
    description: "多模态内容处理",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: "llm_synthesis",
    name: "LLM 合成引擎",
    description: "AI 大模型调用",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

interface NodeLibraryProps {
  onAddNode: (type: NodeType) => void;
}

export function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  return (
    <div className="w-56 shrink-0 border-r bg-muted/20 p-4">
      <h2 className="mb-4 text-sm font-semibold text-foreground">节点库</h2>
      <div className="space-y-2">
        {nodeTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddNode(item.type)}
            className={cn(
              "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
              "hover:border-primary/50 hover:bg-muted/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
