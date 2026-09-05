"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2, XCircle, RefreshCw, Handshake, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.opportunities.list();
      setOpportunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Procurement Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1">
              Autonomous triggers detected based on burn rate, stockout forecast, and supplier quotes.
            </p>
          </div>
          <button
            onClick={fetchOpportunities}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="py-12 text-center text-xs text-slate-400">Loading procurement opportunities...</p>
          ) : opportunities.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">All inventory levels optimized</h3>
              <p className="text-xs text-slate-500 mt-1">
                No stockout triggers detected across current catalog coverage. Initiate an autonomous procurement cycle to evaluate.
              </p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <div key={opp.id} className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                        opp.urgency === "CRITICAL"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      )}
                    >
                      {opp.urgency} Urgency
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{opp.product?.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Policy:</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                      {opp.policy_result}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Current Stock</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{opp.current_stock} units</p>
                    <p className="text-[10px] text-slate-400">~{opp.days_of_coverage} days left</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">30-Day Demand</span>
                    <p className="font-bold text-blue-600 text-sm mt-0.5">{opp.predicted_demand} units</p>
                    <p className="text-[10px] text-slate-400">Forecasted demand</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Recommended Order</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{opp.recommended_quantity} units</p>
                    <p className="text-[10px] text-slate-400">EOQ batch</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Recommended Supplier</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">{opp.recommended_supplier?.name || "NovaTech"}</p>
                    <p className="text-[10px] text-slate-400">Procurement Score: 89.4</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-emerald-700 text-[11px] font-medium">Gross Margin</span>
                    <p className="font-bold text-emerald-800 text-sm mt-0.5">{opp.expected_margin}%</p>
                    <p className="text-[10px] text-emerald-600">Profit: {formatINR(opp.expected_savings)}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Total PO Cost</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(opp.expected_total_cost)}</p>
                    <p className="text-[10px] text-slate-400">₹{opp.expected_unit_cost}/unit</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-medium">Recommended Action: {opp.recommended_action}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${opp.product_id}`}
                      className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Inspect Product
                    </Link>
                    <Link
                      href="/negotiations"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 flex items-center gap-1.5"
                    >
                      <Handshake className="h-3.5 w-3.5" />
                      View Negotiation
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
