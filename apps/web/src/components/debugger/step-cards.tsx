"use client";

import { cn } from "@x-workflow/ui/utils";

export interface PipelineStep {
  id: number;
  name: string;
  description: string;
  icon: string;
  status?: "pending" | "active" | "completed" | "error";
}

interface StepCardsProps {
  steps: PipelineStep[];
  activeStepId?: number;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  webhook: (
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
  shield: (
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
  database: (
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
  brain: (
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

export function StepCards({ steps, activeStepId }: StepCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step) => {
        const isActive = step.id === activeStepId;
        const isCompleted = step.status === "completed" || (activeStepId !== undefined && step.id < activeStepId);

        return (
          <div
            key={step.id}
            className={cn(
              "relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
              // Base styles
              "bg-card text-card-foreground",
              // Active state - pulsing highlight
              isActive && "border-primary shadow-lg shadow-primary/20 animate-pulse",
              // Completed state
              isCompleted && "border-green-500/50 bg-green-500/10",
              // Pending state
              !isActive && !isCompleted && "border-border opacity-60"
            )}
          >
            {/* Status indicator */}
            <div className="absolute right-3 top-3">
              {isActive && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <span className="size-2 animate-ping rounded-full bg-primary" />
                  Running
                </div>
              )}
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
            </div>

            {/* Step content */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  isActive && "bg-primary/20 text-primary",
                  isCompleted && "bg-green-500/20 text-green-500",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {STEP_ICONS[step.icon] || STEP_ICONS.webhook}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Step {step.id}
                  </span>
                  <h3
                    className={cn(
                      "font-semibold",
                      isActive && "text-primary"
                    )}
                  >
                    {step.name}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Progress bar for active step */}
            {isActive && (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full animate-progress rounded-full bg-primary" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
