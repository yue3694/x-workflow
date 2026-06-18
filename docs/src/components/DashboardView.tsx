import React from "react";
import { Language, LANGUAGES } from "../types";
import { Activity, Cpu, Layers, Play, RefreshCw, Layers3, Flame, Clock, AppWindow, GitBranch, ArrowUpRight } from "lucide-react";

interface DashboardViewProps {
  language: Language;
  onNavigate: (tab: any) => void;
}

export default function DashboardView({ language, onNavigate }: DashboardViewProps) {
  const strings = LANGUAGES[language];

  // System stats data
  const kpis = [
    {
      title: strings.totalWorkflows,
      value: "14",
      change: "+12.4%",
      desc: strings.vsPrevMonth,
      icon: <Layers className="w-5 h-5 text-primary" />,
      color: "border-primary/20 bg-primary/5"
    },
    {
      title: strings.activeNodes,
      value: "62",
      change: "+5.1%",
      desc: strings.vsPrevMonth,
      icon: <Cpu className="w-5 h-5 text-tertiary" />,
      color: "border-tertiary/20 bg-tertiary/5"
    },
    {
      title: language === "en" ? "System Load" : "集成计算负载",
      value: "84.2%",
      change: "-2.3%",
      desc: "LATENCY STABLE",
      icon: <Flame className="w-5 h-5 text-error" />,
      color: "border-error/20 bg-error/5"
    }
  ];

  const recentPipelines = [
    { id: "W103", name: "Semantic Academic Summation Project", nodes: 6, status: "Active", time: "2 min ago" },
    { id: "W104", name: "Corporate Financial Earnings Extractor", nodes: 4, status: "Active", time: "14 min ago" },
    { id: "W107", name: "Cross-Jurisdiction Legal Compliance Filter", nodes: 8, status: "Paused", time: "2 hours ago" },
    { id: "W112", name: "High-Throughput Abstract Translation Pipeline", nodes: 5, status: "Active", time: "1 day ago" }
  ];

  const loadedModels = [
    { name: "Gemini 3.5 Flash (Core Node)", latency: "240ms", reliability: "99.98%", usage: "74k req" },
    { name: "Gemini 3.5 Pro (Synthesis Node)", latency: "420ms", reliability: "99.95%", usage: "12k req" },
    { name: "Gemini Flash-Lite (Atomic Condition)", latency: "110ms", reliability: "99.99%", usage: "243k req" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 bg-gradient-to-l from-primary to-transparent rounded-r-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-success/10 text-success border border-success/35 font-mono text-[10px] tracking-wide uppercase">
            {strings.operationalStatus}
          </div>
          <h2 className="font-headline font-semibold text-2xl md:text-3xl text-on-surface">
            {language === "en" ? "Scholarly Operations Dashboard" : "高能 AI 编排控制面板"}
          </h2>
          <p className="text-on-surface-variant font-light text-sm md:text-base leading-relaxed">
            {language === "en" 
              ? "Your machine intelligence fabric is connected. 14 modular node pipelines are tracking references, evaluating compliance, and synthesizing archival summaries across six global availability zones."
              : "您的人工智能算力网络已准备就绪。14条模块化节点流水线正在全球6个可用算力内处理历史典籍检索、企业合规稽查和学术文献精简。"}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate("orchestrator")}
              className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-lg text-xs leading-none flex items-center gap-2 group transition-all"
            >
              <span>{language === "en" ? "Enter Workspace Canvas" : "进入可视化画布"}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate("debugger")}
              className="px-4 py-2 bg-surface hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-semibold rounded-lg text-xs leading-none transition-all"
            >
              {language === "en" ? "Analyze Hot Traces" : "分析系统微观堆栈"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((k, i) => (
          <div key={i} className={`p-6 rounded-xl border bg-surface-container-lowest flex items-center justify-between shadow-sm transition-transform hover:translate-y-[-2px]`}>
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-outline block">{k.title}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-bold text-2xl text-on-surface leading-none">{k.value}</span>
                <span className="text-[10px] font-bold text-success font-mono">{k.change}</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-[#9ea0a7]/60 block">{k.desc}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface border border-outline-variant/20 flex items-center justify-center">
              {k.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Pipelines & Load Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Pipelines */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-on-surface font-headline uppercase tracking-wide">
                {language === "en" ? "Active Orchestrations" : "活跃执编流水线"}
              </h3>
              <p className="text-xs text-outline leading-none font-mono">12 NODES EXECUTING RUNS</p>
            </div>
            <button 
              onClick={() => onNavigate("orchestrator")}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>{strings.newWorkflow}</span>
              <span className="text-xs">+</span>
            </button>
          </div>

          <div className="divide-y divide-outline-variant/10">
            {recentPipelines.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between group hover:bg-surface-container-low/35 transition-colors px-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-mono text-xs">
                    {p.id}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{p.name}</h4>
                    <span className="font-mono text-[10px] text-outline">{p.nodes} nodes • {p.time}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  p.status === "Active" 
                    ? "bg-success/5 border-success/30 text-success" 
                    : "bg-outline/5 border-outline/30 text-outline"
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Model Runtimes */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-on-surface font-headline uppercase tracking-wide">
                {language === "en" ? "Model Registry & Capacity" : "模型算力与注册堆栈"}
              </h3>
              <p className="text-xs text-outline leading-none font-mono">3 MODES OF COGNITION ACTIVE</p>
            </div>
            <button className="p-1 text-on-surface-variant hover:text-primary">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            </button>
          </div>

          {/* Graphical Micro Load bars */}
          <div className="space-y-3">
            {loadedModels.map((m, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-outline-variant/10 hover:border-primary/20 bg-surface transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-on-surface font-mono">{m.name}</span>
                  <span className="text-[10px] font-mono text-outline">{m.usage}</span>
                </div>
                
                {/* Simulated bar progress */}
                <div className="h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      i === 0 ? "bg-primary" : i === 1 ? "bg-tertiary" : "bg-success"
                    }`}
                    style={{ width: i === 0 ? "75%" : i === 1 ? "42%" : "91%" }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-outline">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {m.latency}
                  </span>
                  <span>Reliability: {m.reliability}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
