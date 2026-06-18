"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@x-workflow/ui/components/card";
import { Button } from "@x-workflow/ui/components/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

type Session = typeof authClient.$Infer.Session;

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
}

function KpiCard({ title, value, icon, colorClass }: KpiCardProps) {
  return (
    <Card className="flex-1 min-w-[200px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded ${colorClass}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface WorkflowListItemProps {
  id: string;
  name: string;
  status: "active" | "paused";
  nodeCount: number;
  updatedAt: Date;
}

function WorkflowListItem({ id, name, status, nodeCount, updatedAt }: WorkflowListItemProps) {
  const statusColors = status === "active"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  const formattedTime = new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(updatedAt));

  return (
    <Link href={`/orchestrator?workflowId=${id}`}>
      <div className="flex items-center justify-between p-3 rounded border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors}`}>
              {status === "active" ? "Active" : "Paused"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>ID: {id.slice(0, 8)}</span>
            <span>{nodeCount} nodes</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
      </div>
    </Link>
  );
}

interface ModelRuntimeCardProps {
  name: string;
  latency: string;
  reliability: number;
  usage: number;
}

function ModelRuntimeCard({ name, latency, reliability, usage }: ModelRuntimeCardProps) {
  return (
    <Card className="flex-1 min-w-[280px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Latency</span>
          <span className="font-medium">{latency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Reliability</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded"
                style={{ width: `${reliability}%` }}
              />
            </div>
            <span className="font-medium">{reliability}%</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usage</span>
          <span className="font-medium">{usage}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ session }: { session: Session }) {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: workflowsData, isLoading: workflowsLoading } = trpc.workflow.list.useQuery({ limit: 5 });

  // Static model runtime configuration (per design.md - expandable later)
  const modelRuntimes: ModelRuntimeCardProps[] = [
    { name: "Claude 3.5 Sonnet", latency: "120ms", reliability: 99.9, usage: 45 },
    { name: "GPT-4o", latency: "85ms", reliability: 99.5, usage: 32 },
    { name: "Gemini Pro", latency: "95ms", reliability: 98.7, usage: 23 },
  ];

  const userName = session.user?.name || session.user?.email || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Banner */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  System Online
                </span>
              </div>
              <h1 className="text-xl font-semibold">
                Welcome back, {userName}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link href="/orchestrator">
                <Button variant="default" size="sm">Enter Canvas</Button>
              </Link>
              <Link href="/debugger">
                <Button variant="outline" size="sm">Analyze Stack</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              title="Total Workflows"
              value={statsLoading ? "—" : (stats?.workflowCount ?? 0)}
              icon={
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
            <KpiCard
              title="Active Nodes"
              value={statsLoading ? "—" : (stats?.nodeCount ?? 0)}
              icon={
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            />
            <KpiCard
              title="System Load"
              value={statsLoading ? "—" : `${stats?.systemLoad ?? 0}%`}
              icon={
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
          </div>
        </section>

        {/* Bottom Section: Workflow List + Model Runtime */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Workflows List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Workflows</h2>
              <Link href="/orchestrator">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0 divide-y divide-border/50">
                {workflowsLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : workflowsData?.workflows.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No workflows yet.{" "}
                    <Link href="/orchestrator" className="text-primary hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  workflowsData?.workflows.map((wf) => (
                    <div key={wf.id} className="p-3">
                      <WorkflowListItem
                        id={wf.id}
                        name={wf.name}
                        status={wf.status}
                        nodeCount={wf.nodeCount}
                        updatedAt={new Date(wf.updatedAt)}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          {/* Model Runtime Cards */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Model Runtime</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {modelRuntimes.map((model) => (
                <ModelRuntimeCard key={model.name} {...model} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
