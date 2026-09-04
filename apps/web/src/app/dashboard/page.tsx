"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  AlertTriangle,
  CreditCard,
  Sparkles,
  TrendingUp,
  Handshake,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  Building2,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.dashboard.get();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Loading intelligence dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600 mb-2" />
          <h3 className="text-base font-semibold text-red-900">Dashboard Unavailable</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Procurement Intelligence Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Autonomous demand monitoring, margin protection, and multi-supplier negotiations.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.inventory_value.label}</span>
              <Boxes className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.inventory_value.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.inventory_value.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.products_at_risk.label}</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-amber-600">{data.products_at_risk.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.products_at_risk.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.procurement_spend.label}</span>
              <CreditCard className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.procurement_spend.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.procurement_spend.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.ai_savings.label}</span>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-emerald-600">{data.ai_savings.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.ai_savings.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.average_margin.label}</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.average_margin.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.average_margin.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.active_negotiations.label}</span>
              <Handshake className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.active_negotiations.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.active_negotiations.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.pending_approvals.label}</span>
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.pending_approvals.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.pending_approvals.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.revenue_protected.label}</span>
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.revenue_protected.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.revenue_protected.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.forecast_accuracy.label}</span>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.forecast_accuracy.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.forecast_accuracy.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>{data.supplier_reliability.label}</span>
              <Building2 className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{data.supplier_reliability.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{data.supplier_reliability.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Procurement Spend vs AI Savings</h3>
                <p className="text-xs text-slate-500">Monthly breakdown of spend and autonomous negotiated savings</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.spend_trend}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(value: any) => [formatINR(value), ""]} />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" name="Spend" />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" name="Savings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Catalog Stockout Risk Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Risk tiers based on burn rate and lead times</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.inventory_risk_distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {data.inventory_risk_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs">
              {data.inventory_risk_distribution.map((item: any) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}:</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Urgent Procurement Opportunities</h3>
                <p className="text-xs text-slate-500">Autonomous triggers awaiting action</p>
              </div>
              <Link href="/opportunities" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y">
              {data.top_opportunities.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No open procurement opportunities at this time.</p>
              ) : (
                data.top_opportunities.map((opp: any) => (
                  <div key={opp.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        opp.urgency === "CRITICAL" ? "bg-red-500" : opp.urgency === "HIGH" ? "bg-amber-500" : "bg-blue-500"
                      )} />
                      <div>
                        <p className="font-semibold text-slate-900">{opp.product?.title || "Product"}</p>
                        <p className="text-slate-500 text-[11px]">
                          Stock: {opp.current_stock} | Coverage: {opp.days_of_coverage} days | Reorder: {opp.recommended_quantity} units
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatINR(opp.expected_total_cost)}</p>
                        <p className="text-emerald-600 text-[11px] font-medium">{opp.expected_margin}% margin</p>
                      </div>
                      <Link
                        href="/opportunities"
                        className="rounded bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Agent Activity</h3>
                <p className="text-xs text-slate-500">Autonomous decisions & events</p>
              </div>
              <Link href="/activity" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View log <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {data.recent_activity.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No recent activity recorded.</p>
              ) : (
                data.recent_activity.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-800 leading-tight">{act.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
