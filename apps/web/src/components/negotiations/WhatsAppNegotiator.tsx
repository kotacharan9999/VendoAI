"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  Sliders,
  CheckCheck,
  Building2,
  Sparkles,
  Bot,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface ChatBubble {
  id: string;
  sender: "supplier" | "bot";
  text: string;
  time: string;
  priceTag?: string;
}

export function WhatsAppNegotiator() {
  const [aggressiveness, setAggressiveness] = useState<number>(50); // 0 = Conservative, 50 = Balanced, 100 = Aggressive
  const [activeVendor, setActiveVendor] = useState<string>("rayalaseema");

  // Dynamic counter offer calculation based on slider
  const baseTarget = activeVendor === "rayalaseema" ? 1150 : 1700;
  const currentOffer = baseTarget + Math.round(((100 - aggressiveness) / 100) * 45);

  const getStanceLabel = () => {
    if (aggressiveness < 35) return { label: "Conservative (Relationship Focus)", color: "text-blue-600 bg-blue-50" };
    if (aggressiveness < 75) return { label: "Balanced (Target Margin 28%)", color: "text-emerald-700 bg-emerald-50" };
    return { label: "Aggressive (Maximum Mandi Discount)", color: "text-amber-700 bg-amber-50" };
  };

  const stance = getStanceLabel();

  const messages: ChatBubble[] = activeVendor === "rayalaseema"
    ? [
        {
          id: "1",
          sender: "bot",
          text: "Namaste Srikanth garu. Vendo AI Autonomous Procurement dispatching requirement for Kurnool Sona Masoori (25kg x 350 bags) for immediate warehouse arrival.",
          time: "10:14 AM",
        },
        {
          id: "2",
          sender: "supplier",
          text: "Namaste! Current Kurnool APMC mandi spot is ₹1,240/bag due to transport arrival delays. Best quote from Tungabhadra Mills is ₹1,210/bag with loading included.",
          time: "10:15 AM",
          priceTag: "₹1,210 / bag",
        },
        {
          id: "3",
          sender: "bot",
          text: `Based on current regional freight parity, our AI agent offers ${formatINR(currentOffer)}/bag backed by automated Net-15 escrow settlement and guaranteed repeat monthly allocation.`,
          time: "10:16 AM",
          priceTag: `${formatINR(currentOffer)} / bag`,
        },
        {
          id: "4",
          sender: "supplier",
          text: `We can confirm agreement at ${formatINR(currentOffer)}/bag if 350 bags are dispatched directly to Kurnool NH-44 Hub under AP GST Code 37. Ready for PO issuance.`,
          time: "10:17 AM",
          priceTag: "Deal Agreed ✓",
        },
      ]
    : [
        {
          id: "1",
          sender: "bot",
          text: "Greetings from Vendo AI Procurement Hub. Requesting quote for 200 bags of Guntur Teja Stemless Red Chilli (10kg export grade).",
          time: "09:30 AM",
        },
        {
          id: "2",
          sender: "supplier",
          text: "Guntur Mirchi Yard index today is ₹1,850. Best wholesale rate we can provide is ₹1,790/bag with moisture cert under 10%.",
          time: "09:32 AM",
          priceTag: "₹1,790 / bag",
        },
        {
          id: "3",
          sender: "bot",
          text: `Our AI policy engine counters at ${formatINR(currentOffer)}/bag with immediate digital PO generation and verified gate pass.`,
          time: "09:34 AM",
          priceTag: `${formatINR(currentOffer)} / bag`,
        },
      ];

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Live Supplier WhatsApp & Negotiation Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time interactive simulation of AI autonomous counter-offers with verified regional AP vendors.
          </p>
        </div>

        {/* Vendor Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveVendor("rayalaseema")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
              activeVendor === "rayalaseema"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Rayalaseema Agro (Kurnool)
          </button>
          <button
            onClick={() => setActiveVendor("guntur")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
              activeVendor === "guntur"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Guntur Mirchi Yard Traders
          </button>
        </div>
      </div>

      {/* Interactive AI Aggressiveness Slider */}
      <div className="rounded-xl border bg-slate-50/80 p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Sliders className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-bold text-slate-800">AI Negotiation Aggressiveness:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${stance.color}`}>
              {stance.label}
            </span>
          </div>
          <span className="font-bold text-slate-900 self-start sm:self-auto">
            Active Counter: <strong className="text-emerald-700">{formatINR(currentOffer)}</strong>
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={aggressiveness}
          onChange={(e) => setAggressiveness(parseInt(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>0% (Conservative / Vendor Relationship)</span>
          <span>50% (Balanced SCM Margin)</span>
          <span>100% (Aggressive / APMC Minimum)</span>
        </div>
      </div>

      {/* Simulated WhatsApp Phone Frame */}
      <div className="rounded-xl border border-slate-300 bg-[#EFEAE2] p-4 shadow-inner space-y-3 font-sans max-h-[380px] overflow-y-auto">
        <div className="text-center">
          <span className="rounded-md bg-white/80 px-2.5 py-0.5 text-[10px] text-slate-500 font-medium shadow-2xs">
            MESSAGES ARE END-TO-END ENCRYPTED & AUDITED UNDER AP APMC ACT
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "bot" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs shadow-xs space-y-1.5 ${
                msg.sender === "bot"
                  ? "bg-[#D9FDD3] text-slate-900 rounded-tr-none"
                  : "bg-white text-slate-900 rounded-tl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1 text-[10px] text-slate-500 font-semibold">
                <span>{msg.sender === "bot" ? "🤖 Vendo AI Autonomous Negotiator" : "🏢 Verified Mandi Vendor"}</span>
                {msg.priceTag && (
                  <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                    {msg.priceTag}
                  </span>
                )}
              </div>
              <p className="leading-relaxed">{msg.text}</p>
              <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                <span>{msg.time}</span>
                {msg.sender === "bot" && <CheckCheck className="h-3 w-3 text-blue-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
