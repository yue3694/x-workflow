"use client";

import { formatDistanceToNow } from "date-fns";
import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@x-workflow/ui/components/button";
import { Input } from "@x-workflow/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@x-workflow/ui/components/table";

interface Document {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  status: string;
  chunkCount: number;
  createdAt: Date | null;
}

interface DocumentTableProps {
  documents: Document[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function DocumentTable({ documents, onDelete, isDeleting }: DocumentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = doc.name.toLowerCase().includes(searchLower);
    const typeMatch = doc.mimeType.toLowerCase().includes(searchLower);
    return nameMatch || typeMatch;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      uploading: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      ready: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
    };
    const statusLabels: Record<string, string> = {
      uploading: "上传中",
      processing: "处理中",
      ready: "就绪",
      error: "错误",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getFileTypeLabel = (mimeType: string) => {
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "text/plain": "TXT",
      "text/csv": "CSV",
      "application/epub+zip": "EPUB",
    };
    return typeMap[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "FILE";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜索文档名称或类型..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          共 {filteredDocuments.length} 个文档
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <FileText className="h-4 w-4" />
              </TableHead>
              <TableHead>名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>块数</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead className="w-12">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {documents.length === 0 ? "暂无文档，请上传文件" : "没有找到匹配的文档"}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {getFileTypeLabel(doc.mimeType)}
                    </span>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>{doc.chunkCount}</TableCell>
                  <TableCell>
                    {doc.createdAt
                      ? formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(doc.id)}
                      disabled={isDeleting}
                      title="删除文档"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}