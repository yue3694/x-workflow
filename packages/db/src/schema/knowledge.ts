import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, uuid, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Document table - stores uploaded document metadata
 */
export const document = pgTable(
  "document",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    size: text("size").notNull(),
    mimeType: text("mime_type").notNull(),
    status: text("status")
      .notNull()
      .default("uploading"),
    chunkCount: integer("chunk_count").default(0).notNull(),
    filePath: text("file_path").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("document_userId_idx").on(table.userId)]
);

/**
 * Document Chunk table - stores vectorized text chunks
 */
export const documentChunk = pgTable(
  "document_chunk",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: text("embedding").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("documentChunk_documentId_idx").on(table.documentId)]
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