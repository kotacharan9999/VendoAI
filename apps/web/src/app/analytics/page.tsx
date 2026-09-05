"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, Sparkles, Clock, CheckCircle2, Building2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AccessRestricted } from "@/components/auth/AccessRestricted";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.analytics.get();
      setData(res);
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
    fetchAnalytics();
  }, []);

  if (userRole === "BUYER") {
    return (
      <AccessRestricted
        currentRole="BUYER"
        requiredRole="Manager or Administrator"
        pageName="Spend Analytics & Financial Intelligence"
        allowedUsage={[
          "Sourcing agricultural and industrial commodities",
          "Monitoring stock and daily sales velocities",
          "Generating draft purchase orders",
          "Tracking supplier quotes and deliveries",
        ]}
      />
    );
  }

  if (loading || !data) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Procurement & Financial Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              End-to-end performance metrics, AI negotiated savings, and margin distribution.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Total Spend</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatINR(data.total_procurement_spend)}</p>
            <p className="mt-1 text-[11px] text-slate-500">Committed orders</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">AI Negotiated Savings</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{formatINR(data.total_ai_savings)}</p>
            <p className="mt-1 text-[11px] text-slate-500">Secured via autonomous rounds</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Average Gross Margin</span>
            <p className="mt-1 text-2xl font-bold text-blue-600">{data.average_gross_margin}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Across active catalog</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Negotiation Success</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data.negotiation_success_rate}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Target price achievement rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Procurement Spend by Category</h2>
            <p className="text-xs text-slate-500 mb-4">Capital allocation across product categories</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.spend_by_category}
                    dataKey="spend"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.spend_by_category.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Savings by Supplier</h2>
            <p className="text-xs text-slate-500 mb-4">Autonomous price discounts secured per vendor</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.savings_by_supplier}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="supplier" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v: any) => [formatINR(v), "Savings"]} />
                  <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
