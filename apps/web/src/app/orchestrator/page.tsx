"use client";

import { useState, useCallback } from "react";
import { NodeLibrary } from "./components/node-library";
import { Canvas } from "./components/canvas";
import { ConfigPanel } from "./components/config-panel";
import { WorkflowToolbar } from "./components/workflow-toolbar";
import type { WorkflowNode, NodeType } from "@x-workflow/db/schema/workflow";

/**
 * Default node configurations by type
 */
const defaultNodeConfigs: Record<NodeType, { name: string; config: Record<string, unknown> }> = {
  trigger: { name: "触发源", config: { url: "" } },
  condition: { name: "分流条件", config: { haltOnError: false } },
  parallel: { name: "并发算子", config: {} },
  multimodal: { name: "多模态合成", config: {} },
  llm_synthesis: { name: "LLM 合成引擎", config: { model: "gemini-2.0-flash", systemInstruction: "", temperature: 0.7 } },
};

/**
 * Generate unique node ID
 */
function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function OrchestratorPage() {
  // Workflow metadata
  const [workflowName, setWorkflowName] = useState("未命名工作流");
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  // Canvas state
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Get selected node
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  // Add node to canvas
  const handleAddNode = useCallback((type: NodeType) => {
    const defaults = defaultNodeConfigs[type];
    const newNode: WorkflowNode = {
      id: generateNodeId(),
      type,
      name: defaults.name,
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      config: { ...defaults.config },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  // Update node position
  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    );
  }, []);

  // Update node config
  const handleNodeConfigUpdate = useCallback((nodeId: string, config: Record<string, unknown>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n)),
    );
  }, []);

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  // Select node
  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Reset canvas
  const handleReset = useCallback(() => {
    setNodes([]);
    setSelectedNodeId(null);
    setWorkflowName("未命名工作流");
    setWorkflowId(null);
  }, []);

  // Set workflow data (for loading from DB)
  const handleSetWorkflow = useCallback((id: string, name: string, loadedNodes: WorkflowNode[]) => {
    setWorkflowId(id);
    setWorkflowName(name);
    setNodes(loadedNodes);
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <WorkflowToolbar
        workflowName={workflowName}
        workflowId={workflowId}
        nodes={nodes}
        onNameChange={setWorkflowName}
        onReset={handleReset}
        onLoadWorkflow={handleSetWorkflow}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node Library */}
        <NodeLibrary onAddNode={handleAddNode} />

        {/* Center: Canvas */}
        <Canvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onNodeMove={handleNodeMove}
          onSelectNode={handleSelectNode}
          onDeleteNode={handleDeleteNode}
        />

        {/* Right: Config Panel */}
        <ConfigPanel
          selectedNode={selectedNode}
          onConfigUpdate={handleNodeConfigUpdate}
        />
      </div>
    </div>
  );
}
