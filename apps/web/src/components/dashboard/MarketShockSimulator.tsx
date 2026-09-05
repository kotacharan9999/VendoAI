"use client";

import React, { useState } from "react";
import { Zap, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface ShockScenario {
  id: string;
  title: string;
  description: string;
  impact: string;
  affectedItem: string;
  aiAction: string;
  hedgedSavings: string;
}

const SHOCK_SCENARIOS: ShockScenario[] = [
  {
    id: "monsoon",
    title: "🌧️ Unseasonal Monsoon in Kurnool Basin",
    description: "Heavy rains delay paddy harvesting by 10 days, causing mandi arrivals to drop by 35%.",
    impact: "Spot Grain Index spikes +14% (₹1,240 → ₹1,410 / bag)",
    affectedItem: "Kurnool Sona Masoori Rice",
    aiAction: "Automatically hedged 350 bags at pre-surge contract ₹1,175 with Tungabhadra Mills and activated buffer safety stock in Tirupati Hub.",
    hedgedSavings: "₹82,250 Margin Protected",
  },
  {
    id: "fuel",
    title: "⛽ Interstate Freight & Toll Surge (+15%)",
    description: "Diesel hike across NH-44 increases regional road freight tariff from ₹4.50 to ₹5.20 per ton-km.",
    impact: "Freight overhead increases by ₹2,800 per transit run",
    affectedItem: "Multi-Hub Road Dispatch (Kurnool ↔ Kadapa)",
    aiAction: "Re-routed multi-drop logistics via regional consolidated rail freight through Renigunta Logistics Hub.",
    hedgedSavings: "₹18,400 Logistics Saved",
  },
  {
    id: "export",
    title: "🌶️ Export Demand Spike in Guntur Yard",
    description: "Middle-East export quota causes sudden stemless red chilli market shortage.",
    impact: "Spot wholesale rate jumps from ₹1,820 to ₹2,150 / bag",
    affectedItem: "Guntur Teja Red Chilli (10kg)",
    aiAction: "Invoked preferred vendor contract lock with Guntur Mirchi Yard Consortium, freezing wholesale rate at ₹1,740 for 60 days.",
    hedgedSavings: "₹82,000 Purchase Hedged",
  },
];

export function MarketShockSimulator() {
  const [activeShock, setActiveShock] = useState<ShockScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTriggerShock = (scenario: ShockScenario) => {
    setIsSimulating(true);
    setActiveShock(null);
    setTimeout(() => {
      setActiveShock(scenario);
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500 shrink-0" />
            <span>Autonomous Supply Chain Resilience Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how Vendo AI autonomous agents detect regional shocks and hedge inventory margins in real time.
          </p>
        </div>
        <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
          Stress Test Engine
        </span>
      </div>

      {/* Scenario Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SHOCK_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleTriggerShock(scenario)}
            disabled={isSimulating}
            className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
              activeShock?.id === scenario.id
                ? "border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20"
                : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
            }`}
          >
            <span className="font-bold text-slate-900 block">{scenario.title}</span>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{scenario.description}</p>
            <span className="inline-block text-[10px] font-bold text-amber-700 mt-2 bg-amber-100/60 px-2 py-0.5 rounded">
              Run Simulation →
            </span>
          </button>
        ))}
      </div>

      {/* Simulation Result Box */}
      {isSimulating && (
        <div className="rounded-xl border bg-slate-50 p-6 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-600 mx-auto" />
          <p className="text-xs font-bold text-slate-900">Simulating Market Shock & AI Multi-Agent Reaction...</p>
          <p className="text-[11px] text-slate-500">Recalculating safety stocks and negotiating with secondary suppliers.</p>
        </div>
      )}

      {activeShock && !isSimulating && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="font-bold text-xs text-slate-900 truncate">Autonomous Resilience Response: {activeShock.title}</span>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-600 text-white shadow-2xs shrink-0">
              {activeShock.hedgedSavings}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Market Impact:</span>
              <p className="text-slate-800 font-semibold text-[11px] mt-0.5">{activeShock.impact}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Agent Action:</span>
              <p className="text-emerald-900 font-medium text-[11px] mt-0.5">{activeShock.aiAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
