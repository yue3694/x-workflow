/**
 * Workflow execution engine — processes a saved workflow's nodes (sorted by
 * canvas x-coordinate, since the schema has no explicit edge/connection data)
 * and threads a shared context through each step.
 */

import type { WorkflowNode } from "@x-workflow/db/schema/workflow";
import { generateReply, isGeminiConfigured } from "./gemini";
import { searchSimilarChunks } from "./rag";

export interface StepResult {
  nodeId: string;
  type: WorkflowNode["type"];
  name: string;
  status: "completed" | "error" | "skipped";
  durationMs: number;
  detail: string;
}

export interface ExecutionResult {
  steps: StepResult[];
  finalText: string;
  haltedAt?: string;
}

interface ExecutionContext {
  text: string;
  retrievedChunks?: string[];
}

const SENSITIVE_KEYWORDS = ["password", "secret", "credit card", "ssn"];

class StepTimeoutError extends Error {
  constructor() {
    super("Step execution timed out");
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new StepTimeoutError()), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

function executeTrigger(node: WorkflowNode, context: ExecutionContext): string {
  const url = node.config.url;
  return url
    ? `Trigger received (configured webhook: ${url})`
    : "Trigger received (no webhook configured)";
}

function executeCondition(node: WorkflowNode, context: ExecutionContext): {
  passed: boolean;
  detail: string;
} {
  const text = context.text.trim();

  if (text.length < 2) {
    return { passed: false, detail: "Condition failed: input text too short" };
  }

  const lowerText = text.toLowerCase();
  const hitKeyword = SENSITIVE_KEYWORDS.find((kw) => lowerText.includes(kw));
  if (hitKeyword) {
    return {
      passed: false,
      detail: `Condition failed: input contains sensitive keyword ("${hitKeyword}")`,
    };
  }

  return { passed: true, detail: "Condition passed" };
}

async function executeParallel(context: ExecutionContext): Promise<string> {
  const sentences = context.text
    .split(/(?<=[.!?。！？])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const chunksToProcess = sentences.length > 0 ? sentences : [context.text];

  const processed = await Promise.all(
    chunksToProcess.map(async (chunk) => chunk),
  );

  return `Processed ${processed.length} chunk(s) in parallel`;
}

async function executeMultimodal(
  node: WorkflowNode,
  context: ExecutionContext,
  userId: string,
): Promise<{ detail: string; retrievedChunks?: string[] }> {
  const knowledgeBaseId = node.config.knowledgeBaseId;

  if (!knowledgeBaseId) {
    return { detail: "No knowledge base configured, passing through" };
  }

  const chunks = await searchSimilarChunks(knowledgeBaseId, userId, context.text, 3);

  if (chunks.length === 0) {
    return { detail: "Knowledge base configured but no matching chunks found" };
  }

  return {
    detail: `Retrieved ${chunks.length} relevant chunk(s) from knowledge base`,
    retrievedChunks: chunks,
  };
}

async function executeLlmSynthesisOnce(
  node: WorkflowNode,
  context: ExecutionContext,
): Promise<string> {
  const fullPrompt = context.retrievedChunks?.length
    ? `${context.text}\n\nRelevant context:\n${context.retrievedChunks.join("\n")}`
    : context.text;

  if (!isGeminiConfigured()) {
    return `[simulated] Synthesized reply for: ${fullPrompt.slice(0, 200)}`;
  }

  return generateReply({
    message: fullPrompt,
    systemInstruction: node.config.systemInstruction,
    temperature: node.config.temperature,
    model: node.config.model,
  });
}

async function executeLlmSynthesis(
  node: WorkflowNode,
  context: ExecutionContext,
): Promise<string> {
  const maxRetries = node.config.maxRetries ?? 0;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await executeLlmSynthesisOnce(node, context);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("LLM synthesis failed");
}

export async function executeWorkflow({
  nodes,
  userId,
  message,
}: {
  nodes: WorkflowNode[];
  userId: string;
  message: string;
}): Promise<ExecutionResult> {
  const orderedNodes = [...nodes].sort((a, b) => a.x - b.x);

  const context: ExecutionContext = { text: message };
  const steps: StepResult[] = [];
  let haltedAt: string | undefined;

  for (const node of orderedNodes) {
    const start = Date.now();
    const timeoutMs = node.config.timeout ?? 30000;

    try {
      const result = await withTimeout(
        (async () => {
          switch (node.type) {
            case "trigger": {
              const detail = executeTrigger(node, context);
              return { detail };
            }

            case "condition": {
              const { passed, detail } = executeCondition(node, context);
              return { detail, halt: !passed && node.config.haltOnError === true, failed: !passed };
            }

            case "parallel": {
              const detail = await executeParallel(context);
              return { detail };
            }

            case "multimodal": {
              const { detail, retrievedChunks } = await executeMultimodal(node, context, userId);
              if (retrievedChunks) {
                context.retrievedChunks = retrievedChunks;
              }
              return { detail };
            }

            case "llm_synthesis": {
              const replyText = await executeLlmSynthesis(node, context);
              context.text = replyText;
              return { detail: "LLM synthesis completed" };
            }

            default:
              return { detail: "Unknown node type, skipped" };
          }
        })(),
        timeoutMs,
      );

      const durationMs = Date.now() - start;

      if (result.failed) {
        steps.push({
          nodeId: node.id,
          type: node.type,
          name: node.name,
          status: "error",
          durationMs,
          detail: result.detail,
        });

        if (result.halt) {
          haltedAt = node.id;
          break;
        }
        continue;
      }

      steps.push({
        nodeId: node.id,
        type: node.type,
        name: node.name,
        status: "completed",
        durationMs,
        detail: result.detail,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      const detail =
        err instanceof StepTimeoutError
          ? `Step timed out after ${timeoutMs}ms`
          : `Step failed: ${err instanceof Error ? err.message : "unknown error"}`;

      steps.push({
        nodeId: node.id,
        type: node.type,
        name: node.name,
        status: "error",
        durationMs,
        detail,
      });

      if (node.config.haltOnError === true) {
        haltedAt = node.id;
        break;
      }
    }
  }

  return {
    steps,
    finalText: context.text,
    haltedAt,
  };
}
