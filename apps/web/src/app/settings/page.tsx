"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Bot,
  Lock,
  Bell,
  Sliders,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AccessRestricted } from "@/components/auth/AccessRestricted";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<"FINANCIAL" | "REGIONAL" | "AGENTS" | "SECURITY" | "DISPATCH">("REGIONAL");
  const [userRole, setUserRole] = useState<string>("ADMIN");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.settings.get();
      setSettingsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vendo_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserRole((parsed.role || "ADMIN").toUpperCase());
        }
      } catch (e) {}
    }
    fetchSettings();
  }, []);

  if (userRole === "BUYER") {
    return (
      <AccessRestricted
        currentRole="BUYER"
        requiredRole="Manager or Administrator"
        pageName="Procurement Policy & Enterprise Customization"
        allowedUsage={[
          "Sourcing agricultural commodities and industrial goods",
          "Monitoring warehouse inventory levels & reorder alerts",
          "Negotiating quotes with registered regional suppliers",
          "Generating draft purchase orders for review",
        ]}
      />
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    try {
      await api.settings.update(settingsData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settingsData) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
              <span>Procurement Policy & Enterprise Customization</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure deterministic thresholds, regional logistics, multi-agent AI parameters, and security policies.
            </p>
          </div>
          {savedMsg && (
            <div className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
              Settings Saved Successfully
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-1 pb-px scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("REGIONAL")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "REGIONAL"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Regional SCM & Logistics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FINANCIAL")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "FINANCIAL"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Financial & Threshold Limits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AGENTS")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "AGENTS"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Autonomous AI Agent Policy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SECURITY")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "SECURITY"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Security & RBAC Controls</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DISPATCH")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "DISPATCH"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Local Mandi & Dispatch Alerts</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: REGIONAL SCM & LOGISTICS */}
          {activeTab === "REGIONAL" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Regional Multi-District SCM Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure default aggregation points, state tax codes, and regional APMC cess percentages.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Primary Operating Regional Hub</label>
                    <select
                      value={settingsData.regional_default_hub || "Kurnool Central Agro-Terminal (NH-44)"}
                      onChange={(e) => setSettingsData({ ...settingsData, regional_default_hub: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Kurnool Central Agro-Terminal (NH-44)">Kurnool Central Agro-Terminal (NH-44)</option>
                      <option value="Tirupati Logistics & Renigunta Cargo Hub">Tirupati Logistics & Renigunta Cargo Hub</option>
                      <option value="Kadapa YSR Cold Storage Center">Kadapa YSR Cold Storage Center</option>
                      <option value="Anantapur Industrial Distribution Center">Anantapur Industrial Distribution Center</option>
                      <option value="Guntur Spices & APMC Market Corridor">Guntur Spices & APMC Market Corridor</option>
                      <option value="Sri City SEZ Logistics Terminal">Sri City SEZ Logistics Terminal</option>
                    </select>
                    <span className="text-[11px] text-slate-400">Primary warehouse for auto-reorder freight routing.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Andhra Pradesh State GSTIN Code</label>
                    <input
                      type="text"
                      value={settingsData.ap_gstin_code || "37"}
                      onChange={(e) => setSettingsData({ ...settingsData, ap_gstin_code: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Standard AP GST prefix (Code 37 for intra-state billing).</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">APMC Mandi Cess / Market Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingsData.apmc_mandi_cess_percent || 1.0}
                      onChange={(e) => setSettingsData({ ...settingsData, apmc_mandi_cess_percent: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Statutory agricultural market committee cess applied on grain/spice lots.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Regional Road Freight Tariff (₹ per Ton-Km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingsData.local_freight_tariff_per_ton_km || 4.5}
                      onChange={(e) => setSettingsData({ ...settingsData, local_freight_tariff_per_ton_km: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Calculated for Kurnool, Kadapa, and Tirupati logistics links.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL & MARGIN BOUNDARIES */}
          {activeTab === "FINANCIAL" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h2 className="text-sm font-bold text-slate-900">Margin & Spending Boundaries</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hard limits and auto-approval thresholds enforced by the deterministic policy engine.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Minimum Acceptable Margin (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsData.minimum_margin}
                      onChange={(e) => setSettingsData({ ...settingsData, minimum_margin: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Transactions below this are hard-blocked by Policy Engine.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Target Gross Margin (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsData.target_margin}
                      onChange={(e) => setSettingsData({ ...settingsData, target_margin: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Target negotiated outcome anchor.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Buyer Single-PO Auto-Approval Limit (₹)</label>
                    <input
                      type="number"
                      value={settingsData.auto_approval_limit}
                      onChange={(e) => setSettingsData({ ...settingsData, auto_approval_limit: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Orders exceeding this require human managerial sign-off.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Monthly Procurement Budget (₹)</label>
                    <input
                      type="number"
                      value={settingsData.monthly_budget}
                      onChange={(e) => setSettingsData({ ...settingsData, monthly_budget: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Maximum monthly organization spend ceiling.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTONOMOUS AI AGENTS */}
          {activeTab === "AGENTS" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span>Autonomous AI Negotiation & Procurement Agent Parameters</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tune how Vendo AI negotiates with local suppliers and issues orders autonomously.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Negotiation Strategy Stance</label>
                    <select
                      value={settingsData.negotiation_aggressiveness || "BALANCED"}
                      onChange={(e) => setSettingsData({ ...settingsData, negotiation_aggressiveness: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="CONSERVATIVE">Conservative (Maintain Supplier Relationship & High Reliability)</option>
                      <option value="BALANCED">Balanced (Standard Margin Optimization & Volume Discounts)</option>
                      <option value="AGGRESSIVE">Aggressive (Hard APMC Index Anchor & Maximum Cost Reduction)</option>
                    </select>
                    <span className="text-[11px] text-slate-400">Controls counter-offer spread during rounds.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Maximum Negotiation Rounds</label>
                    <input
                      type="number"
                      value={settingsData.max_negotiation_rounds || 4}
                      onChange={(e) => setSettingsData({ ...settingsData, max_negotiation_rounds: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">After reaching max rounds, agent accepts best supplier counter or triggers escalation.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Minimum Required Competitive Quotes</label>
                    <input
                      type="number"
                      value={settingsData.minimum_quotes || 2}
                      onChange={(e) => setSettingsData({ ...settingsData, minimum_quotes: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400">Agent must gather this many supplier quotes before finalizing opportunity.</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border mt-2">
                    <div>
                      <p className="font-bold text-slate-900">Auto Purchase-Order Issuance</p>
                      <p className="text-[11px] text-slate-500">Allow autonomous generation of signed POs if under ₹50,000 threshold.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settingsData.auto_purchase_enabled}
                      onChange={(e) => setSettingsData({ ...settingsData, auto_purchase_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & RBAC CONTROLS */}
          {activeTab === "SECURITY" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-violet-600" />
                    <span>Security & Multi-Factor Verification Question Policies</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure pre-login security challenges and enterprise role-based access rules.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">Enforce Security Question Before Login</p>
                      <p className="text-[11px] text-slate-500">
                        Requires all users (Admin, Manager, Buyer) to verify their operating regional hub and mandi access code.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsData.enable_security_verification !== false}
                      onChange={(e) => setSettingsData({ ...settingsData, enable_security_verification: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-50 text-slate-600 space-y-2">
                    <p className="font-bold text-slate-900">Active Role Separation Policy</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li><strong>Admin:</strong> Unrestricted access across all 14 procurement modules.</li>
                      <li><strong>Manager:</strong> Responsible for PO approval authorizations, negotiation sign-offs, and analytics.</li>
                      <li><strong>Buyer:</strong> Manages APMC catalog, inventory levels, supplier negotiations, and PO drafting (no self-approval).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOCAL MANDI & DISPATCH ALERTS */}
          {activeTab === "DISPATCH" && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-600" />
                    <span>Regional Mandi & Supplier Notification Channels</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure direct automated dispatch to local Rayalaseema & AP agro-suppliers.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">WhatsApp Dispatch to Local Mandi Suppliers</p>
                      <p className="text-[11px] text-slate-500">
                        Automatically send PO PDF copies & negotiation counter-offers via WhatsApp Business to verified AP vendors.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsData.whatsapp_supplier_dispatch !== false}
                      onChange={(e) => setSettingsData({ ...settingsData, whatsapp_supplier_dispatch: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900">Email PO Dispatch with GST e-Invoicing</p>
                      <p className="text-[11px] text-slate-500">
                        Include automated AP GSTIN (37) tax invoice and APMC gate pass with issued orders.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsData.email_po_dispatch !== false}
                      onChange={(e) => setSettingsData({ ...settingsData, email_po_dispatch: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-2 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Enterprise Policy..." : "Save Custom Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
