"use client";

import { cn } from "@x-workflow/ui/lib/utils";

export interface PipelineStep {
  id: string;
  type?: string;
  name: string;
  description?: string;
  status?: "pending" | "completed" | "error" | "skipped";
  durationMs?: number;
  detail?: string;
}

interface StepCardsProps {
  steps: PipelineStep[];
  isExecuting?: boolean;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  trigger: (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  ),
  condition: (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  parallel: (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  multimodal: (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  llm_synthesis: (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
};

export function StepCards({ steps, isExecuting }: StepCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step) => {
        const isCompleted = step.status === "completed";
        const isError = step.status === "error";

        return (
          <div
            key={step.id}
            className={cn(
              "relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
              "bg-card text-card-foreground",
              isExecuting && !step.status && "border-primary shadow-lg shadow-primary/20 animate-pulse",
              isCompleted && "border-green-500/50 bg-green-500/10",
              isError && "border-red-500/50 bg-red-500/10",
              !isCompleted && !isError && !isExecuting && "border-border opacity-60"
            )}
          >
            {/* Status indicator */}
            <div className="absolute right-3 top-3">
              {isCompleted && (
                <svg
                  className="size-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {isError && (
                <svg
                  className="size-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Step content */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  isCompleted && "bg-green-500/20 text-green-500",
                  isError && "bg-red-500/20 text-red-500",
                  !isCompleted && !isError && "bg-muted text-muted-foreground"
                )}
              >
                {STEP_ICONS[step.type ?? "trigger"] || STEP_ICONS.trigger}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{step.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.detail ?? step.description}
                </p>
                {step.durationMs !== undefined && (
                  <p className="mt-1 text-xs text-muted-foreground">{step.durationMs}ms</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
