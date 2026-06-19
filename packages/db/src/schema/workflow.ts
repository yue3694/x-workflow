import { pgTable, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Workflow table - stores AI pipeline/workflow definitions
 * Used by dashboard (stats/list) and orchestrator-canvas (CRUD)
 */
export const workflow = pgTable(
  "workflow",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").$type<"active" | "paused">().notNull().default("active"),
    nodes: text("nodes").$type<string>(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("workflow_user_id_idx").on(table.userId),
  })
);

export type Workflow = typeof workflow.$inferSelect;
export type NewWorkflow = typeof workflow.$inferInsert;

// Node types for workflow.nodes JSON
export type NodeType = "trigger" | "condition" | "parallel" | "multimodal" | "llm_synthesis";

export interface NodeConfig {
  url?: string;
  haltOnError?: boolean;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxRetries?: number;
  timeout?: number;
  knowledgeBaseId?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  config: NodeConfig;
}