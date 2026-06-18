"use client";

import { Settings } from "lucide-react";

interface RagConfig {
  chunkSize: number;
  embeddingModel: string;
  supportedTypes: string[];
  maxFileSize: string;
  maxFileSizeFormatted: string;
}

interface RagConfigPanelProps {
  config: RagConfig;
}

export function RagConfigPanel({ config }: RagConfigPanelProps) {
  const typeLabels: Record<string, string> = {
    "application/pdf": "PDF",
    "text/plain": "TXT",
    "text/csv": "CSV",
    "application/epub+zip": "EPUB",
  };

  const typeNames = config.supportedTypes.map(
    (t) => typeLabels[t] || t.split("/")[1]?.toUpperCase() || t,
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">RAG 配置</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div className="text-muted-foreground">向量模型</div>
          <div className="font-medium">{config.embeddingModel}</div>

          <div className="text-muted-foreground">分块大小</div>
          <div className="font-medium">{config.chunkSize} 字符</div>

          <div className="text-muted-foreground">最大文件</div>
          <div className="font-medium">{config.maxFileSizeFormatted}</div>

          <div className="text-muted-foreground">支持格式</div>
          <div className="font-medium">{typeNames.join(", ")}</div>
        </div>
      </div>
    </div>
  );
}