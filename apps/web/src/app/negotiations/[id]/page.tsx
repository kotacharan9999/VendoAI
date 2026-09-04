"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Handshake, CheckCircle2, Clock, Building2, Bot, ArrowRight, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function NegotiationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [negotiation, setNegotiation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.negotiations.get(id).then((data) => {
        setNegotiation(data);
        setLoading(false);
      }).catch(console.error);
    }
  }, [id]);

  if (loading || !negotiation) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            href="/negotiations"
            className="rounded-lg border bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Negotiation Record — {negotiation.product?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Vendor: {negotiation.supplier?.name} | Strategy: {negotiation.strategy}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-card border">
            <span className="text-slate-500 text-[11px]">Initial Supplier Quote</span>
            <p className="font-bold text-slate-400 line-through text-sm mt-0.5">{formatINR(negotiation.initial_quote)}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border">
            <span className="text-slate-500 text-[11px]">Final Agreed Price</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(negotiation.final_price || negotiation.target_price)}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <span className="text-emerald-700 text-[11px] font-medium">Secured Savings</span>
            <p className="font-bold text-emerald-800 text-sm mt-0.5">{formatINR(negotiation.expected_savings)}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border">
            <span className="text-slate-500 text-[11px]">Protected Gross Margin</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{negotiation.expected_margin}%</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-3">
            Autonomous Negotiation Transcript
          </h2>

          <div className="space-y-6">
            {negotiation.messages?.map((msg: any) => (
              <div key={msg.id} className="space-y-3 rounded-xl bg-slate-50/80 p-4 border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700">Round {msg.round_number} — Buyer Counter Proposal</span>
                  <span className="text-slate-400 font-mono">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-start gap-3 bg-white p-3 rounded-lg border text-xs">
                  <Bot className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">Vendo Procurement Agent:</span>
                      <span className="font-bold text-blue-600">{formatINR(msg.offer_price)}/unit</span>
                      <span className="text-[11px] text-slate-400 font-medium">({msg.payment_terms})</span>
                    </div>
                    <p className="text-slate-700">{msg.message_text}</p>
                  </div>
                </div>

                {msg.supplier_counter_price && (
                  <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs">
                    <Building2 className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{negotiation.supplier?.name}:</span>
                        <span className="font-bold text-slate-900">{formatINR(msg.supplier_counter_price)}/unit</span>
                      </div>
                      <p className="text-slate-700">{msg.supplier_response_text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Negotiation Concluded Successfully</p>
                <p className="text-[11px] text-emerald-700">
                  Target price satisfied. Savings of {formatINR(negotiation.expected_savings)} secured for purchase order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
