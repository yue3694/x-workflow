"use client";

import * as React from "react";
import { cn } from "@x-workflow/ui/lib/utils";
import type { WorkflowNode } from "@x-workflow/db/schema/workflow";

interface NodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onMove: (nodeId: string, x: number, y: number) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

const nodeTypeColors: Record<WorkflowNode["type"], string> = {
  trigger: "border-blue-500 bg-blue-50 dark:bg-blue-950",
  condition: "border-amber-500 bg-amber-50 dark:bg-amber-950",
  parallel: "border-green-500 bg-green-50 dark:bg-green-950",
  multimodal: "border-purple-500 bg-purple-50 dark:bg-purple-950",
  llm_synthesis: "border-pink-500 bg-pink-50 dark:bg-pink-950",
};

const nodeTypeLabels: Record<WorkflowNode["type"], string> = {
  trigger: "触发源",
  condition: "分流条件",
  parallel: "并发算子",
  multimodal: "多模态合成",
  llm_synthesis: "LLM 合成引擎",
};

export function NodeCard({
  node,
  isSelected,
  onMove,
  onSelect,
  onDelete,
}: NodeCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  // Handle mouse down (start drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return; // Don't drag when clicking delete button

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
        "absolute w-44 cursor-grab select-none rounded-lg border-2 bg-background p-3 shadow-sm transition-shadow",
        nodeTypeColors[node.type],
        isSelected && "ring-2 ring-primary ring-offset-2",
        isDragging && "cursor-grabbing shadow-lg",
      )}
      style={{
        left: node.x,
        top: node.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {nodeTypeLabels[node.type]}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Node name */}
      <p className="truncate text-sm font-medium">{node.name}</p>

      {/* Config preview */}
      <div className="mt-2 text-xs text-muted-foreground">
        {node.type === "trigger" && node.config.url && (
          <span className="truncate">URL: {node.config.url}</span>
        )}
        {node.type === "llm_synthesis" && node.config.model && (
          <span className="truncate">模型: {node.config.model}</span>
        )}
      </div>

      {/* Connection ports */}
      <div className="absolute -right-2 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
      <div className="absolute -bottom-2 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background" />
    </div>
  );
}
