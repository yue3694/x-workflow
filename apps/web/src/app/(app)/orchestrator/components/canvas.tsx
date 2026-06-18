"use client";

import * as React from "react";
import { NodeCard } from "./node-card";
import type { WorkflowNode } from "@x-workflow/db/schema/workflow";

interface CanvasProps {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onSelectNode: (nodeId: string | null) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function Canvas({
  nodes,
  selectedNodeId,
  onNodeMove,
  onSelectNode,
  onDeleteNode,
}: CanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });

  // Handle canvas background click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
      onSelectNode(null);
    }
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
      if (e.button === 0) { // Left click
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Calculate connections for SVG lines
  const getNodePortPosition = (node: WorkflowNode, side: "right" | "bottom") => {
    const cardWidth = 180;
    const cardHeight = 80;
    return {
      x: node.x + cardWidth / 2,
      y: node.y + (side === "right" ? cardHeight / 2 : cardHeight),
    };
  };

  return (
    <div
      ref={containerRef}
      className="canvas-bg relative flex-1 overflow-hidden bg-dot-pattern"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, var(--muted-foreground) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          opacity: 0.3,
        }}
      />

      {/* SVG layer for connections */}
      <svg
        className="pointer-events-none absolute inset-0"
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {/* Connection lines would go here */}
        {/* For now, simple visualization - could add later */}
      </svg>

      {/* Nodes layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onMove={onNodeMove}
            onSelect={onSelectNode}
            onDelete={onDeleteNode}
          />
        ))}
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">空白画布</p>
            <p className="text-sm">从左侧节点库添加节点开始构建工作流</p>
          </div>
        </div>
      )}
    </div>
  );
}
