import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { basename } from "path";
import { z } from "zod";

import { db } from "@x-workflow/db";
import { document, documentChunk } from "@x-workflow/db/schema/knowledge";
import { protectedProcedure, router } from "../index";
import {
  isValidMimeType,
  processRAG,
  RAG_CONFIG,
  SUPPORTED_MIME_TYPES,
} from "../utils/rag";

/**
 * Generate unique document ID
 */
function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * File size limit: 50MB
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Knowledge base router - document management and RAG processing
 */
export const knowledgeRouter = router({
  /**
   * List all documents for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const search = input?.search?.toLowerCase();
      const typeFilter = input?.type?.toLowerCase();

      let documents = await db.query.document.findMany({
        where: eq(document.userId, userId),
        orderBy: (doc, { desc }) => [desc(doc.createdAt)],
      });

      // Client-side filtering for search
      if (search || typeFilter) {
        documents = documents.filter((doc) => {
          const nameMatch = !search || doc.name.toLowerCase().includes(search);
          const typeMatch = !typeFilter || doc.mimeType.toLowerCase().includes(typeFilter);
          return nameMatch && typeMatch;
        });
      }

      return documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        status: doc.status,
        chunkCount: doc.chunkCount,
        createdAt: doc.createdAt,
      }));
    }),

  /**
   * Upload a document and process with RAG
   */
  upload: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string().min(1),
          type: z.string(),
          data: z.string(), // base64 encoded
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { file } = input;

      // Validate MIME type
      if (!isValidMimeType(file.type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid file type. Supported types: ${SUPPORTED_MIME_TYPES.join(", ")}`,
        });
      }

      // Decode base64 content
      const binaryContent = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
      const fileSize = binaryContent.length;

      // Validate file size
      if (fileSize > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        });
      }

      const documentId = generateId();
      const docName = basename(file.name);

      // Get uploads directory from env or use default
      const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
      const filePath = `${uploadsDir}/${userId}/${documentId}/${docName}`;

      // Create document record with uploading status
      await db.insert(document).values({
        id: documentId,
        userId,
        name: docName,
        size: formatFileSize(fileSize),
        mimeType: file.type,
        status: "uploading",
        chunkCount: 0,
        filePath,
      });

      try {
        // Update status to processing
        await db
          .update(document)
          .set({ status: "processing" })
          .where(eq(document.id, documentId));

        // Process with RAG
        const ragResult = await processRAG(binaryContent.buffer, file.type);

        // Store chunks
        for (const chunk of ragResult.chunks) {
          await db.insert(documentChunk).values({
            id: generateId(),
            documentId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            embedding: JSON.stringify(chunk.embedding),
          });
        }

        // Update document status to ready
        await db
          .update(document)
          .set({
            status: "ready",
            chunkCount: ragResult.totalChunks,
          })
          .where(eq(document.id, documentId));

        return {
          success: true,
          documentId,
          chunkCount: ragResult.totalChunks,
        };
      } catch (error) {
        // Update document status to error
        await db
          .update(document)
          .set({
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(document.id, documentId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Delete a document and its associated chunks
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id } = input;

      // Find document and verify ownership
      const existingDoc = await db.query.document.findFirst({
        where: (doc) => eq(doc.id, id),
      });

      if (!existingDoc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      if (existingDoc.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this document",
        });
      }

      // Delete chunks first (foreign key constraint)
      await db.delete(documentChunk).where(eq(documentChunk.documentId, id));

      // Delete document
      await db.delete(document).where(eq(document.id, id));

      // Note: File system deletion would require additional implementation
      // For now, we rely on cascade delete for database records

      return { success: true };
    }),

  /**
   * Get document by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id } = input;

      const doc = await db.query.document.findFirst({
        where: (d) => eq(d.id, id),
      });

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      if (doc.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this document",
        });
      }

      return {
        id: doc.id,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        status: doc.status,
        chunkCount: doc.chunkCount,
        errorMessage: doc.errorMessage,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }),

  /**
   * Get RAG configuration
   */
  getConfig: protectedProcedure.query(() => {
    return {
      chunkSize: RAG_CONFIG.chunkSize,
      embeddingModel: RAG_CONFIG.embeddingModel,
      supportedTypes: SUPPORTED_MIME_TYPES,
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeFormatted: formatFileSize(MAX_FILE_SIZE),
    };
  }),
});

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}