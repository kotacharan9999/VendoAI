"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  Search,
  RefreshCw,
  Filter,
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Package,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AdjustFormData {
  id: string;
  productTitle: string;
  current_stock: string;
  reserved_stock: string;
  expected_inbound: string;
  reorder_point: string;
  safety_stock: string;
  suggested_reorder_qty: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Adjust stock modal
  const [adjustItem, setAdjustItem] = useState<AdjustFormData | null>(null);
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInventory = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.inventory.list();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || "Failed to load inventory records. Please verify the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterRisk === "RISK" && !["CRITICAL", "HIGH"].includes(item.stockout_risk_level)) return false;
    if (filterRisk === "SAFE" && ["CRITICAL", "HIGH"].includes(item.stockout_risk_level)) return false;
    if (search) {
      const title = item.product?.title?.toLowerCase() || "";
      const sku = item.product?.sku?.toLowerCase() || "";
      return title.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
    }
    return true;
  });

  const handleOpenAdjust = (item: any) => {
    setAdjustItem({
      id: item.id,
      productTitle: item.product?.title || "Product",
      current_stock: String(item.current_stock ?? 0),
      reserved_stock: String(item.reserved_stock ?? 0),
      expected_inbound: String(item.expected_inbound ?? 0),
      reorder_point: String(item.reorder_point ?? 10),
      safety_stock: String(item.safety_stock ?? 0),
      suggested_reorder_qty: String(item.suggested_reorder_qty ?? 0),
    });
    setAdjustError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    setAdjustSubmitting(true);
    setAdjustError(null);

    try {
      await api.inventoryUpdate.update(adjustItem.id, {
        current_stock: parseInt(adjustItem.current_stock) || 0,
        reserved_stock: parseInt(adjustItem.reserved_stock) || 0,
        expected_inbound: parseInt(adjustItem.expected_inbound) || 0,
        reorder_point: parseInt(adjustItem.reorder_point) || 10,
        safety_stock: parseInt(adjustItem.safety_stock) || 0,
        suggested_reorder_qty: parseInt(adjustItem.suggested_reorder_qty) || 0,
      });
      showToast(`Stock for "${adjustItem.productTitle}" updated!`);
      setAdjustItem(null);
      await fetchInventory();
    } catch (err: any) {
      setAdjustError(err.message || "Failed to update inventory.");
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const riskColors: Record<string, string> = {
    CRITICAL: "bg-red-50 text-red-700 border-red-200",
    HIGH: "bg-amber-50 text-amber-700 border-amber-200",
    MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    HEALTHY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  // Summary counts
  const criticalCount = items.filter((i) => i.stockout_risk_level === "CRITICAL").length;
  const highCount = items.filter((i) => i.stockout_risk_level === "HIGH").length;
  const healthyCount = items.filter((i) => !["CRITICAL", "HIGH"].includes(i.stockout_risk_level)).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xl flex items-center gap-2 animate-in fade-in-50 slide-in-from-top-2 max-w-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Boxes className="h-6 w-6 text-blue-600" />
              Inventory & Stock Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time stock levels, stockout risks, and reorder intelligence.
            </p>
          </div>
          <button
            onClick={fetchInventory}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Load Error Alert */}
        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Backend Connection Error</p>
                <p className="mt-0.5 text-red-700">{loadError}</p>
              </div>
            </div>
            <button
              onClick={fetchInventory}
              className="rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-3 py-1.5 text-xs shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Critical Risk", count: criticalCount, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50 border-red-200" },
              { label: "High Risk", count: highCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
              { label: "Healthy", count: healthyCount, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl border p-3 sm:p-4 text-center", s.bg)}>
                <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.color)} />
                <p className={cn("text-xl sm:text-2xl font-bold", s.color)}>{s.count}</p>
                <p className="text-[10px] sm:text-xs text-slate-600 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            {["ALL", "RISK", "SAFE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterRisk(tab)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap",
                  filterRisk === tab
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab === "ALL" ? "All" : tab === "RISK" ? "At Risk" : "Healthy"}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="border-b bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 sm:px-5 py-3">Product</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Inbound</th>
                  <th className="px-4 py-3 hidden md:table-cell">Coverage</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Reorder Point</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Suggested Order</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 sm:px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      No matching inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const riskClass = riskColors[item.stockout_risk_level] || "bg-slate-50 text-slate-600 border-slate-200";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 sm:px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs">{item.product?.title || "Product"}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.product?.sku}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            "font-bold text-sm",
                            item.current_stock < (item.reorder_point ?? 10) ? "text-red-600" : "text-slate-900"
                          )}>
                            {item.current_stock}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-blue-600 font-medium hidden sm:table-cell">+{item.expected_inbound}</td>
                        <td className="px-4 py-3.5 font-medium hidden md:table-cell">{item.days_of_inventory} days</td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">{item.reorder_point}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 hidden lg:table-cell">{item.suggested_reorder_qty} units</td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border", riskClass)}>
                            {item.stockout_risk_level}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                              title="Adjust Stock"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span className="hidden sm:inline">Adjust</span>
                            </button>
                            <Link
                              href={`/products/${item.product_id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <ArrowUpRight className="h-3 w-3" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Adjust Stock Levels</h2>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{adjustItem.productTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {adjustError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "current_stock", label: "Current Stock (units)", hint: "Actual on-hand quantity" },
                  { key: "reserved_stock", label: "Reserved Stock (units)", hint: "Committed to orders" },
                  { key: "expected_inbound", label: "Expected Inbound (units)", hint: "Incoming stock" },
                  { key: "reorder_point", label: "Reorder Point", hint: "Trigger threshold" },
                  { key: "safety_stock", label: "Safety Stock", hint: "Buffer reserve" },
                  { key: "suggested_reorder_qty", label: "Suggested Order Qty", hint: "AI recommended" },
                ].map(({ key, label, hint }) => (
                  <div key={key}>
                    <label className="font-semibold text-slate-700 block mb-0.5">{label}</label>
                    <p className="text-[10px] text-slate-400 mb-1">{hint}</p>
                    <input
                      type="number"
                      min="0"
                      value={(adjustItem as any)[key]}
                      onChange={(e) => setAdjustItem({ ...adjustItem, [key]: e.target.value })}
                      className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-700">
                <strong>Note:</strong> Stock adjustments are logged as inventory movements for audit trail compliance.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {adjustSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Stock Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
