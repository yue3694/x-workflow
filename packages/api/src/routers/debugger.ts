import { z } from "zod";

import { db } from "@x-workflow/db";
import { workflow } from "@x-workflow/db/schema/workflow";
import { eq, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../index";

/**
 * Step definitions for the debugger pipeline
 */
const PIPELINE_STEPS = [
  {
    id: 1,
    name: "Webhook Gateway",
    description: "Authorized digital gateway for incoming requests",
    icon: "webhook",
  },
  {
    id: 2,
    name: "Security & Routing",
    description: "Gating authentication and routing conditions",
    icon: "shield",
  },
  {
    id: 3,
    name: "Distributed Knowledge",
    description: "Aligning references with vector database",
    icon: "database",
  },
  {
    id: 4,
    name: "Cognitive LLM Synthesis",
    description: "Calling Deep Gemini synthesis engine",
    icon: "brain",
  },
] as const;

/**
 * Simulated response templates based on input
 */
const RESPONSE_TEMPLATES = [
  "Based on the workflow configuration, processing your request through the pipeline.",
  "Analyzing the input with semantic understanding and contextual awareness.",
  "Synthesizing a response using the configured LLM parameters and knowledge base.",
  "The pipeline executed successfully with all steps completing as expected.",
];

export const debuggerRouter = router({
  /**
   * Get pipeline step definitions
   */
  getSteps: protectedProcedure.query(() => {
    return PIPELINE_STEPS;
  }),

  /**
   * Get connection status
   */
  getStatus: protectedProcedure.query(() => {
    return {
      connected: true,
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

      // Get workflow configuration if provided
      let llmConfig: {
        model?: string;
        systemInstruction?: string;
        temperature?: number;
      } = {};

      if (input.workflowId) {
        const wf = await db
          .select()
          .from(workflow)
          .where(eq(workflow.id, input.workflowId))
          .limit(1);

        if (wf.length > 0) {
          const record = wf[0];
          if (record && record.userId === userId) {
            try {
              const nodes = record.nodes ? JSON.parse(record.nodes) : [];
              // Find LLM synthesis node
              const llmNode = nodes.find(
                (n: { type: string }) => n.type === "llm_synthesis",
              );
              if (llmNode?.config) {
                llmConfig = {
                  model: llmNode.config.model,
                  systemInstruction: llmNode.config.systemInstruction,
                  temperature: llmNode.config.temperature,
                };
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Simulate processing delay (200-500ms)
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300),
      );

      // Generate simulated response
      const responseIndex = Math.floor(
        Math.random() * RESPONSE_TEMPLATES.length,
      );
      const baseResponse = RESPONSE_TEMPLATES[responseIndex];

      // Build full response with LLM config info if available
      const fullResponse = llmConfig.model
        ? `${baseResponse}\n\n**LLM Configuration:**\n- Model: ${llmConfig.model}\n- Temperature: ${llmConfig.temperature ?? 0.7}`
        : baseResponse;

      return {
        response: fullResponse,
        llmConfig,
        steps: PIPELINE_STEPS.map((step) => ({
          ...step,
          status: "completed" as const,
          duration: Math.floor(100 + Math.random() * 400),
        })),
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
