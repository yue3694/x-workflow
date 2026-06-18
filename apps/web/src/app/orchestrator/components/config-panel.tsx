"use client";

import * as React from "react";
import { Button } from "@x-workflow/ui/components/button";
import { Input } from "@x-workflow/ui/components/input";
import { Label } from "@x-workflow/ui/components/label";
import type { WorkflowNode } from "@x-workflow/db/schema/workflow";
import { trpc } from "@/utils/trpc";

interface ConfigPanelProps {
  selectedNode: WorkflowNode | null;
  onConfigUpdate: (nodeId: string, config: Record<string, unknown>) => void;
}

export function ConfigPanel({ selectedNode, onConfigUpdate }: ConfigPanelProps) {
  const [localConfig, setLocalConfig] = React.useState<Record<string, unknown>>({});
  const { data: documents } = trpc.knowledge.list.useQuery();

  // Sync local config when selected node changes
  React.useEffect(() => {
    if (selectedNode) {
      setLocalConfig(selectedNode.config ?? {});
    } else {
      setLocalConfig({});
    }
  }, [selectedNode]);

  // Handle input change
  const handleChange = (key: string, value: unknown) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    if (selectedNode) {
      onConfigUpdate(selectedNode.id, newConfig);
    }
  };

  // Render config form based on node type
  const renderConfigForm = () => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case "trigger":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/webhook"
                value={(localConfig.url as string) ?? ""}
                onChange={(e) => handleChange("url", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                工作流触发时的 Webhook 回调地址
              </p>
            </div>
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="haltOnError"
                checked={(localConfig.haltOnError as boolean) ?? false}
                onChange={(e) => handleChange("haltOnError", e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="haltOnError">错误时停止执行</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              启用后，遇到错误时将停止后续节点执行
            </p>
          </div>
        );

      case "llm_synthesis":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">模型</Label>
              <select
                id="model"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={(localConfig.model as string) ?? "gemini-2.0-flash"}
                onChange={(e) => handleChange("model", e.target.value)}
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemInstruction">系统指令</Label>
              <textarea
                id="systemInstruction"
                rows={4}
                placeholder="定义 AI 助手的角色和行为..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={(localConfig.systemInstruction as string) ?? ""}
                onChange={(e) => handleChange("systemInstruction", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {(localConfig.temperature as number) ?? 0.7}</Label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={(localConfig.temperature as number) ?? 0.7}
                onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>精确</span>
                <span>创意</span>
              </div>
            </div>
          </div>
        );

      case "multimodal":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="knowledgeBaseId">关联知识库</Label>
              <select
                id="knowledgeBaseId"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={(localConfig.knowledgeBaseId as string) ?? ""}
                onChange={(e) => handleChange("knowledgeBaseId", e.target.value || undefined)}
              >
                <option value="">不关联知识库</option>
                {documents?.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                执行时将从该知识库检索相关片段融合进上下文
              </p>
            </div>
          </div>
        );

      case "parallel":
        return (
          <div className="text-sm text-muted-foreground">
            <p>此节点类型暂无可配置参数</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-72 shrink-0 border-l bg-muted/20 p-4">
      <h2 className="mb-4 text-sm font-semibold text-foreground">节点配置</h2>

      {selectedNode ? (
        <div className="space-y-4">
          {/* Node info */}
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm font-medium">{selectedNode.name}</p>
            <p className="text-xs text-muted-foreground">
              ID: {selectedNode.id.slice(0, 12)}...
            </p>
          </div>

          {/* Config form */}
          {renderConfigForm()}

          {/* Global config section */}
          <div className="border-t pt-4">
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">全局配置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="maxRetries" className="text-sm shrink-0">最大重试次数</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min={0}
                  max={5}
                  className="h-8 w-20 text-right"
                  value={(localConfig.maxRetries as number) ?? 0}
                  onChange={(e) =>
                    handleChange("maxRetries", Math.min(5, Math.max(0, Number(e.target.value) || 0)))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="timeout" className="text-sm shrink-0">超时时间 (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min={100}
                  max={30000}
                  step={100}
                  className="h-8 w-24 text-right"
                  value={(localConfig.timeout as number) ?? 30000}
                  onChange={(e) =>
                    handleChange(
                      "timeout",
                      Math.min(30000, Math.max(100, Number(e.target.value) || 100)),
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          <p>选择画布上的节点以配置其参数</p>
        </div>
      )}
    </div>
  );
}
