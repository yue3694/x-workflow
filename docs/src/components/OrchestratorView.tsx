import React, { useState } from "react";
import { Node, Language, LANGUAGES } from "../types";
import { Play, Plus, Trash2, Cpu, Settings, Layers, Code, PlayCircle, Layers3, Sliders, RefreshCw, Check, Server, GitMerge, FileText } from "lucide-react";

interface OrchestratorViewProps {
  language: Language;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export default function OrchestratorView({ language, nodes, setNodes }: OrchestratorViewProps) {
  const strings = LANGUAGES[language];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[1]?.id || nodes[0]?.id || null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // High-fidelity library cards
  const nodeLibrary = [
    { type: "trigger", name: strings.triggerNode, subtitle: strings.triggerSub, desc: "API Endpoint, Event Trigger, Cron Timer", x: 100, y: 150 },
    { type: "condition", name: strings.conditionNode, subtitle: strings.conditionSub, desc: "Heuristic classification & validation gating", x: 300, y: 150 },
    { type: "parallel", name: strings.parallelNode, subtitle: strings.parallelSub, desc: "High throughput chunk mapper", x: 500, y: 100 },
    { type: "multimodal", name: strings.multimodalNode, subtitle: strings.multimodalSub, desc: "Vision and text vector fusion", x: 500, y: 280 },
    { type: "llm_synthesis", name: strings.llmSynthesisTitle, subtitle: strings.llmSynthesisDesc, desc: "Complex cognitive prompt summarization", x: 750, y: 200 }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Node addition handler
  const handleAddNode = (libItem: typeof nodeLibrary[0]) => {
    const newId = `N-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id: newId,
      type: libItem.type as any,
      name: `${libItem.name} ${nodes.filter(n => n.type === libItem.type).length + 1}`,
      description: libItem.desc,
      x: libItem.x + (Math.random() - 0.5) * 40,
      y: libItem.y + (Math.random() - 0.5) * 40,
      config: {
        url: libItem.type === "trigger" ? "https://api.orchestrator.ai/v1/ingest" : undefined,
        model: libItem.type === "llm_synthesis" ? "gemini-3.5-flash" : undefined,
        systemInstruction: libItem.type === "llm_synthesis" 
          ? "Identify transaction patterns. Categorize them into corporate or localized costs." 
          : undefined,
        temperature: 0.7,
        maxRetries: 3,
        timeout: 5000,
        haltOnError: true
      }
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newId);
    triggerNotification(`Added node ${newNode.name}`);
  };

  const handleUpdateConfig = (field: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          config: {
            ...n.config,
            [field]: value
          }
        };
      }
      return n;
    }));
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
    triggerNotification(`Deleted node ${id}`);
  };

  const triggerNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative min-h-[calc(100vh-160px)]">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-24 right-8 z-50 px-4 py-3 bg-success text-on-success text-xs font-mono font-bold rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Left panel Node Library */}
      <div className="w-full xl:w-72 flex-shrink-0 flex flex-col gap-5">
        <div>
          <h2 className="text-xs font-bold font-mono tracking-widest text-outline uppercase mb-1">
            {strings.nodeLibrarySub}
          </h2>
          <h1 className="font-headline text-lg font-bold text-on-surface">
            {strings.nodeLibraryTitle}
          </h1>
        </div>

        <div className="space-y-3">
          {nodeLibrary.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => handleAddNode(item)}
              className="group p-3.5 rounded-xl border border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer transition-all flex items-start gap-3 shadow-sm select-none"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                item.type === "trigger" ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                item.type === "condition" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                item.type === "parallel" ? "bg-sky-500/10 border-sky-500/30 text-sky-500" :
                item.type === "multimodal" ? "bg-purple-500/10 border-purple-500/30 text-purple-500" :
                "bg-primary/10 border-primary/30 text-primary"
              }`}>
                {item.type === "trigger" && <Server className="w-4 h-4" />}
                {item.type === "condition" && <GitMerge className="w-4 h-4" />}
                {item.type === "parallel" && <Layers3 className="w-4 h-4" />}
                {item.type === "multimodal" && <FileText className="w-4 h-4" />}
                {item.type === "llm_synthesis" && <Cpu className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-on-surface leading-tight">{item.name}</h3>
                  <span className="text-[9px] text-[#22c55e] opacity-0 group-hover:opacity-100 transition-opacity font-bold font-mono">+ {language === "en" ? "ADD" : "添加"}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-light line-clamp-2 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Interactive Flowchart Canvas Grid */}
      <div className="flex-grow min-h-[480px] xl:min-h-[560px] rounded-2xl bg-surface-container-lowest border border-outline-variant/15 relative overflow-hidden flex flex-col justify-between shadow-inner">
        {/* SVG Grid Line overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", 
            backgroundSize: "24px 24px" 
          }} 
        />

        {/* Top toolbar */}
        <div className="relative z-10 px-5 py-3.5 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold font-mono tracking-widest text-outline uppercase">{strings.liveWorkflowPath}</h2>
          </div>
          <span className="text-[10px] font-mono bg-surface border border-outline-variant/20 px-2 py-0.5 rounded text-outline">{nodes.length} Nodes Loaded</span>
        </div>

        {/* Node Link lines graph paths (Simulated connecting SVGs) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="w-full h-full">
            {nodes.map((node, i) => {
              if (i === nodes.length - 1) return null;
              const nextNode = nodes[i + 1];
              return (
                <g key={i}>
                  <path 
                    d={`M ${node.x + 130} ${node.y + 40} C ${node.x + 180} ${node.y + 40}, ${nextNode.x - 50} ${nextNode.y + 40}, ${nextNode.x} ${nextNode.y + 40}`}
                    fill="none" 
                    stroke="var(--color-primary-fixed-dim, #0066ff)" 
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="opacity-40 animate-[dash_10s_linear_infinite]"
                  />
                  <circle cx={node.x + 130} cy={node.y + 40} r="3" fill="#0066ff" className="opacity-80" />
                  <circle cx={nextNode.x} cy={nextNode.y + 40} r="3" fill="#0066ff animate-ping" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Render Active Nodes */}
        <div className="relative z-10 flex-grow p-6 overflow-auto">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onClick={() => setSelectedNodeId(node.id)}
                className={`absolute w-44 p-3.5 rounded-xl cursor-move transition-all border ${
                  isSelected 
                    ? "bg-surface-container-high border-primary ring-2 ring-primary/10 shadow-lg scale-105 z-20" 
                    : "bg-surface hover:bg-surface-container-low border-outline-variant/30 hover:border-primary/20 shadow-sm z-10"
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-outline-variant/10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${
                      node.type === "trigger" ? "bg-amber-400" :
                      node.type === "condition" ? "bg-emerald-400" :
                      node.type === "parallel" ? "bg-sky-400" :
                      node.type === "multimodal" ? "bg-purple-400" :
                      "bg-primary"
                    }`} />
                    <span className="font-mono text-[9px] uppercase font-bold text-outline">{node.type}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                    className="text-outline hover:text-error transition-all"
                    title="Remove Node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-on-surface truncate leading-tight mb-1">{node.name}</h4>
                  <p className="text-[10px] text-outline line-clamp-1 italic">{node.id}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer toolbar actions */}
        <div className="relative z-10 px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md">
          <p className="text-[10px] font-mono text-outline leading-none">{language === "en" ? "TIP: Select any node to configure parameters" : "提示：选择任意节点配置系统参数"}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setNodes([
                  { id: "N-TRG", type: "trigger", name: strings.triggerNode, description: "", x: 50, y: 160, config: { url: "https://api.orchestrator.ai/v1/trigger" } },
                  { id: "N-CND", type: "condition", name: strings.conditionNode, description: "", x: 260, y: 160, config: { haltOnError: true } },
                  { id: "N-SYN", type: "llm_synthesis", name: strings.llmSynthesisTitle, description: "", x: 480, y: 160, config: { model: "gemini-3.5-flash", systemInstruction: "Answer in scholar style." } }
                ]);
                triggerNotification(language === "en" ? "Reset Canvas Pipeline" : "已重置节点流水线");
              }}
              className="px-2.5 py-1 text-[10px] text-on-surface-variant bg-surface hover:bg-surface-container-high border border-outline-variant/30 font-semibold rounded-md transition-all font-mono"
            >
              {language === "en" ? "RESET CANVAS" : "重置画布"}
            </button>
          </div>
        </div>
      </div>

      {/* Right parameters Panel Config */}
      <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-5 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 shadow-sm">
        <div className="border-b border-outline-variant/10 pb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold font-headline text-on-surface">{strings.nodeConfigTitle}</h2>
        </div>

        {selectedNode ? (
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-outline block mb-1">NODE CLASSIFIER</span>
              <div className="p-2.5 rounded bg-surface border border-outline-variant/10 font-semibold text-on-surface flex items-center justify-between">
                <span>{selectedNode.name}</span>
                <span className="font-mono text-[10px] text-slate-400 bg-surface-container-low px-1.5 py-0.5 rounded">{selectedNode.id}</span>
              </div>
            </div>

            {/* Config depending on Node Type */}
            {selectedNode.type === "trigger" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5">Webhook Ingest URL</label>
                  <input
                    type="text"
                    value={selectedNode.config.url || ""}
                    onChange={(e) => handleUpdateConfig("url", e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none rounded"
                  />
                </div>
              </div>
            )}

            {selectedNode.type === "llm_synthesis" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5">{strings.neuralCore}</label>
                  <select
                    value={selectedNode.config.model || "gemini-3.5-flash"}
                    onChange={(e) => handleUpdateConfig("model", e.target.value)}
                    className="w-full px-2 py-2 bg-surface text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none rounded font-mono"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended)</option>
                    <option value="gemini-3.5-pro">Gemini 3.5 Pro (Precision)</option>
                    <option value="gemini-flash-lite">Gemini Flash-Lite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5">{strings.systemInstructionLabel}</label>
                  <textarea
                    rows={4}
                    value={selectedNode.config.systemInstruction || ""}
                    onChange={(e) => handleUpdateConfig("systemInstruction", e.target.value)}
                    className="w-full p-2 bg-surface text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none rounded font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider text-outline mb-1">
                    <span>Temperature</span>
                    <span>{selectedNode.config.temperature || 0.7}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={selectedNode.config.temperature || 0.7}
                    onChange={(e) => handleUpdateConfig("temperature", parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}

            {/* Global policies */}
            <div className="space-y-3 pt-3 border-t border-outline-variant/10">
              <span className="font-mono text-[9px] uppercase tracking-wider text-outline block">{strings.runtimePolicy}</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-mono tracking-wide text-outline mb-1">{strings.maxRetries}</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={selectedNode.config.maxRetries || 3}
                    onChange={(e) => handleUpdateConfig("maxRetries", parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-surface text-on-surface border border-outline-variant/20 focus:border-primary focus:outline-none rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-mono tracking-wide text-outline mb-1">{strings.timeout}</label>
                  <input
                    type="number"
                    step="500"
                    value={selectedNode.config.timeout || 5000}
                    onChange={(e) => handleUpdateConfig("timeout", parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-surface text-on-surface border border-outline-variant/20 focus:border-primary focus:outline-none rounded font-mono"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 pb-1 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNode.config.haltOnError || false}
                  onChange={(e) => handleUpdateConfig("haltOnError", e.target.checked)}
                  className="rounded text-primary border-outline-variant/30 focus:ring-primary w-3.5 h-3.5 mt-0.5"
                />
                <span className="text-[10px] text-on-surface-variant leading-tight font-sans">
                  {strings.haltWorkflow}
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => triggerNotification(language === "en" ? "Node synchronizing completed successfully" : "算力节点同步完毕！")}
                className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{strings.applySync}</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="py-24 text-center text-outline">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-mono text-xs">{language === "en" ? "No node selected" : "未选中任何节点"}</p>
          </div>
        )}
      </div>

    </div>
  );
}
