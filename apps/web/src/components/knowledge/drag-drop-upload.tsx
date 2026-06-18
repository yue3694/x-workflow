"use client";

import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@x-workflow/ui/components/button";

interface DragDropUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  supportedTypes: string[];
  maxSize: string;
}

export function DragDropUpload({
  onUpload,
  isUploading,
  supportedTypes,
  maxSize,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!supportedTypes.includes(file.type)) {
      return `不支持的文件类型。支持的类型: ${supportedTypes.join(", ")}`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onUpload(file);
    },
    [onUpload, supportedTypes],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFile],
  );

  const typeLabels: Record<string, string> = {
    "application/pdf": "PDF",
    "text/plain": "TXT",
    "text/csv": "CSV",
    "application/epub+zip": "EPUB",
  };

  const typeNames = supportedTypes.map((t) => typeLabels[t] || t.split("/")[1]?.toUpperCase() || t);

  return (
    <div className="space-y-2">
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={handleInputChange}
          accept={supportedTypes.join(",")}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center gap-2">
          <div
            className={`rounded-full p-3 ${isDragging ? "bg-primary/10" : "bg-muted"}`}
          >
            <Upload
              className={`h-6 w-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging ? "释放以上传文件" : "拖拽文件到此处，或点击选择"}
            </p>
            <p className="text-xs text-muted-foreground">
              支持 {typeNames.join(", ")} 格式，最大 {maxSize}
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-24 animate-pulse rounded-full bg-muted" />
          <span>上传中...</span>
        </div>
      )}
    </div>
  );
}