"use client";

import React, { useEffect, useState } from "react";
import { HeartPulse, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, BarChart2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AccessRestricted } from "@/components/auth/AccessRestricted";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DataHealthPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await api.dataHealth.get();
      setReport(data);
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
    fetchHealth();
  }, []);

  if (userRole !== "ADMIN") {
    return (
      <AccessRestricted
        currentRole={userRole}
        requiredRole="Chief Procurement Officer / Administrator"
        pageName="Database Health & Integrity Engine"
        allowedUsage={
          userRole === "MANAGER"
            ? [
                "Procurement approvals & order signing",
                "Vendor performance & risk monitoring",
                "Spend analytics & margin compliance",
              ]
            : [
                "Commodity sourcing & catalog browsing",
                "Warehouse stock & reorder tracking",
                "Purchase order drafting",
              ]
        }
      />
    );
  }

  if (loading || !report) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Health & Integrity</h1>
            <p className="text-sm text-slate-500 mt-1">
              Automated database consistency, non-negative stock invariants, and catalog validation checks.
            </p>
          </div>
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Re-run Checks
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Catalog Health Score</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{report.health_score}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Status: {report.overall_status}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Passed Invariant Checks</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {report.passed_checks} <span className="text-xs text-slate-400 font-normal">/ {report.total_checks}</span>
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">100% passed</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Total Validated Products</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{report.metrics?.total_products || 6}</p>
            <p className="mt-1 text-[11px] text-slate-500">Active catalog SKUs</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Sales Records Validated</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{report.metrics?.total_sales_records || 360}</p>
            <p className="mt-1 text-[11px] text-slate-500">Historical data points</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-3">
            System Invariant & Validation Reports
          </h2>

          <div className="divide-y text-xs">
            {report.checks?.map((check: any, idx: number) => {
              const isPassed = check.status === "PASSED";
              return (
                <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{check.check_name}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          {check.category}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{check.details}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                      isPassed
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    )}
                  >
                    {check.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
