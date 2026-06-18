import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/**
 * Document table - stores uploaded document metadata
 */
export const document = sqliteTable(
  "document",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    size: text("size").notNull(), // e.g., "4.2 MB"
    mimeType: text("mime_type").notNull(),
    status: text("status")
      .notNull()
      .default("uploading"), // 'uploading' | 'processing' | 'ready' | 'error'
    chunkCount: integer("chunk_count").default(0).notNull(),
    filePath: text("file_path").notNull(),
    errorMessage: text("error_message"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("document_userId_idx").on(table.userId)],
);

/**
 * Document Chunk table - stores vectorized text chunks
 */
export const documentChunk = sqliteTable(
  "document_chunk",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    content: text("content").notNull(), // Chunk text content
    chunkIndex: integer("chunk_index").notNull(), // Order in document
    embedding: text("embedding").notNull(), // JSON array of numbers (simplified)
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("documentChunk_documentId_idx").on(table.documentId)],
);

// Relations
export const documentRelations = relations(document, ({ one, many }) => ({
  user: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
  chunks: many(documentChunk),
}));

export const documentChunkRelations = relations(documentChunk, ({ one }) => ({
  document: one(document, {
    fields: [documentChunk.documentId],
    references: [document.id],
  }),
}));

// Import user for reference
import { user } from "./auth";