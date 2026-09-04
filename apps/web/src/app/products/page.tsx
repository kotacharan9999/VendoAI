"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Search, ArrowRight, RefreshCw, Tag, Boxes } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.list();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (search) {
      const title = p.title.toLowerCase();
      const sku = p.sku.toLowerCase();
      return title.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Catalog</h1>
            <p className="text-sm text-slate-500 mt-1">Master catalog items, margins, and procurement mappings.</p>
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-slate-600 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 py-12 text-center text-xs text-slate-400">Loading catalog products...</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-3 py-12 text-center text-xs text-slate-400">No products found.</p>
          ) : (
            filtered.map((p) => {
              const grossProfit = p.selling_price - p.cost_price;
              const marginPct = ((grossProfit / p.selling_price) * 100).toFixed(1);
              return (
                <div key={p.id} className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-mono">{p.sku}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{p.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Selling Price</span>
                        <p className="font-bold text-slate-900">{formatINR(p.selling_price)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Cost Price</span>
                        <p className="font-semibold text-slate-700">{formatINR(p.cost_price)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Gross Margin</span>
                        <p className="font-bold text-emerald-600">{marginPct}%</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Stock Status</span>
                        <p className={cn(
                          "font-semibold",
                          p.stockout_risk_level === "CRITICAL" ? "text-red-600" : "text-slate-800"
                        )}>
                          {p.current_stock} units
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t">
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      Inspect Intelligence <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
