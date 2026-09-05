"use client";

import React from "react";
import { TrendingDown, TrendingUp, Sparkles, Activity } from "lucide-react";

interface TickerItem {
  commodity: string;
  mandi: string;
  spotPrice: string;
  contractPrice: string;
  savedPercent: string;
  status: "up" | "down";
}

const TICKER_DATA: TickerItem[] = [
  {
    commodity: "Kurnool Sona Masoori (25kg)",
    mandi: "Kurnool APMC",
    spotPrice: "₹1,240",
    contractPrice: "₹1,175",
    savedPercent: "+5.2% Margin Saved",
    status: "down",
  },
  {
    commodity: "Guntur Teja Stemless (10kg)",
    mandi: "Guntur Mirchi Yard",
    spotPrice: "₹1,820",
    contractPrice: "₹1,740",
    savedPercent: "+4.4% Margin Saved",
    status: "down",
  },
  {
    commodity: "Kadiri Cold-Pressed Groundnut Oil (15L)",
    mandi: "Anantapur Market",
    spotPrice: "₹2,550",
    contractPrice: "₹2,420",
    savedPercent: "+5.1% Margin Saved",
    status: "down",
  },
  {
    commodity: "Kadapa Sathgudi Citrus (20kg Crate)",
    mandi: "Kadapa Fruit APMC",
    spotPrice: "₹1,020",
    contractPrice: "₹950",
    savedPercent: "+6.8% Margin Saved",
    status: "down",
  },
  {
    commodity: "Chittoor Totapuri Puree (3.1kg Can)",
    mandi: "Chittoor Agro Hub",
    spotPrice: "₹340",
    contractPrice: "₹310",
    savedPercent: "+8.8% Margin Saved",
    status: "down",
  },
  {
    commodity: "Sri City Precision M10 Fasteners (500pk)",
    mandi: "Sri City SEZ",
    spotPrice: "₹3,450",
    contractPrice: "₹3,250",
    savedPercent: "+5.8% Margin Saved",
    status: "down",
  },
];

export function MandiTicker() {
  return (
    <div className="rounded-xl border bg-slate-900 text-white p-3 shadow-md overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Badge */}
        <div className="flex items-center gap-2 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-700/80 pb-2 sm:pb-0 sm:pr-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 leading-tight">
              Live Mandi Index
            </span>
            <span className="text-[9px] text-slate-400 leading-tight">APMC Spot vs Contract</span>
          </div>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto whitespace-nowrap text-xs py-1 scrollbar-none w-full min-w-0">
          {TICKER_DATA.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/60 text-[11px] sm:text-xs">
              <span className="font-bold text-slate-200">{item.commodity}</span>
              <span className="text-slate-400 text-[10px]">({item.mandi})</span>
              <span className="text-slate-400 line-through text-[10px] sm:text-[11px]">{item.spotPrice}</span>
              <span className="text-emerald-400 font-bold">{item.contractPrice}</span>
              <span className="flex items-center text-[9px] sm:text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                <TrendingDown className="h-3 w-3 mr-0.5" />
                {item.savedPercent}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
