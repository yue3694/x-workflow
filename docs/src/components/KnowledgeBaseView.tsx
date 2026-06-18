import React, { useState, useRef } from "react";
import { KnowledgeDoc, Language, LANGUAGES } from "../types";
import { Folder, Search, FileText, Upload, Plus, Download, Trash2, Check, AlertCircle, BookOpen } from "lucide-react";

interface KnowledgeBaseViewProps {
  language: Language;
}

export default function KnowledgeBaseView({ language }: KnowledgeBaseViewProps) {
  const strings = LANGUAGES[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initial scientific references files matching screenshot contexts
  const [docs, setDocs] = useState<KnowledgeDoc[]>([
    { id: "KB-01", name: "FY26_logistics_operational_contraction_report.pdf", size: "4.2 MB", type: "PDF Document", uploadedAt: "2026-06-12" },
    { id: "KB-02", name: "scholarly_ancient_alexandrian_manuscripts_volume_4.epub", size: "12.8 MB", type: "EPUB eBook", uploadedAt: "2026-05-30" },
    { id: "KB-03", name: "neural_cognitive_prompt_synthesizers_specifications.txt", size: "124 KB", type: "Plain Text", uploadedAt: "2026-06-01" },
    { id: "KB-04", name: "cross_jurisdiction_regulatory_compliance_matrix_v2.csv", size: "1.1 MB", type: "CSV Spreadsheet", uploadedAt: "2026-06-15" }
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const uploaded: KnowledgeDoc[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      
      uploaded.push({
        id: `KB-NEW-${Date.now().toString().slice(-3)}-${i}`,
        name: file.name,
        size: `${sizeMb === "0.0" ? "24" : sizeMb} ${sizeMb === "0.0" ? "KB" : "MB"}`,
        type: file.type || "Unknown binary file",
        uploadedAt: new Date().toISOString().split("T")[0]
      });
    }

    setDocs(prev => [...uploaded, ...prev]);
    triggerToast(language === "en" ? `Indexed ${fileList.length} local files successfully` : `成功将 ${fileList.length} 篇本地学术材料载入神经底座`);
  };

  const handleDeleteDoc = (id: string, name: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    triggerToast(`De-indexed ${name}`);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredDocs = docs.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-24 right-8 z-50 px-4 py-3 bg-success text-on-success text-xs font-mono font-bold rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header and counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-xs font-bold font-mono tracking-widest text-[#9ea0a7]/60 uppercase mb-1">
            {strings.connectedIndex}
          </h2>
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            {strings.tabKnowledge}
          </h1>
        </div>
        <span className="text-xs font-mono bg-surface border border-outline-variant/20 px-3 py-1.5 rounded text-outline font-bold">
          {strings.connectedIndexDocs}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main document tables */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Interactive live Search query filter */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-xl text-xs placeholder:text-outline focus:outline-none focus:border-primary shadow-sm"
              placeholder={language === "en" ? "Query system records, catalog archives..." : "过滤检索文献名、归档类别..."}
            />
          </div>

          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm">
            {filteredDocs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/15 font-mono text-[10px] text-outline uppercase tracking-wider pb-3">
                      <th className="pb-3 weights-normal">Document Spec / Archive ID</th>
                      <th className="pb-3 weights-normal">Type</th>
                      <th className="pb-3 weights-normal">Size</th>
                      <th className="pb-3 weights-normal">Indexed Date</th>
                      <th className="pb-3 weights-normal text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-surface-container-low/20 transition-colors">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            <span className="p-1.5 bg-primary/5 text-primary rounded-md shrink-0 border border-primary/10">
                              <FileText className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="font-semibold line-clamp-1 max-w-[280px]">{doc.name}</h4>
                              <span className="text-[10px] text-outline font-mono uppercase">{doc.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-2 font-mono text-[10px] text-outline">
                          {doc.type}
                        </td>
                        <td className="py-3.5 pr-2 font-mono text-[10px] text-outline">
                          {doc.size}
                        </td>
                        <td className="py-3.5 pr-2 text-outline font-mono text-[10px]">
                          {doc.uploadedAt}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => triggerToast(`Downloading ${doc.name}...`)}
                              className="p-1 border border-outline-variant/30 hover:border-primary/50 text-outline hover:text-primary rounded transition-all"
                              title="Download Archive"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDoc(doc.id, doc.name)}
                              className="p-1 border border-outline-variant/30 hover:border-error hover:text-error text-outline rounded transition-all"
                              title="Delete indexed file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-outline space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto opacity-30" />
                <p className="font-mono text-xs uppercase tracking-wide">NO MATCHING DOCUMENTS FOUND</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side drag-and-drop uploader area */}
        <div className="space-y-6">
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-xl border border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] bg-surface-container-lowest shadow-sm ${
              isDragging 
                ? "border-primary bg-primary/5 scale-102" 
                : "border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low/30"
            }`}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden" 
            />
            
            <div className="w-12 h-12 bg-primary/5 border border-primary/20 hover:border-primary/45 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Upload className="w-5 h-5 text-primary" />
            </div>

            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wide font-headline mb-2">
              {language === "en" ? "Ingest New Scholarly Material" : "载入新文献/学术数据源"}
            </h3>
            
            <p className="text-[11px] text-outline leading-relaxed max-w-xs mb-3">
              {language === "en" 
                ? "Drag and drop research reports, PDFs or JSON parameters directly, or click to browse files."
                : "直拖拽 PDF，JSON 或者是 CSV 表格文档来映射 RAG 知识底座，系统将自動对齐嵌入向量。"}
            </p>

            <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/25 rounded px-2.5 py-0.5 uppercase tracking-wider">
              {language === "en" ? "Drag & Drop Supported" : "支持本地拖放加载"}
            </span>
          </div>

          {/* RAG Context notice information */}
          <div className="p-5 rounded-xl border border-outline-variant/15 bg-surface-container-low leading-relaxed space-y-2.5">
            <h4 className="text-xs font-bold text-on-surface font-headline uppercase">Neural RAG Embedding Parameters</h4>
            <div className="space-y-1.5 text-[10px] text-on-surface-variant font-mono leading-relaxed">
              <div className="flex justify-between">
                <span>EMBEDDING MODEL :</span>
                <span className="text-primary font-bold">text-embedding-05</span>
              </div>
              <div className="flex justify-between">
                <span>CHUNK LIMIT SIZE :</span>
                <span className="text-primary font-bold">512 tokens</span>
              </div>
              <div className="flex justify-between">
                <span>VECTOR COMPRESSION :</span>
                <span className="text-primary font-bold">Scalar Quantization (SQ)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
