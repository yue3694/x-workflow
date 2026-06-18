"use client";

import { useState, useRef, useEffect } from "react";

import { cn } from "@x-workflow/ui/lib/utils";
import { Button } from "@x-workflow/ui/components/button";

export type LogLevel = "INFO" | "TRACE" | "LOG" | "WARN" | "EXEC" | "DEBUG";

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

interface LogConsoleProps {
  logs: SystemLog[];
  onClear?: () => void;
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: "text-green-400",
  TRACE: "text-pink-400",
  LOG: "text-gray-400",
  WARN: "text-yellow-400",
  EXEC: "text-cyan-400",
  DEBUG: "text-blue-400",
};

const LOG_LEVEL_PREFIX: Record<LogLevel, string> = {
  INFO: "[INFO]",
  TRACE: "[TRACE]",
  LOG: "[LOG]",
  WARN: "[WARN]",
  EXEC: "[EXEC]",
  DEBUG: "[DBG]",
};

const MAX_LOGS = 500;

export function LogConsole({ logs, onClear }: LogConsoleProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-black/95 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-green-400">Console</span>
          </div>
          <span className="text-white/40">
            {logs.length} / {MAX_LOGS}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "h-6 px-2 text-[10px]",
              autoScroll
                ? "text-green-400 hover:text-green-300"
                : "text-white/40 hover:text-white/60"
            )}
          >
            {autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={logs.length === 0}
            className="h-6 px-2 text-[10px] text-white/40 hover:text-white/60"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2"
      >
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/30">
            No logs yet. Send a message to see execution logs.
          </div>
        ) : (
          <div className="space-y-0.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5">
                {/* Timestamp */}
                <span className="shrink-0 text-white/30">
                  {log.timestamp}
                </span>

                {/* Level */}
                <span
                  className={cn(
                    "shrink-0 w-12 font-semibold",
                    LOG_LEVEL_COLORS[log.level]
                  )}
                >
                  {LOG_LEVEL_PREFIX[log.level]}
                </span>

                {/* Message */}
                <span className="break-all text-white/80">
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to create a log entry
 */
export function createLog(
  level: LogLevel,
  message: string,
  timestamp?: Date
): SystemLog {
  const now = timestamp ?? new Date();
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    level,
    message,
  };
}

/**
 * Generate initial connection logs
 */
export function generateConnectionLogs(): SystemLog[] {
  const now = new Date();
  return [
    createLog("INFO", "Debugger session initialized", now),
    createLog("EXEC", "Connecting to pipeline orchestrator...", new Date(now.getTime() + 100)),
    createLog("INFO", "Pipeline steps loaded: 4 steps configured", new Date(now.getTime() + 200)),
    createLog("DEBUG", "Environment: sandbox mode active", new Date(now.getTime() + 300)),
    createLog("INFO", "Ready to process requests", new Date(now.getTime() + 400)),
  ];
}
