"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, AlertTriangle, ArrowUpRight, Search, RefreshCw, Sparkles, Filter } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.inventory.list();
      setItems(data);
    } catch (err) {
      console.error(err);
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

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory & Stock Health</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time inventory levels, stockout risks, and burn velocity.</p>
          </div>
          <button
            onClick={fetchInventory}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
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
            {["ALL", "RISK", "SAFE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterRisk(tab)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filterRisk === tab
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab === "ALL" ? "All Inventory" : tab === "RISK" ? "At Risk Only" : "Healthy Stock"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Inbound</th>
                  <th className="px-4 py-3">Coverage (Days)</th>
                  <th className="px-4 py-3">Reorder Point</th>
                  <th className="px-4 py-3">Suggested Order</th>
                  <th className="px-4 py-3">Risk Tier</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No matching inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isCritical = item.stockout_risk_level === "CRITICAL";
                    const isHigh = item.stockout_risk_level === "HIGH";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{item.product?.title || "Product"}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{item.product?.sku}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">{item.current_stock}</td>
                        <td className="px-4 py-3.5 text-blue-600 font-medium">+{item.expected_inbound}</td>
                        <td className="px-4 py-3.5 font-medium">{item.days_of_inventory} days</td>
                        <td className="px-4 py-3.5">{item.reorder_point}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{item.suggested_reorder_qty} units</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              isCritical
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : isHigh
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : item.stockout_risk_level === "RESOLVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            )}
                          >
                            {item.stockout_risk_level}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/products/${item.product_id}`}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            Details <ArrowUpRight className="h-3 w-3" />
                          </Link>
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
    </AppShell>
  );
}
