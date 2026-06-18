/**
 * RAG Utilities - Text extraction, chunking, and embedding generation
 */

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@x-workflow/db";
import { document, documentChunk } from "@x-workflow/db/schema/knowledge";

/**
 * Supported file types for text extraction
 */
export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/epub+zip",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

/**
 * RAG Configuration
 */
export const RAG_CONFIG = {
  chunkSize: 512, // characters per chunk
  embeddingModel: "simplified-hash", // placeholder for production embedding API
} as const;

/**
 * Validate MIME type against whitelist
 */
export function isValidMimeType(mimeType: string): mimeType is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType);
}

/**
 * Extract text content from file based on MIME type
 * Simplified implementation - production would use proper parsers
 */
export async function extractText(
  content: ArrayBuffer,
  mimeType: SupportedMimeType,
): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(content);

  switch (mimeType) {
    case "text/plain":
      return text;

    case "text/csv":
      // Extract text content from CSV, remove commas and newlines for simplicity
      return text
        .split("\n")
        .map((row) => row.replace(/,/g, " ").replace(/\s+/g, " ").trim())
        .filter((line) => line.length > 0)
        .join(" ");

    case "application/pdf":
      // Simplified PDF text extraction
      // Production should use pdf-parse or similar library
      return extractTextFromPdfSimplified(text);

    case "application/epub+zip":
      // Simplified EPUB text extraction
      // Production should use epub-parse or similar library
      return extractTextFromEpubSimplified(text);

    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unsupported file type: ${mimeType}`,
      });
  }
}

/**
 * Simplified PDF text extraction
 * Extracts text content between stream markers
 */
function extractTextFromPdfSimplified(content: string): string {
  // Remove PDF metadata and structure
  // This is a simplified extraction - real PDFs are more complex
  const textBlocks: string[] = [];

  // Extract text between BT (Begin Text) and ET (End Text) markers
  const textRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;

  while ((match = textRegex.exec(content)) !== null) {
    // Extract string literals from text operators
    const matchGroup = match[1];
    if (!matchGroup) continue;
    const strings = matchGroup.match(/\(([^)]*)\)/g);
    if (strings) {
      for (const str of strings) {
        const cleaned = str.replace(/[()\\]/g, "").trim();
        if (cleaned.length > 0) {
          textBlocks.push(cleaned);
        }
      }
    }
  }

  // Fallback: extract any readable text sequences
  if (textBlocks.length === 0) {
    const readableText = content
      .replace(/[^\x20-\x7E\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (readableText.length > 0) {
      return readableText;
    }
  }

  return textBlocks.join(" ");
}

/**
 * Simplified EPUB text extraction
 * Extracts text from basic HTML-like content
 */
function extractTextFromEpubSimplified(content: string): string {
  // Remove HTML/XML tags and extract text content
  const text = content
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

/**
 * Split text into chunks of specified size
 */
export function chunkText(text: string, chunkSize: number = RAG_CONFIG.chunkSize): string[] {
  if (text.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at word boundary
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Generate simplified embedding (hash-based)
 * Production would call an actual embedding API
 */
export function generateEmbedding(text: string): number[] {
  // Simple hash-based embedding for demo purposes
  // This creates a fixed-size array based on text hash
  const hashSize = 1536; // Standard embedding dimension
  const embedding: number[] = new Array(hashSize);

  // Generate deterministic hash values
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate pseudo-random but deterministic values based on hash
  for (let i = 0; i < hashSize; i++) {
    const seed = hash ^ (i * 2654435761);
    embedding[i] = (Math.sin(seed) + 1) / 2; // Normalize to 0-1
  }

  // L2 normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / magnitude);
}

/**
 * Full RAG pipeline: extract, chunk, and embed
 */
export interface RAGResult {
  chunks: {
    content: string;
    embedding: number[];
    chunkIndex: number;
  }[];
  totalChunks: number;
}

export async function processRAG(
  content: ArrayBuffer,
  mimeType: SupportedMimeType,
): Promise<RAGResult> {
  // Step 1: Extract text
  const text = await extractText(content, mimeType);

  if (text.trim().length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No text content could be extracted from the document",
    });
  }

  // Step 2: Chunk text
  const textChunks = chunkText(text);

  if (textChunks.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Document content is too short to process",
    });
  }

  // Step 3: Generate embeddings
  const chunks = textChunks.map((chunkContent, index) => ({
    content: chunkContent,
    embedding: generateEmbedding(chunkContent),
    chunkIndex: index,
  }));

  return {
    chunks,
    totalChunks: chunks.length,
  };
}

/**
 * Cosine similarity between two equal-length vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Search the most similar chunks for a given query within a single document
 * (the "knowledge base" granularity in this app is one uploaded document).
 * Verifies document ownership before returning any content.
 */
export async function searchSimilarChunks(
  knowledgeBaseId: string,
  userId: string,
  queryText: string,
  topK = 3,
): Promise<string[]> {
  const doc = await db.query.document.findFirst({
    where: eq(document.id, knowledgeBaseId),
  });

  if (!doc) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Knowledge base not found" });
  }

  if (doc.userId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
  }

  const chunks = await db.query.documentChunk.findMany({
    where: eq(documentChunk.documentId, knowledgeBaseId),
  });

  if (chunks.length === 0) {
    return [];
  }

  const queryEmbedding = generateEmbedding(queryText);

  const ranked = chunks
    .map((chunk) => {
      let embedding: number[] = [];
      try {
        embedding = JSON.parse(chunk.embedding);
      } catch {
        embedding = [];
      }
      return {
        content: chunk.content,
        score: embedding.length > 0 ? cosineSimilarity(queryEmbedding, embedding) : -1,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked.map((r) => r.content);
}