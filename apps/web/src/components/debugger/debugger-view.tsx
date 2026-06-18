"use client";

import { useState, useEffect, useCallback } from "react";

import { trpc } from "@/utils/trpc";
import { StepCards, type PipelineStep } from "./step-cards";
import { ChatPanel, type ChatMessage } from "./chat-panel";
import { LogConsole, type SystemLog, createLog, generateConnectionLogs } from "./log-console";
import { cn } from "@x-workflow/ui/lib/utils";

interface DebuggerViewProps {
  className?: string;
}

export function DebuggerView({ className }: DebuggerViewProps) {
  // Selected workflow
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | undefined>(undefined);

  // Pipeline state
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Workflows available for selection
  const { data: workflowsData } = trpc.debugger.listWorkflows.useQuery({ limit: 20 });

  // Fetch pipeline step preview from backend (depends on selected workflow)
  const { data: stepsData } = trpc.debugger.getSteps.useQuery(
    { workflowId: selectedWorkflowId },
    { staleTime: 0 },
  );

  // Initialize/reset steps preview when the selection or its data changes
  useEffect(() => {
    if (stepsData) {
      setSteps(stepsData.map((s) => ({ ...s, status: "pending" })));
    }
  }, [stepsData]);

  // Initialize logs on mount
  useEffect(() => {
    setLogs(generateConnectionLogs());
  }, []);

  // Chat mutation
  const chatMutation = trpc.debugger.chat.useMutation({
    onError: (error) => {
      addLog("WARN", `Error: ${error.message}`);
      setIsExecuting(false);
      setIsProcessing(false);
    },
  });

  // Helper: add a single log
  const addLog = useCallback((level: SystemLog["level"], message: string) => {
    setLogs((prev) => {
      const newLog = createLog(level, message);
      // Keep only last 500 logs
      return prev.length >= 500 ? [...prev.slice(-499), newLog] : [...prev, newLog];
    });
  }, []);

  // Handle message send
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (isProcessing || isExecuting) return;

      setIsProcessing(true);
      setIsExecuting(true);
      addLog("INFO", `User input received: "${message.slice(0, 50)}${message.length > 50 ? "..." : ""}"`);

      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const result = await chatMutation.mutateAsync({
          message,
          workflowId: selectedWorkflowId,
        });

        // Render the backend's real step results directly (no fake animation)
        setSteps(
          result.steps.map((s) => ({
            id: s.id,
            name: s.name,
            status: s.status,
            durationMs: s.duration,
            detail: s.detail,
          })),
        );

        if (result.haltedAt) {
          addLog("WARN", `Pipeline halted at node ${result.haltedAt}`);
        }
        addLog("INFO", "Pipeline execution completed");

        const agentMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          role: "agent",
          content: result.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } catch (error) {
        addLog("WARN", `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsExecuting(false);
        setIsProcessing(false);
      }
    },
    [isProcessing, isExecuting, addLog, chatMutation, selectedWorkflowId]
  );

  // Handle clear logs
  const handleClearLogs = useCallback(() => {
    setLogs([]);
    addLog("INFO", "Console cleared");
  }, [addLog]);

  // Status query
  const { data: statusData } = trpc.debugger.getStatus.useQuery(undefined, {
    refetchInterval: 30000, // Check every 30s
  });

  return (
    <div className={cn("flex h-[calc(100vh-4rem)] gap-4 p-4", className)}>
      {/* Left: Pipeline Steps */}
      <div className="w-80 shrink-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Pipeline Steps</h2>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full",
                statusData?.connected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {statusData?.connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <select
          className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedWorkflowId ?? ""}
          onChange={(e) => setSelectedWorkflowId(e.target.value || undefined)}
        >
          <option value="">未选择工作流（单步模拟）</option>
          {workflowsData?.map((wf) => (
            <option key={wf.id} value={wf.id}>
              {wf.name} ({wf.nodeCount} 节点)
            </option>
          ))}
        </select>

        <StepCards steps={steps} isExecuting={isExecuting} />
      </div>

      {/* Center: Chat Panel */}
      <div className="flex flex-1 flex-col rounded-lg border bg-card">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing || isExecuting}
        />
      </div>

      {/* Bottom: Log Console */}
      <div className="h-64 w-full shrink-0 lg:hidden xl:block xl:h-auto xl:w-80">
        <div className="h-full">
          <LogConsole logs={logs} onClear={handleClearLogs} />
        </div>
      </div>
    </div>
  );
}
