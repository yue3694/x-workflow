"use client";

import * as React from "react";
import { cn } from "@x-workflow/ui/lib/utils";
import type { WorkflowNode } from "@x-workflow/db/schema/workflow";
import { Trash2 } from "lucide-react";
import { useAutoTheme } from "@x-workflow/ui";

interface NodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onMove: (nodeId: string, x: number, y: number) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

const nodeTypeColors: Record<WorkflowNode["type"], { dot: string; border: string; bg: string }> = {
  trigger: { dot: "bg-amber-400", border: "border-amber-500/30", bg: "hover:border-amber-500/50" },
  condition: { dot: "bg-emerald-400", border: "border-emerald-500/30", bg: "hover:border-emerald-500/50" },
  parallel: { dot: "bg-sky-400", border: "border-sky-500/30", bg: "hover:border-sky-500/50" },
  multimodal: { dot: "bg-purple-400", border: "border-purple-500/30", bg: "hover:border-purple-500/50" },
  llm_synthesis: { dot: "bg-primary", border: "border-primary/30", bg: "hover:border-primary/50" },
};

const nodeTypeLabels: Record<WorkflowNode["type"], string> = {
  trigger: "TRIGGER",
  condition: "CONDITION",
  parallel: "PARALLEL",
  multimodal: "MULTIMODAL",
  llm_synthesis: "LLM_SYNTHESIS",
};

export function NodeCard({
  node,
  isSelected,
  onMove,
  onSelect,
  onDelete,
}: NodeCardProps) {
  const { activeTheme } = useAutoTheme();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const isDark = activeTheme === "dark";

  const colors = nodeTypeColors[node.type];

  // Handle mouse down (start drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    onSelect(node.id);
  };

  // Handle mouse move (drag)
  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onMove(node.id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, node.id, onMove]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute w-44 cursor-grab select-none rounded-xl border p-3.5 transition-all",
        isSelected
          ? "bg-background border-primary ring-2 ring-primary/10 shadow-lg scale-105 z-20"
          : cn("bg-background border-border hover:bg-muted/50 shadow-sm z-10", colors.border, colors.bg),
        isDragging && "cursor-grabbing shadow-lg",
        isDark ? "" : ""
      )}
      style={{
        left: node.x,
        top: node.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between pb-1.5 border-b border-border/10">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
          <span className="font-mono text-[9px] uppercase font-bold text-muted-foreground">
            {nodeTypeLabels[node.type]}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      {/* Node name */}
      <h4 className="text-xs font-semibold text-foreground truncate leading-tight mb-1">
        {node.name}
      </h4>
      <p className="text-[10px] text-muted-foreground line-clamp-1 italic font-mono">
        {node.id}
      </p>

      {/* Config preview */}
      <div className="mt-2 text-[10px] text-muted-foreground">
        {node.type === "trigger" && node.config.url && (
          <span className="truncate block">URL: {node.config.url}</span>
        )}
        {node.type === "llm_synthesis" && node.config.model && (
          <span className="truncate block">Model: {node.config.model}</span>
        )}
      </div>

      {/* Connection ports */}
      <div className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
      <div className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background" />
    </div>
  );
}