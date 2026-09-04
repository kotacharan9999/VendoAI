"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, Clock, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function ActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<"EVENTS" | "AUDIT">("EVENTS");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eData = await api.activity.list();
      setEvents(eData);
      const aData = await api.activity.getAudit();
      setAuditLogs(aData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity & Audit Intelligence</h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable ledger of autonomous events, financial decisions, and managerial approvals.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setTab("EVENTS")}
            className={cn(
              "rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
              tab === "EVENTS" ? "bg-blue-600 text-white" : "bg-card border text-slate-600 hover:bg-slate-50"
            )}
          >
            Real-Time Agent Events
          </button>
          <button
            onClick={() => setTab("AUDIT")}
            className={cn(
              "rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
              tab === "AUDIT" ? "bg-blue-600 text-white" : "bg-card border text-slate-600 hover:bg-slate-50"
            )}
          >
            Financial & Policy Audit Trail
          </button>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          {tab === "EVENTS" ? (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Live Agent Event Log
              </h2>
              <div className="divide-y text-xs">
                {loading ? (
                  <p className="py-6 text-center text-slate-400">Loading events...</p>
                ) : events.length === 0 ? (
                  <p className="py-6 text-center text-slate-400">No agent events recorded yet.</p>
                ) : (
                  events.map((evt) => (
                    <div key={evt.id} className="py-3 flex items-start gap-3">
                      <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-[10px] text-blue-700">
                            {evt.event_type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 mt-1">{evt.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Authoritative Decision Ledger
              </h2>
              <div className="divide-y text-xs">
                {loading ? (
                  <p className="py-6 text-center text-slate-400">Loading audit log...</p>
                ) : auditLogs.length === 0 ? (
                  <p className="py-6 text-center text-slate-400">No audit records yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="py-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-mono">
                            {log.actor_type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{log.reason_summary}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        {log.financial_amount && <span>Amount: <b className="text-slate-900">{formatINR(log.financial_amount)}</b></span>}
                        {log.policy_result && <span>Policy Result: <b className="text-emerald-600">{log.policy_result}</b></span>}
                        <span>Entity: <b className="font-mono text-slate-700">{log.entity_type} ({log.entity_id.slice(0, 8)})</b></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
