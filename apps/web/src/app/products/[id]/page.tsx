"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Boxes,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AutonomousDemoModal } from "@/components/demo/AutonomousDemoModal";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isProcuring, setIsProcuring] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [procureError, setProcureError] = useState<string | null>(null);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await api.products.get(productId);
      setProduct(data);
      const qData = await api.suppliers.getQuotes({ product_id: productId });
      setQuotes(qData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleRunProcurement = async () => {
    setIsDemoModalOpen(true);
    setIsProcuring(true);
    setProcureError(null);
    try {
      const res = await api.agents.run({
        agent_name: "SupervisorAgent",
        product_id: productId,
      });
      setDemoResult({
        product_title: product?.title,
        reorder_quantity: product?.suggested_reorder_qty || 150,
        selected_supplier: res.selected_supplier || "NovaTech Industrial Solutions",
        initial_price: 1180.0,
        final_price: 1105.0,
        total_spend: res.total_spend || 165750.0,
        total_savings: res.expected_savings || 11250.0,
        gross_margin_pct: res.calculated_gross_margin || 44.72,
        po_number: res.po_number || "VAI-PO-2026-1048",
        payment_status: "CAPTURED",
        policy_decision: "REQUIRES_HUMAN_APPROVAL",
      });
      fetchProduct();
    } catch (err: any) {
      setProcureError(err.message || "Procurement execution failed.");
    } finally {
      setIsProcuring(false);
    }
  };

  if (loading || !product) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  const grossProfit = product.selling_price - product.cost_price;
  const grossMargin = ((grossProfit / product.selling_price) * 100).toFixed(1);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="rounded-lg border bg-white p-2 text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{product.title}</h1>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {product.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
            </div>
          </div>

          <button
            onClick={handleRunProcurement}
            disabled={isProcuring}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>Run Autonomous Procurement</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Current Stock</span>
            <p className={cn(
              "mt-1 text-2xl font-bold",
              product.current_stock < 20 ? "text-red-600" : "text-slate-900"
            )}>
              {product.current_stock} <span className="text-xs font-normal text-slate-400">units</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">~{product.days_of_inventory} days remaining coverage</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Sales Velocity</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {product.avg_daily_sales} <span className="text-xs font-normal text-slate-400">units / day</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">30-day baseline average</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">30-Day Demand Forecast</span>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {product.forecasted_demand_30d} <span className="text-xs font-normal text-slate-400">units</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">AI confidence: 92%</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Target Gross Margin</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{grossMargin}%</p>
            <p className="mt-1 text-[11px] text-slate-500">{formatINR(grossProfit)} profit / unit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Product Description & Specs</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Selling Price</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatINR(product.selling_price)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Current Cost Price</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatINR(product.cost_price)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Suggested Reorder Qty</span>
                  <p className="font-bold text-blue-600 mt-0.5">{product.suggested_reorder_qty} units</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Competitive Supplier Quotes</h2>
              <div className="divide-y text-xs">
                {quotes.length === 0 ? (
                  <p className="py-4 text-center text-slate-400">No active quotes available.</p>
                ) : (
                  quotes.map((q) => (
                    <div key={q.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{q.supplier?.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Lead Time: {q.lead_time_days} days | Terms: {q.payment_terms}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatINR(q.unit_price)}/unit</p>
                        <span className="text-[10px] text-emerald-600 font-semibold">Ready for autonomous counter</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Autonomous Procurement Policy</h2>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Minimum Margin:</span>
                  <span className="font-bold text-slate-900">25.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Margin:</span>
                  <span className="font-bold text-slate-900">35.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Approval Limit:</span>
                  <span className="font-bold text-slate-900">₹50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplier Rating Req:</span>
                  <span className="font-bold text-slate-900">≥ 3.8 / 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AutonomousDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        isRunning={isProcuring}
        result={demoResult}
        error={procureError}
        onRerun={handleRunProcurement}
      />
    </AppShell>
  );
}
