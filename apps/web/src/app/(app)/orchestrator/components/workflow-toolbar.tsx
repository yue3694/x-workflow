"use client";

import * as React from "react";
import { Button } from "@x-workflow/ui/components/button";
import { Input } from "@x-workflow/ui/components/input";
import { Label } from "@x-workflow/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@x-workflow/ui/components/select";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import type { WorkflowNode } from "@x-workflow/db/schema/workflow";

interface WorkflowToolbarProps {
  workflowName: string;
  workflowId: string | null;
  nodes: WorkflowNode[];
  onNameChange: (name: string) => void;
  onReset: () => void;
  onLoadWorkflow: (id: string, name: string, nodes: WorkflowNode[]) => void;
}

export function WorkflowToolbar({
  workflowName,
  workflowId,
  nodes,
  onNameChange,
  onReset,
  onLoadWorkflow,
}: WorkflowToolbarProps) {
  // List workflows query
  const listQuery = trpc.workflow.list.useQuery({ limit: 20 });

  // Mutations
  const createMutation = trpc.workflow.create.useMutation({
    onSuccess: (data) => {
      toast.success("工作流已创建");
      // Update URL or state with new ID would happen here
      // For now, trigger a reload
      void listQuery.refetch();
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });

  const updateMutation = trpc.workflow.update.useMutation({
    onSuccess: () => {
      toast.success("工作流已保存");
    },
    onError: (error) => {
      toast.error(`保存失败: ${error.message}`);
    },
  });

  // Get single workflow query
  const getQuery = trpc.workflow.get.useQuery(
    { id: workflowId ?? "" },
    {
      enabled: false, // Only run manually
    },
  );

  // Handle save
  const handleSave = () => {
    if (!workflowName.trim()) {
      toast.error("请输入工作流名称");
      return;
    }

    if (workflowId) {
      // Update existing
      updateMutation.mutate({
        id: workflowId,
        name: workflowName,
        nodes,
      });
    } else {
      // Create new
      createMutation.mutate({
        name: workflowName,
        nodes,
      });
    }
  };

  // Handle load
  const handleLoad = (id: string) => {
    trpc.workflow.get.useQuery(
      { id },
      {
        enabled: true,
      },
    ).refetch().then((result) => {
      if (result.data) {
        onLoadWorkflow(result.data.id, result.data.name, result.data.nodes);
        toast.success("工作流已加载");
      }
    }).catch(() => {
      toast.error("加载失败");
    });
  };

  // Handle new
  const handleNew = () => {
    if (nodes.length > 0) {
      if (!confirm("当前有未保存的更改，确定要创建新工作流吗？")) {
        return;
      }
    }
    onReset();
    toast.success("已创建新工作流");
  };

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left: Workflow name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="workflow-name" className="text-sm font-medium">
            工作流名称
          </Label>
          <Input
            id="workflow-name"
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-48"
            placeholder="输入工作流名称"
          />
        </div>

        {workflowId && (
          <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
            ID: {workflowId.slice(0, 8)}...
          </span>
        )}
      </div>

      {/* Center: Load workflow */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">加载:</Label>
        <Select onValueChange={handleLoad}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择工作流..." />
          </SelectTrigger>
          <SelectContent>
            {listQuery.data?.workflows.map((wf) => (
              <SelectItem key={wf.id} value={wf.id}>
                {wf.name} ({wf.nodeCount} 节点)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleNew}>
          新建
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          重置
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
