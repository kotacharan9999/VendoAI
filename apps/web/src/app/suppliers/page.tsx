"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Star, ShieldCheck, MapPin, Clock, ArrowRight, RefreshCw, BarChart2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.suppliers.list();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Supplier Network & Intelligence</h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-factor vendor scoring across cost, reliability, delivery, quality, and terms.
            </p>
          </div>
          <button
            onClick={fetchSuppliers}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 py-12 text-center text-xs text-slate-400">Loading supplier network...</p>
          ) : (
            suppliers.map((s) => (
              <div key={s.id} className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {s.negotiation_style}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{s.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{s.location}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Procurement Score:</span>
                      <span className="font-bold text-blue-600">{s.procurement_score || 85.0} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reliability Index:</span>
                      <span className="font-semibold text-slate-900">{s.reliability_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Fulfillment:</span>
                      <span className="font-semibold text-slate-900">{s.delivery_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Standard Terms:</span>
                      <span className="font-semibold text-slate-900">{s.payment_terms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lead Time:</span>
                      <span className="font-semibold text-slate-900">{s.lead_time_days} days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t">
                  <Link
                    href={`/suppliers/${s.id}`}
                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    View Supplier Profile <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
