"use client";

import React, { useEffect, useState } from "react";
import { Settings, ShieldCheck, Save, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

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
    fetchSettings();
  }, []);

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
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Procurement Policy & Rules</h1>
            <p className="text-sm text-slate-500 mt-1">
              Deterministic threshold limits, approval boundaries, and multi-agent configuration.
            </p>
          </div>
          {savedMsg && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Settings Saved Successfully
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
              Margin & Financial Boundaries
            </h2>

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
                <label className="font-semibold text-slate-700">Automatic Approval Limit (₹)</label>
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

          <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
              Supplier Risk & Negotiation Engine
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Minimum Supplier Rating (out of 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settingsData.minimum_supplier_rating}
                  onChange={(e) => setSettingsData({ ...settingsData, minimum_supplier_rating: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Maximum Allowable Vendor Risk (0-100)</label>
                <input
                  type="number"
                  value={settingsData.maximum_supplier_risk}
                  onChange={(e) => setSettingsData({ ...settingsData, maximum_supplier_risk: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Maximum Negotiation Rounds</label>
                <input
                  type="number"
                  value={settingsData.max_negotiation_rounds}
                  onChange={(e) => setSettingsData({ ...settingsData, max_negotiation_rounds: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Minimum Required Competitive Quotes</label>
                <input
                  type="number"
                  value={settingsData.minimum_quotes}
                  onChange={(e) => setSettingsData({ ...settingsData, minimum_quotes: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Changes..." : "Save Policy Rules"}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
