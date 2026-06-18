"use client";

import Link from "next/link";
import {
  Layers,
  Cpu,
  Flame,
  RefreshCw,
  ArrowUpRight,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "@x-workflow/ui/components/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useAutoTheme, LANGUAGES, type Language } from "@x-workflow/ui";
import { useState, useEffect } from "react";

type Session = typeof authClient.$Infer.Session;

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  desc: string;
  icon: React.ReactNode;
  colorClass: string;
}

function KpiCard({ title, value, change, desc, icon, colorClass }: KpiCardProps) {
  return (
    <div
      className={`p-6 rounded-xl border flex items-center justify-between shadow-sm transition-transform hover:-translate-y-0.5 ${colorClass}`}
    >
      <div className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-2xl text-foreground leading-none">
            {value}
          </span>
          <span className="text-[10px] font-bold text-emerald-500 font-mono">{change}</span>
        </div>
        <span className="text-[9px] font-mono tracking-widest text-muted-foreground/60 block">
          {desc}
        </span>
      </div>
      <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

interface PipelineItemProps {
  id: string;
  name: string;
  nodes: number;
  status: "Active" | "Paused";
  time: string;
}

function PipelineItem({ id, name, nodes, status, time }: PipelineItemProps) {
  return (
    <div className="py-3 flex items-center justify-between group hover:bg-muted/35 transition-colors px-2 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-mono text-xs">
          {id}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h4>
          <span className="font-mono text-[10px] text-muted-foreground">
            {nodes} nodes • {time}
          </span>
        </div>
      </div>
      <span
        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
          status === "Active"
            ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-500"
            : "bg-muted/5 border-muted/30 text-muted-foreground"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

interface ModelRuntimeProps {
  name: string;
  latency: string;
  reliability: string;
  usage: string;
  colorClass: string;
}

function ModelRuntimeCard({ name, latency, reliability, usage, colorClass }: ModelRuntimeProps) {
  return (
    <div className="p-3.5 rounded-lg border border-border hover:border-primary/20 bg-background transition-all">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-foreground font-mono">{name}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{usage}</span>
      </div>

      {/* Simulated bar progress */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: "75%" }} />
      </div>

      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {latency}
        </span>
        <span>Reliability: {reliability}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ session }: { session: Session }) {
  const { activeTheme } = useAutoTheme();
  const [language, setLanguage] = useState<Language>("zh");
  const [localTime, setLocalTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);

  const strings = LANGUAGES[language];
  const isDark = activeTheme === "dark";

  useEffect(() => {
    const ticker = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const currentLocalTimeStr = localTime.toLocaleDateString(
    language === "en" ? "en-US" : "zh-CN",
    {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  );

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: workflowsData, isLoading: workflowsLoading } = trpc.workflow.list.useQuery({
    limit: 5,
  });

  // Static demo data matching design
  const recentPipelines = [
    {
      id: "W103",
      name: "Semantic Academic Summation Project",
      nodes: 6,
      status: "Active" as const,
      time: "2 min ago",
    },
    {
      id: "W104",
      name: "Corporate Financial Earnings Extractor",
      nodes: 4,
      status: "Active" as const,
      time: "14 min ago",
    },
    {
      id: "W107",
      name: "Cross-Jurisdiction Legal Compliance Filter",
      nodes: 8,
      status: "Paused" as const,
      time: "2 hours ago",
    },
    {
      id: "W112",
      name: "High-Throughput Abstract Translation Pipeline",
      nodes: 5,
      status: "Active" as const,
      time: "1 day ago",
    },
  ];

  const loadedModels = [
    { name: "Gemini 3.5 Flash (Core Node)", latency: "240ms", reliability: "99.98%", usage: "74k req", colorClass: "bg-primary" },
    { name: "Gemini 3.5 Pro (Synthesis Node)", latency: "420ms", reliability: "99.95%", usage: "12k req", colorClass: "bg-violet-500" },
    { name: "Gemini Flash-Lite (Atomic Condition)", latency: "110ms", reliability: "99.99%", usage: "243k req", colorClass: "bg-emerald-500" },
  ];

  const userName = session.user?.name || session.user?.email || "User";

  const slides = [
    {
      slogan: language === "en" ? "Scholarly Operations Dashboard" : "高能 AI 编排控制面板",
      desc: language === "en"
        ? "Your machine intelligence fabric is connected. 14 modular node pipelines are tracking references, evaluating compliance, and synthesizing archival summaries across six global availability zones."
        : "您的人工智能算力网络已准备就绪。14条模块化节点流水线正在全球6个可用算力内处理历史典籍检索、企业合规稽查和学术文献精简。",
    },
    {
      slogan: language === "en" ? "Real-Time Monitoring Active" : "实时监控已全面激活",
      desc: language === "en"
        ? "All systems operational. Node health checks passing. Response latency within acceptable parameters."
        : "全部系统运行正常。节点健康检查通过。响应延迟在可接受参数范围内。",
    },
    {
      slogan: language === "en" ? "Security Protocols Engaged" : "安全协议已全面启用",
      desc: language === "en"
        ? "AES-256 encryption active. Two-factor authentication enforced. Audit logging enabled for all operations."
        : "AES-256 加密已启用。双因素身份验证已强制执行。所有操作均已启用审计日志记录。",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className={`p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-sm ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-muted/30 border-border"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-80 h-full opacity-10 bg-gradient-to-l from-primary to-transparent rounded-r-2xl pointer-events-none`}
        />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/35 font-mono text-[10px] tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {strings.operationalStatus}
          </div>

          <div key={currentSlide} className="animate-in fade-in duration-300 space-y-3">
            <h2 className="font-headline font-semibold text-2xl md:text-3xl text-foreground">
              {slides[currentSlide].slogan}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed">
              {slides[currentSlide].desc}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/orchestrator">
              <Button className="flex items-center gap-2">
                <span>
                  {language === "en" ? "Enter Workspace Canvas" : "进入可视化画布"}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/debugger">
              <Button variant="outline" className="flex items-center gap-2">
                {language === "en" ? "Analyze Hot Traces" : "分析系统微观堆栈"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title={strings.totalWorkflows}
          value={statsLoading ? "—" : String(stats?.workflowCount ?? 14)}
          change="+12.4%"
          desc={strings.vsPrevMonth}
          icon={<Layers className="w-5 h-5 text-primary" />}
          colorClass={isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"}
        />
        <KpiCard
          title={strings.activeNodes}
          value={statsLoading ? "—" : String(stats?.nodeCount ?? 62)}
          change="+5.1%"
          desc={strings.vsPrevMonth}
          icon={<Cpu className="w-5 h-5 text-violet-500" />}
          colorClass={isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"}
        />
        <KpiCard
          title={language === "en" ? "System Load" : "集成计算负载"}
          value={statsLoading ? "—" : `${stats?.systemLoad ?? 84.2}%`}
          change="-2.3%"
          desc="LATENCY STABLE"
          icon={<Flame className="w-5 h-5 text-destructive" />}
          colorClass={isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"}
        />
      </div>

      {/* Grid: Pipelines & Load Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pipelines */}
        <div
          className={`p-6 rounded-xl shadow-sm space-y-4 ${
            isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground font-headline uppercase tracking-wide">
                {language === "en" ? "Active Orchestrations" : "活跃执编流水线"}
              </h3>
              <p className="text-xs text-muted-foreground leading-none font-mono">
                {workflowsLoading ? "—" : `${workflowsData?.workflows.length ?? 0} NODES EXECUTING RUNS`}
              </p>
            </div>
            <Link href="/orchestrator">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>{strings.newWorkflow}</span>
                <span className="text-xs ml-1">+</span>
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border/10">
            {workflowsLoading ? (
              <div className="py-4 text-center text-muted-foreground text-sm">Loading...</div>
            ) : workflowsData?.workflows.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                {language === "en" ? "No workflows yet." : "暂无工作流。"}{" "}
                <Link href="/orchestrator" className="text-primary hover:underline">
                  {language === "en" ? "Create one" : "创建一个"}
                </Link>
              </div>
            ) : (
              workflowsData?.workflows.map((wf) => (
                <PipelineItem
                  key={wf.id}
                  id={wf.id.slice(0, 4)}
                  name={wf.name}
                  nodes={wf.nodeCount}
                  status={wf.status === "active" ? "Active" : "Paused"}
                  time={new Date(wf.updatedAt).toLocaleDateString()}
                />
              ))
            )}
          </div>
        </div>

        {/* Live Model Runtimes */}
        <div
          className={`p-6 rounded-xl shadow-sm space-y-4 ${
            isDark ? "bg-[#1E293B] border-slate-800" : "bg-background border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground font-headline uppercase tracking-wide">
                {language === "en" ? "Model Registry & Capacity" : "模型算力与注册堆栈"}
              </h3>
              <p className="text-xs text-muted-foreground leading-none font-mono">
                {loadedModels.length} MODES OF COGNITION ACTIVE
              </p>
            </div>
            <Button variant="ghost" size="icon-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            </Button>
          </div>

          {/* Graphical Micro Load bars */}
          <div className="space-y-3">
            {loadedModels.map((m, i) => (
              <ModelRuntimeCard key={i} {...m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}