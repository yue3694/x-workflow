"use client";

import { useState, useEffect, useCallback } from "react";

import { trpc } from "@web/utils/trpc";
import { StepCards, type PipelineStep } from "./step-cards";
import { ChatPanel, type ChatMessage } from "./chat-panel";
import { LogConsole, type SystemLog, createLog, generateConnectionLogs } from "./log-console";
import { cn } from "@x-workflow/ui/utils";
import { Button } from "@x-workflow/ui/components/button";

const STEP_DELAY = 500; // ms per step during simulation

interface DebuggerViewProps {
  className?: string;
}

export function DebuggerView({ className }: DebuggerViewProps) {
  // Pipeline state
  const [activeStepId, setActiveStepId] = useState<number | undefined>(undefined);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Fetch pipeline steps from backend
  const { data: stepsData } = trpc.debugger.getSteps.useQuery(undefined, {
    staleTime: Infinity,
  });

  // Initialize steps from backend data
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

  // Execute pipeline simulation
  const executePipeline = useCallback(
    async (userMessage: string, agentResponse: string) => {
      setIsExecuting(true);
      addLog("EXEC", "Pipeline execution started");

      // Add user message to chat
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Simulate each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setActiveStepId(step.id);
        addLog("EXEC", `Executing Step ${step.id}: ${step.name}`);

        // Simulate work
        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY));

        // Log step completion
        addLog("INFO", `Step ${step.id} completed successfully`);

        // Update step status
        setSteps((prev) =>
          prev.map((s) =>
            s.id === step.id ? { ...s, status: "completed" } : s
          )
        );
      }

      // Clear active step
      setActiveStepId(undefined);
      setIsExecuting(false);

      // Add agent response to chat
      const agentMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "agent",
        content: agentResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);

      addLog("INFO", "Pipeline execution completed");
    },
    [steps, addLog]
  );

  // Handle message send
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (isProcessing || isExecuting) return;

      setIsProcessing(true);
      addLog("INFO", `User input received: "${message.slice(0, 50)}${message.length > 50 ? "..." : ""}"`);

      try {
        const result = await chatMutation.mutateAsync({
          message,
        });

        await executePipeline(message, result.response);
      } catch (error) {
        addLog("WARN", `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setIsProcessing(false);
      }
    },
    [isProcessing, isExecuting, addLog, chatMutation, executePipeline]
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
        <StepCards steps={steps} activeStepId={activeStepId} />
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
