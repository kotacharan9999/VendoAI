"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Package,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SupplierFormData {
  id?: string;
  name: string;
  location: string;
  payment_terms: string;
  negotiation_style: string;
  lead_time_days: string;
  min_order_qty: string;
  rating: string;
  reliability_score: string;
  delivery_score: string;
  quality_score: string;
  risk_score: string;
}

const NEGOTIATION_STYLES = [
  "Reliable Supplier",
  "Competitive Bidder",
  "Flexible Partner",
  "Premium Vendor",
  "Budget Supplier",
  "Strategic Partner",
];

const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "Advance Payment", "COD", "Letter of Credit"];

const DEFAULT_FORM: SupplierFormData = {
  name: "",
  location: "Bengaluru, India",
  payment_terms: "Net 30",
  negotiation_style: "Reliable Supplier",
  lead_time_days: "7",
  min_order_qty: "50",
  rating: "4.0",
  reliability_score: "85",
  delivery_score: "85",
  quality_score: "85",
  risk_score: "20",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>(DEFAULT_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.suppliers.list();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData(DEFAULT_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setIsEditMode(true);
    setFormData({
      id: s.id,
      name: s.name || "",
      location: s.location || "",
      payment_terms: s.payment_terms || "Net 30",
      negotiation_style: s.negotiation_style || "Reliable Supplier",
      lead_time_days: String(s.lead_time_days ?? 7),
      min_order_qty: String(s.min_order_qty ?? 50),
      rating: String(s.rating ?? "4.0"),
      reliability_score: String(s.reliability_score ?? "85"),
      delivery_score: String(s.delivery_score ?? "85"),
      quality_score: String(s.quality_score ?? "85"),
      risk_score: String(s.risk_score ?? "20"),
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Supplier name is required.");
      return;
    }
    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      payment_terms: formData.payment_terms,
      negotiation_style: formData.negotiation_style,
      lead_time_days: parseInt(formData.lead_time_days) || 7,
      min_order_qty: parseInt(formData.min_order_qty) || 50,
      rating: parseFloat(formData.rating) || 4.0,
      reliability_score: parseFloat(formData.reliability_score) || 85,
      delivery_score: parseFloat(formData.delivery_score) || 85,
      quality_score: parseFloat(formData.quality_score) || 85,
      risk_score: parseFloat(formData.risk_score) || 20,
    };

    try {
      if (isEditMode && formData.id) {
        await api.suppliers.update(formData.id, payload);
        showToast(`Supplier "${formData.name}" updated successfully!`);
      } else {
        await api.suppliers.create(payload);
        showToast(`Supplier "${formData.name}" added to network!`);
      }
      setIsFormOpen(false);
      await fetchSuppliers();
    } catch (err: any) {
      setFormError(err.message || "Failed to save supplier.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await api.suppliers.delete(deleteTarget.id);
      showToast(`Supplier "${deleteTarget.name}" deactivated.`);
      setDeleteTarget(null);
      await fetchSuppliers();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to deactivate supplier.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const ScoreBar = ({ value, max = 100, color = "blue" }: { value: number; max?: number; color?: string }) => (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div
        className={cn("h-1.5 rounded-full transition-all", {
          "bg-emerald-500": color === "green",
          "bg-blue-500": color === "blue",
          "bg-amber-500": color === "amber",
          "bg-red-500": color === "red",
        })}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xl flex items-center gap-2 animate-in fade-in-50 slide-in-from-top-2 max-w-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Supplier Network & Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Multi-factor vendor scoring across cost, reliability, delivery, quality, and terms.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchSuppliers}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Supplier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading supplier network...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed p-12 text-center bg-white space-y-3">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No suppliers in your network</h3>
              <p className="text-xs text-slate-500">Add your first vendor to start managing the supply chain.</p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add First Supplier
              </button>
            </div>
          ) : (
            suppliers.map((s) => (
              <div
                key={s.id}
                className="group rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {s.negotiation_style}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(s); setDeleteError(null); }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Deactivate Supplier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{s.name}</h3>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {s.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.lead_time_days}d lead
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn("h-3.5 w-3.5", i <= Math.round(parseFloat(s.rating)) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")}
                      />
                    ))}
                    <span className="text-xs text-slate-500 ml-1 font-semibold">{parseFloat(s.rating).toFixed(1)}</span>
                  </div>

                  {/* Score bars */}
                  <div className="mt-4 space-y-2 text-[11px]">
                    {[
                      { label: "Reliability", value: parseFloat(s.reliability_score), color: "green" },
                      { label: "Delivery", value: parseFloat(s.delivery_score), color: "blue" },
                      { label: "Quality", value: parseFloat(s.quality_score), color: "amber" },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>{m.label}</span>
                          <span className="font-bold">{m.value.toFixed(0)}%</span>
                        </div>
                        <ScoreBar value={m.value} color={m.color} />
                      </div>
                    ))}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] font-semibold">
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
                      {s.payment_terms}
                    </span>
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
                      MOQ: {s.min_order_qty}
                    </span>
                    {s.procurement_score && (
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5" />
                        Score: {parseFloat(s.procurement_score).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 pt-3 border-t">
                  <Link
                    href={`/suppliers/${s.id}`}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>View Intelligence Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  {isEditMode ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isEditMode ? "Edit Supplier" : "Add New Supplier"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {isEditMode ? "Update vendor profile and scoring parameters." : "Register a new vendor into the supply chain network."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Krishna Valley Agro Traders"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Location & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Vijayawada, AP"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {PAYMENT_TERMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Negotiation Style */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Negotiation Style</label>
                <select
                  value={formData.negotiation_style}
                  onChange={(e) => setFormData({ ...formData, negotiation_style: e.target.value })}
                  className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  {NEGOTIATION_STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Lead Time & MOQ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lead Time (days)</label>
                  <input
                    type="number" min="1"
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Order Qty</label>
                  <input
                    type="number" min="1"
                    value={formData.min_order_qty}
                    onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Scoring Panel */}
              <div className="rounded-xl border bg-slate-50/70 p-3.5 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Vendor Scoring Parameters (0–100)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "reliability_score", label: "Reliability Score" },
                    { key: "delivery_score", label: "Delivery Score" },
                    { key: "quality_score", label: "Quality Score" },
                    { key: "risk_score", label: "Risk Score (lower = better)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="font-semibold text-slate-700 block mb-1">{label}</label>
                      <input
                        type="number" min="0" max="100" step="0.1"
                        value={(formData as any)[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Star Rating (1–5)</label>
                  <input
                    type="number" min="1" max="5" step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isEditMode ? "Save Changes" : "Add Supplier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deactivate Supplier</h3>
                <span className="text-xs text-red-600 font-semibold">This will remove them from active network</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate <strong>{deleteTarget.name}</strong>? Their historical data will be preserved but they will no longer appear in active procurement.
            </p>

            {deleteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                className="rounded-xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {deleteSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
