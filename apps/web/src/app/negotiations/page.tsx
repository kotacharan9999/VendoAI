"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Handshake, ArrowRight, CheckCircle2, Clock, Sparkles, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WhatsAppNegotiator } from "@/components/negotiations/WhatsAppNegotiator";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function NegotiationsPage() {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const data = await api.negotiations.list();
      setNegotiations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Autonomous Supplier Negotiations</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Multi-round counter-offers, volume anchors, and freight concessions.</p>
          </div>
          <button
            onClick={fetchNegotiations}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        {/* Live WhatsApp Negotiation Simulator */}
        <WhatsAppNegotiator />

        <div className="space-y-4">
          {loading ? (
            <p className="py-12 text-center text-xs text-slate-400">Loading negotiation logs...</p>
          ) : negotiations.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 sm:p-12 text-center">
              <Handshake className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">No active negotiations</h3>
              <p className="text-xs text-slate-500 mt-1">
                Initiate an autonomous procurement cycle to execute real-time multi-round supplier negotiations.
              </p>
            </div>
          ) : (
            negotiations.map((neg) => (
              <div key={neg.id} className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Supplier: {neg.supplier?.name}</span>
                    <h2 className="text-base font-bold text-slate-900">{neg.product?.title}</h2>
                  </div>
                  <span
                    className={cn(
                      "self-start sm:self-auto rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                      neg.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    )}
                  >
                    {neg.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Initial Supplier Quote</span>
                    <p className="font-bold text-slate-400 line-through text-sm mt-0.5">{formatINR(neg.initial_quote)}</p>
                    <p className="text-[10px] text-slate-400">Opening rate</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Final Negotiated Price</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(neg.final_price || neg.target_price)}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Freight included</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-emerald-700 text-[11px] font-medium">Total AI Savings</span>
                    <p className="font-bold text-emerald-800 text-sm mt-0.5">{formatINR(neg.expected_savings)}</p>
                    <p className="text-[10px] text-emerald-600">On {neg.quantity} units</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Gross Margin</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{neg.expected_margin}%</p>
                    <p className="text-[10px] text-slate-400">Protected margin</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500 text-[11px]">Rounds Completed</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{neg.rounds_completed} / {neg.max_rounds}</p>
                    <p className="text-[10px] text-slate-400">Target reached</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-slate-500">Strategy: {neg.strategy}</span>
                  <Link
                    href={`/negotiations/${neg.id}`}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    View Transcript & Rounds <ArrowRight className="h-3.5 w-3.5" />
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
