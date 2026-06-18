import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

/**
 * Workflow table - stores AI pipeline/workflow definitions
 * Used by dashboard (stats/list) and orchestrator-canvas (CRUD)
 */
export const workflow = sqliteTable(
  "workflow",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").$type<"active" | "paused">().notNull().default("active"),
    nodes: text("nodes").$type<string>(), // JSON array of Node objects
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (table) => ({
    userIdIdx: index("workflow_user_id_idx").on(table.userId),
  }),
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
