"use client";

import React, { useState } from "react";
import { Truck, MapPin, Navigation, ArrowRight, ShieldCheck, Gauge, Clock } from "lucide-react";

interface HubRoute {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  freightCost: string;
  highway: string;
  status: "In Transit" | "Dispatched" | "Optimized";
  cargo: string;
}

const ROUTES: HubRoute[] = [
  {
    id: "r1",
    from: "Kurnool Central Agro-Terminal",
    to: "Tirupati Logistics Hub",
    distance: "340 km",
    duration: "6h 15m",
    freightCost: "₹14,500",
    highway: "NH-40 / NH-71",
    status: "In Transit",
    cargo: "350 Bags Kurnool Sona Masoori Rice",
  },
  {
    id: "r2",
    from: "Guntur APMC Mirchi Yard",
    to: "Kurnool Regional Warehouse",
    distance: "315 km",
    duration: "5h 45m",
    freightCost: "₹12,800",
    highway: "NH-544D",
    status: "Dispatched",
    cargo: "200 Bags Guntur Teja Stemless Chilli",
  },
  {
    id: "r3",
    from: "Dharmavaram (Anantapur)",
    to: "Kadapa Cold Chain Hub",
    distance: "190 km",
    duration: "3h 40m",
    freightCost: "₹8,200",
    highway: "NH-42",
    status: "Optimized",
    cargo: "140 Tins Kadiri Cold-Pressed Oil",
  },
  {
    id: "r4",
    from: "Sri City SEZ (Tirupati)",
    to: "Vijayawada Autonagar",
    distance: "410 km",
    duration: "7h 30m",
    freightCost: "₹16,400",
    highway: "NH-16 Coastal Corridor",
    status: "Optimized",
    cargo: "M10 Fasteners & Corrugated Outer Cartons",
  },
];

export function RegionalLogisticsMap() {
  const [selectedRoute, setSelectedRoute] = useState<HubRoute>(ROUTES[0]);

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600 shrink-0" />
            <span>Regional Freight & Logistics Corridor (NH-44 Network)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multimodal routing, transit tracking, and freight cost optimization across Andhra Pradesh.
          </p>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 border border-emerald-200 shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Multi-Drop Logistics Optimized</span>
        </div>
      </div>

      {/* Interactive Visual Map Card */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-6 text-white relative overflow-hidden shadow-inner">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 space-y-6">
          {/* Corridor Node Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/40 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold block">Dispatch Hub</span>
                <span className="text-sm font-bold text-white truncate block">{selectedRoute.from}</span>
              </div>
            </div>

            <div className="flex flex-col items-center px-2 sm:px-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Truck className="h-4 w-4 animate-bounce shrink-0" />
                <span className="text-center">{selectedRoute.distance} • {selectedRoute.highway}</span>
              </div>
              <div className="w-32 sm:w-48 h-0.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-purple-500 my-1" />
              <span className="text-[10px] text-slate-400 font-medium">Est. Transit: {selectedRoute.duration}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-400/40 shrink-0">
                <Navigation className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold block">Receiving Terminal</span>
                <span className="text-sm font-bold text-white truncate block">{selectedRoute.to}</span>
              </div>
            </div>
          </div>

          {/* Active Route Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs border-t border-slate-700/60 pt-4">
            <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
              <span className="text-[10px] text-slate-400">Consigned Freight</span>
              <p className="font-bold text-white mt-0.5 truncate">{selectedRoute.cargo}</p>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
              <span className="text-[10px] text-slate-400">Optimized Tariff</span>
              <p className="font-bold text-emerald-400 mt-0.5">{selectedRoute.freightCost}</p>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
              <span className="text-[10px] text-slate-400">AP Road Tax / Toll</span>
              <p className="font-bold text-white mt-0.5">FASTag Toll ₹640</p>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
              <span className="text-[10px] text-slate-400">Logistics Status</span>
              <p className="font-bold text-blue-400 mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping shrink-0" />
                {selectedRoute.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRoute(r)}
            className={`p-3 rounded-xl border text-left text-xs transition-all ${
              selectedRoute.id === r.id
                ? "border-blue-600 bg-blue-50/50 shadow-2xs ring-2 ring-blue-600/20"
                : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase">{r.highway}</span>
              <span className="text-[10px] font-semibold text-slate-500">{r.distance}</span>
            </div>
            <p className="font-bold text-slate-900 truncate">{r.from.split(" ")[0]} → {r.to.split(" ")[0]}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{r.cargo}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
