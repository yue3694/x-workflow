import { z } from "zod";

import { db } from "@x-workflow/db";
import { workflow, type WorkflowNode } from "@x-workflow/db/schema/workflow";
import { eq, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../index";
import { generateReply, isGeminiConfigured } from "../utils/gemini";
import { executeWorkflow } from "../utils/workflow-engine";

/**
 * Generic placeholder steps shown when no workflow is selected
 */
const PLACEHOLDER_STEPS = [
  {
    id: "placeholder",
    type: "trigger" as const,
    name: "未选择工作流",
    description: "选择一个工作流以查看真实的节点执行轨迹",
  },
];

/**
 * Simulated response templates based on input
 */
const RESPONSE_TEMPLATES = [
  "Based on the workflow configuration, processing your request through the pipeline.",
  "Analyzing the input with semantic understanding and contextual awareness.",
  "Synthesizing a response using the configured LLM parameters and knowledge base.",
  "The pipeline executed successfully with all steps completing as expected.",
];

function pickSimulatedReply(): string {
  const responseIndex = Math.floor(Math.random() * RESPONSE_TEMPLATES.length);
  return RESPONSE_TEMPLATES[responseIndex]!;
}

async function loadOwnedWorkflowNodes(
  workflowId: string,
  userId: string,
): Promise<WorkflowNode[] | null> {
  const wf = await db
    .select()
    .from(workflow)
    .where(eq(workflow.id, workflowId))
    .limit(1);

  const record = wf[0];
  if (!record || record.userId !== userId) {
    return null;
  }

  try {
    const nodes = record.nodes ? JSON.parse(record.nodes) : [];
    return Array.isArray(nodes) ? nodes : [];
  } catch {
    return [];
  }
}

export const debuggerRouter = router({
  /**
   * Get pipeline step preview for a workflow (or a generic placeholder if none selected)
   */
  getSteps: protectedProcedure
    .input(
      z.object({
        workflowId: z.string().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!input?.workflowId) {
        return PLACEHOLDER_STEPS;
      }

      const userId = ctx.session.user.id;
      const nodes = await loadOwnedWorkflowNodes(input.workflowId, userId);

      if (!nodes || nodes.length === 0) {
        return PLACEHOLDER_STEPS;
      }

      return [...nodes]
        .sort((a, b) => a.x - b.x)
        .map((node) => ({
          id: node.id,
          type: node.type,
          name: node.name,
          description: `节点类型: ${node.type}`,
        }));
    }),

  /**
   * Get connection status
   */
  getStatus: protectedProcedure.query(() => {
    return {
      connected: isGeminiConfigured(),
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }),

  /**
   * Send a chat message and get LLM response
   * This is a sandbox environment that doesn't modify real data
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(10000),
        workflowId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const nodes = input.workflowId
        ? await loadOwnedWorkflowNodes(input.workflowId, userId)
        : null;

      if (nodes && nodes.length > 0) {
        const result = await executeWorkflow({
          nodes,
          userId,
          message: input.message,
        });

        const llmNode = nodes.find((n) => n.type === "llm_synthesis");
        const llmConfig = llmNode?.config
          ? {
              model: llmNode.config.model,
              systemInstruction: llmNode.config.systemInstruction,
              temperature: llmNode.config.temperature,
            }
          : {};

        return {
          response: result.finalText,
          llmConfig,
          steps: result.steps.map((step) => ({
            id: step.nodeId,
            name: step.name,
            status: step.status,
            duration: step.durationMs,
            detail: step.detail,
          })),
          haltedAt: result.haltedAt,
        };
      }

      // No workflow selected (or workflow has no nodes): fall back to the
      // single-step simulated/real LLM reply path.
      const baseResponse = isGeminiConfigured()
        ? await generateReply({
            message: input.message,
            systemInstruction: "Summarize the input concisely.",
            temperature: 0.7,
            model: "gemini-3.5-flash",
          }).catch((err) => {
            console.error(
              "[debugger.chat] Gemini call failed, falling back to simulation",
              err,
            );
            return pickSimulatedReply();
          })
        : pickSimulatedReply();

      return {
        response: baseResponse,
        llmConfig: {},
        steps: [
          {
            id: "placeholder",
            name: "未选择工作流",
            status: "completed" as const,
            duration: Math.floor(100 + Math.random() * 400),
            detail: "未选择工作流，使用默认单步回复",
          },
        ],
        haltedAt: undefined,
      };
    }),

  /**
   * Get available workflows for selection in debugger
   */
  listWorkflows: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const workflows = await db
        .select({
          id: workflow.id,
          name: workflow.name,
          status: workflow.status,
          nodeCount: workflow.nodes,
        })
        .from(workflow)
        .where(eq(workflow.userId, userId))
        .orderBy(desc(workflow.updatedAt))
        .limit(input.limit);

      // Parse node count from JSON
      return workflows.map((wf) => {
        let nodeCount = 0;
        if (wf.nodeCount) {
          try {
            const nodes = JSON.parse(wf.nodeCount);
            nodeCount = Array.isArray(nodes) ? nodes.length : 0;
          } catch {
            // Ignore
          }
        }
        return {
          ...wf,
          nodeCount,
        };
      });
    }),
});

export type DebuggerRouter = typeof debuggerRouter;
