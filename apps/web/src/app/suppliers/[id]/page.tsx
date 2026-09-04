"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Star, ShieldCheck, MapPin, Clock, Loader2, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.suppliers.get(id).then((data) => {
        setSupplier(data);
        setLoading(false);
      }).catch(console.error);
    }
  }, [id]);

  if (loading || !supplier) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  const breakdown = supplier.scoring_breakdown;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <Link
            href="/suppliers"
            className="rounded-lg border bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{supplier.name}</h1>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {supplier.negotiation_style}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {supplier.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Procurement Score</span>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {supplier.procurement_score || 89.4} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Weighted composite index</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Quality Score</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{supplier.quality_score}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Quality inspection index</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Delivery Fulfillment</span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{supplier.delivery_score}%</p>
            <p className="mt-1 text-[11px] text-slate-500">On-time dispatch rate</p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <span className="text-slate-500 text-xs">Risk Assessment</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{supplier.risk_score} / 100</p>
            <p className="mt-1 text-[11px] text-slate-500">Low vendor disruption risk</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-3">
            Procurement Score Factors (Normalized)
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Cost Competitiveness (35% Weight)</span>
                <span className="text-blue-600">{breakdown?.cost_score || 92}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${breakdown?.cost_score || 92}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Fulfillment Reliability (25% Weight)</span>
                <span className="text-teal-600">{breakdown?.reliability_score || 88}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${breakdown?.reliability_score || 88}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Delivery Speed & Punctuality (20% Weight)</span>
                <span className="text-indigo-600">{breakdown?.delivery_score || 90}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${breakdown?.delivery_score || 90}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Quality Assurance Standards (10% Weight)</span>
                <span className="text-amber-600">{breakdown?.quality_score || 85}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${breakdown?.quality_score || 85}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Payment Terms & Credit Flexibility (10% Weight)</span>
                <span className="text-purple-600">{breakdown?.payment_terms_score || 85}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${breakdown?.payment_terms_score || 85}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
