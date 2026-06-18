import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { db } from "@x-workflow/db";
import { workflow, type WorkflowNode } from "@x-workflow/db/schema/workflow";
import { protectedProcedure, router } from "../index";

/**
 * Input validation schemas for workflow operations
 */
const nodeConfigSchema = z.object({
  url: z.string().url().optional(),
  haltOnError: z.boolean().optional(),
  model: z.string().optional(),
  systemInstruction: z.string().max(10000).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

const workflowNodeInputSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(["trigger", "condition", "parallel", "multimodal", "llm_synthesis"]),
  name: z.string().min(1).max(100),
  x: z.number().int().min(-1000).max(10000),
  y: z.number().int().min(-1000).max(10000),
  config: nodeConfigSchema,
});

export const workflowRouter = router({
  /**
   * Create a new workflow
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        nodes: z.array(workflowNodeInputSchema).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const result = await db
        .insert(workflow)
        .values({
          id,
          name: input.name,
          userId,
          status: "active",
          nodes: JSON.stringify(input.nodes),
        })
        .returning();

      return result[0];
    }),

  /**
   * Get a single workflow by ID
   */
  get: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await db
        .select()
        .from(workflow)
        .where(eq(workflow.id, input.id))
        .limit(1);

      const wf = result[0];

      if (!wf) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }

      // Security: ensure user owns this workflow
      if (wf.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Parse nodes JSON safely
      let nodes: WorkflowNode[] = [];
      if (wf.nodes) {
        try {
          const parsed = JSON.parse(wf.nodes);
          nodes = Array.isArray(parsed) ? parsed : [];
        } catch {
          nodes = [];
        }
      }

      return { ...wf, nodes };
    }),

  /**
   * Update workflow (name, status, or nodes)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(255).optional(),
        status: z.enum(["active", "paused"]).optional(),
        nodes: z.array(workflowNodeInputSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First verify ownership
      const existing = await db
        .select({ userId: workflow.userId })
        .from(workflow)
        .where(eq(workflow.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }

      const record = existing[0];
      if (!record || record.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Build update values
      const updateValues: Record<string, unknown> = {};
      if (input.name !== undefined) updateValues.name = input.name;
      if (input.status !== undefined) updateValues.status = input.status;
      if (input.nodes !== undefined) updateValues.nodes = JSON.stringify(input.nodes);

      const result = await db
        .update(workflow)
        .set(updateValues)
        .where(eq(workflow.id, input.id))
        .returning();

      return result[0];
    }),

  /**
   * Delete a workflow
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First verify ownership
      const existing = await db
        .select({ userId: workflow.userId })
        .from(workflow)
        .where(eq(workflow.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }

      const record = existing[0];
      if (!record || record.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db.delete(workflow).where(eq(workflow.id, input.id));

      return { success: true };
    }),

  /**
   * List workflows for current user
   * Returns recent workflows ordered by updatedAt desc
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(5),
        cursor: z.string().optional(),
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
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
        })
        .from(workflow)
        .where(eq(workflow.userId, userId))
        .orderBy(desc(workflow.updatedAt))
        .limit(input.limit);

      // Compute actual node count from nodes JSON
      const workflowsWithNodeCount = workflows.map((wf) => {
        let nodeCount = 0;
        if (wf.nodeCount) {
          try {
            const nodesArray = JSON.parse(wf.nodeCount);
            nodeCount = Array.isArray(nodesArray) ? nodesArray.length : 0;
          } catch {
            // Ignore parse errors
          }
        }
        return {
          ...wf,
          nodeCount,
        };
      });

      const lastWorkflow = workflows[workflows.length - 1];
      return {
        workflows: workflowsWithNodeCount,
        nextCursor: workflows.length === input.limit && lastWorkflow
          ? lastWorkflow.id
          : undefined,
      };
    }),
});
