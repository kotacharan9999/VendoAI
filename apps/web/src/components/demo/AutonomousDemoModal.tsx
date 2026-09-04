"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Loader2,
  X,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Building,
  FileCheck2,
  CreditCard,
  Boxes,
  Activity,
  Sparkles,
} from "lucide-react";
import { formatINR, cn } from "@/lib/utils";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  result: any;
  error: string | null;
  onRerun: () => void;
}

const STAGES = [
  { id: 1, name: "Monitoring Inventory", desc: "Evaluating current stock & burn velocity across catalog" },
  { id: 2, name: "Stockout Risk Detected", desc: "Wireless Earbuds Pro: 18 units left (~1.5 days coverage)" },
  { id: 3, name: "Demand Forecasting", desc: "Predicting 30-day requirement: 360 units via weighted trend" },
  { id: 4, name: "Multi-Supplier Quote Sourcing", desc: "NovaTech (₹1,180), PrimeSource (₹1,230), Orbit (₹1,155)" },
  { id: 5, name: "Autonomous Supplier Negotiation", desc: "Multi-round counter-offers for 150 units with NovaTech" },
  { id: 6, name: "Deterministic Margin Analysis", desc: "Gross margin 44.7% verified (₹894/unit profit)" },
  { id: 7, name: "Policy Engine Verification", desc: "Thresholds checked: Satisfies >=25% margin; routed for PO" },
  { id: 8, name: "Purchase Order Generation", desc: "PO VAI-PO-2026-1048 generated for 150 units @ ₹1,105" },
  { id: 9, name: "Payment Simulation", desc: "Simulated escrow payment captured: ₹165,750" },
  { id: 10, name: "Expected Inbound Inventory Update", desc: "+150 units expected inbound; stockout risk resolved" },
  { id: 11, name: "Audit Trail & Decision Logging", desc: "Decision rationale and financial impact permanently recorded" },
];

export function AutonomousDemoModal({
  isOpen,
  onClose,
  isRunning,
  result,
  error,
  onRerun,
}: DemoModalProps) {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (isRunning) {
      setActiveStep(1);
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < STAGES.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 400);
      return () => clearInterval(interval);
    } else if (result) {
      setActiveStep(STAGES.length);
    }
  }, [isRunning, result]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-card p-6 shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Autonomous Procurement Workflow</h2>
              <p className="text-xs text-slate-500">Live multi-agent execution with deterministic controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Execution Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-slate-50/50 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Workflow Execution Stages</h3>
              <div className="space-y-2">
                {STAGES.map((stage) => {
                  const isCompleted = activeStep > stage.id || (!isRunning && result);
                  const isCurrent = activeStep === stage.id && isRunning;
                  return (
                    <div
                      key={stage.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-2 text-xs transition-all",
                        isCurrent
                          ? "bg-blue-50 border border-blue-200 text-blue-900 shadow-xs"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400 opacity-60"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{stage.name}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Live Result Overview</h3>
                {result ? (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-lg bg-blue-50/80 p-3 border border-blue-100">
                      <p className="font-semibold text-blue-900">{result.product_title}</p>
                      <p className="text-blue-700 mt-1">
                        Stockout risk mitigated with {result.reorder_quantity} units reordered via {result.selected_supplier}.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg border bg-slate-50">
                        <span className="text-slate-500 text-[11px]">Negotiated Unit Price</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="line-through text-slate-400 text-xs">{formatINR(result.initial_price)}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="font-bold text-slate-900">{formatINR(result.final_price)}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-emerald-50/60 border-emerald-100">
                        <span className="text-emerald-700 text-[11px] font-medium">Secured AI Savings</span>
                        <p className="font-bold text-emerald-800 text-sm mt-0.5">{formatINR(result.total_savings)}</p>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-slate-50">
                        <span className="text-slate-500 text-[11px]">Gross Margin</span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{result.gross_margin_pct}%</p>
                      </div>

                      <div className="p-2.5 rounded-lg border bg-slate-50">
                        <span className="text-slate-500 text-[11px]">Total PO Spend</span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(result.total_spend)}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Purchase Order:</span>
                        <span className="font-semibold text-blue-600 font-mono">{result.po_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className="font-semibold text-emerald-600">{result.payment_status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Policy Check:</span>
                        <span className="font-semibold text-slate-900">{result.policy_decision}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-xs">Agents are actively collaborating across inventory, forecast, and negotiation graphs...</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    onClick={onRerun}
                    disabled={isRunning}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Rerun Simulation
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    View in Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
