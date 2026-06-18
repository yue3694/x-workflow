"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@x-workflow/ui/components/card";
import { trpc } from "@/utils/trpc";

import { DocumentTable } from "./document-table";
import { DragDropUpload } from "./drag-drop-upload";
import { RagConfigPanel } from "./rag-config-panel";

export function KnowledgeBaseView() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // tRPC queries and mutations
  const { data: documents, refetch: refetchDocuments } = trpc.knowledge.list.useQuery();
  const { data: config } = trpc.knowledge.getConfig.useQuery();
  const uploadMutation = trpc.knowledge.upload.useMutation({
    onSuccess: () => {
      toast.success("文档上传成功");
      setIsUploading(false);
      refetchDocuments();
    },
    onError: (error) => {
      toast.error(`上传失败: ${error.message}`);
      setIsUploading(false);
    },
  });
  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => {
      toast.success("文档已删除");
      setIsDeleting(false);
      refetchDocuments();
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
      setIsDeleting(false);
    },
  });

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);

      try {
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );

        await uploadMutation.mutateAsync({
          file: {
            name: file.name,
            type: file.type,
            data: base64,
          },
        });
      } catch {
        setIsUploading(false);
      }
    },
    [uploadMutation],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      try {
        await deleteMutation.mutateAsync({ id });
      } catch {
        setIsDeleting(false);
      }
    },
    [deleteMutation],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">知识库</h1>
        <p className="text-sm text-muted-foreground">
          上传和管理文档，系统将自动进行文本提取和向量化处理
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>上传文档</CardTitle>
        </CardHeader>
        <CardContent>
          {config && (
            <DragDropUpload
              onUpload={handleUpload}
              isUploading={isUploading}
              supportedTypes={config.supportedTypes}
              maxSize={config.maxFileSizeFormatted}
            />
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>文档列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTable
            documents={(documents as unknown as Array<{
              id: string;
              name: string;
              size: string;
              mimeType: string;
              status: string;
              chunkCount: number;
              createdAt: Date | null;
            }>) || []}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>

      {/* RAG Config Panel */}
      {config && (
        <RagConfigPanel config={config as unknown as {
          chunkSize: number;
          embeddingModel: string;
          supportedTypes: string[];
          maxFileSize: string;
          maxFileSizeFormatted: string;
        }} />
      )}
    </div>
  );
}