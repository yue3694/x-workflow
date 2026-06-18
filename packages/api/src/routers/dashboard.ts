import { z } from "zod";
import { eq, count } from "drizzle-orm";

import { db } from "@x-workflow/db";
import { workflow } from "@x-workflow/db/schema/workflow";
import { protectedProcedure, router } from "../index";

export const dashboardRouter = router({
  /**
   * Get KPI statistics for dashboard
   * Returns workflow count, node count (from active workflows), and system load
   */
  getStats: protectedProcedure
    .input(
      z.object({}).optional(),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Count workflows for user
      const workflowCountResult = await db
        .select({ count: count() })
        .from(workflow)
        .where(eq(workflow.userId, userId));

      const workflowCount = workflowCountResult[0]?.count ?? 0;

      // Count total nodes from all user's workflows
      // Parse nodes JSON and count array length
      const workflowsWithNodes = await db
        .select({ nodes: workflow.nodes })
        .from(workflow)
        .where(eq(workflow.userId, userId));

      let nodeCount = 0;
      for (const wf of workflowsWithNodes) {
        if (wf.nodes) {
          try {
            const nodesArray = JSON.parse(wf.nodes);
            nodeCount += Array.isArray(nodesArray) ? nodesArray.length : 0;
          } catch {
            // Ignore parse errors
          }
        }
      }

      // System load: simulated based on active workflows ratio
      // In production, this could come from actual metrics
      const activeWorkflows = workflowsWithNodes.filter(
        (wf) => wf.nodes && JSON.parse(wf.nodes).length > 0,
      ).length;
      const systemLoad = workflowCount > 0
        ? Math.min(100, Math.round((activeWorkflows / workflowCount) * 100))
        : 0;

      return {
        workflowCount,
        nodeCount,
        systemLoad,
      };
    }),
});
