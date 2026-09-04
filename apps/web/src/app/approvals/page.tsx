"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw, Clock, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.approvals.list();
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.approvals.approve(id, "Approved by manager sign-off.");
      await fetchApprovals();
    } catch (err: any) {
      alert(err.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await api.approvals.reject(id, "Rejected during managerial review.");
      await fetchApprovals();
    } catch (err: any) {
      alert(err.message || "Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Managerial Approval Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Deterministic policy routing: Human authorization required for transactions exceeding threshold limits.
            </p>
          </div>
          <button
            onClick={fetchApprovals}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="py-12 text-center text-xs text-slate-400">Loading approval queue...</p>
          ) : approvals.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">No pending approvals</h3>
              <p className="text-xs text-slate-500 mt-1">
                All procurement transactions are compliant and processed.
              </p>
            </div>
          ) : (
            approvals.map((app) => {
              const isPending = app.status === "PENDING";
              const isApproved = app.status === "APPROVED";
              return (
                <div key={app.id} className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                          isPending
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        )}
                      >
                        {app.status}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{app.requested_action}</h2>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border">
                      <span className="text-slate-500 text-[11px]">Transaction Amount</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(app.amount)}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-emerald-700 text-[11px] font-medium">Expected Gross Margin</span>
                      <p className="font-bold text-emerald-800 text-sm mt-0.5">{app.expected_margin}%</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border">
                      <span className="text-slate-500 text-[11px]">Supplier Risk Score</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{app.risk_score} / 100</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border">
                      <span className="text-slate-500 text-[11px]">Entity Reference</span>
                      <p className="font-mono font-bold text-blue-600 text-sm mt-0.5">{app.entity_id}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border">
                    <span className="font-semibold text-slate-900">Reason for Request: </span>
                    {app.reason}
                  </div>

                  {app.comments && (
                    <div className="text-xs text-slate-500 italic">
                      Decision Note: "{app.comments}"
                    </div>
                  )}

                  {isPending && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={processingId === app.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={processingId === app.id}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50"
                      >
                        {processingId === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Authorize & Execute PO
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
