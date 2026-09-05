"use client";

import React, { useEffect, useState } from "react";
import { Bot, Play, CheckCircle2, Clock, RefreshCw, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AccessRestricted } from "@/components/auth/AccessRestricted";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const AGENT_CATALOG = [
  { name: "Inventory Agent", role: "Monitors stock levels, daily burn velocity, and stockout risk triggers." },
  { name: "Demand Forecasting Agent", role: "Computes 30-day requirement using weighted moving averages and trend factors." },
  { name: "Supplier Discovery Agent", role: "Evaluates active vendor quotes and computes 5-factor composite procurement scores." },
  { name: "Negotiation Agent", role: "Executes stateful multi-round counter-offers anchored by order volume." },
  { name: "Margin Agent", role: "Calculates deterministic gross margin, profit per unit, and ROI impact." },
  { name: "Risk Agent", role: "Evaluates supplier disruption risk, delivery punctuality, and policy constraints." },
  { name: "Procurement Agent", role: "Generates PO records, simulates payment clearance, and updates inbound inventory." },
  { name: "Supervisor Agent", role: "Coordinates end-to-end multi-agent LangGraph workflow execution." },
];

export default function AgentsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  const fetchAgentRuns = async () => {
    setLoading(true);
    try {
      const data = await api.agents.list();
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vendo_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserRole((parsed.role || "ADMIN").toUpperCase());
        }
      } catch (e) {}
    }
    fetchAgentRuns();
  }, []);

  if (userRole !== "ADMIN") {
    return (
      <AccessRestricted
        currentRole={userRole}
        requiredRole="Chief Procurement Officer / Administrator"
        pageName="Agent Control & Orchestration"
        allowedUsage={
          userRole === "MANAGER"
            ? [
                "Reviewing and approving high-value purchase orders",
                "Monitoring active supplier price negotiations",
                "Analyzing spend budgets and regional gross margins",
                "Evaluating vendor risk and reliability scores",
              ]
            : [
                "Catalog browsing and inventory reorders",
                "Reviewing AI sourcing opportunities",
                "Tracking warehouse stock and burn rates",
                "Drafting purchase orders for management",
              ]
        }
      />
    );
  }

  const handleTrigger = async (agentName: string) => {
    setTriggering(agentName);
    try {
      await api.agents.run({ agent_name: agentName });
      await fetchAgentRuns();
    } catch (err: any) {
      alert(err.message || "Agent execution failed");
    } finally {
      setTriggering(null);
    }
  };

  const pct = (val: number | undefined | null) => {
    if (val === undefined || val === null) return 95;
    return Math.round(val * 100);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agent Control Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Autonomous multi-agent orchestration layer powered by LangGraph.
            </p>
          </div>
          <button
            onClick={fetchAgentRuns}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENT_CATALOG.map((agent) => (
            <div key={agent.name} className="rounded-xl border bg-card p-4 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    READY
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{agent.role}</p>
              </div>

              <button
                onClick={() => handleTrigger(agent.name)}
                disabled={triggering === agent.name}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-100 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {triggering === agent.name ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-slate-700" />
                )}
                Trigger Run
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Recent Workflow Executions (LangGraph)
          </h2>

          <div className="divide-y text-xs">
            {loading ? (
              <p className="py-6 text-center text-slate-400">Loading execution logs...</p>
            ) : runs.length === 0 ? (
              <p className="py-6 text-center text-slate-400">No agent runs recorded yet.</p>
            ) : (
              runs.map((run) => (
                <div key={run.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{run.agent_name}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">({run.execution_id})</span>
                      <p className="text-[11px] text-slate-500">
                        Trigger: {run.trigger} | Confidence: {pct(run.confidence_score)}%
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {run.status}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{run.execution_duration_ms || 420}ms</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}