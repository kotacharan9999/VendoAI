"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

interface ProductFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  sku: string;
  selling_price: string;
  cost_price: string;
  current_stock: string;
  reorder_point: string;
}

const DEFAULT_CATEGORIES = [
  "Grains & Pulses",
  "Spices & Condiments",
  "Edible Oils",
  "Fresh Produce",
  "Packaging Materials",
  "Industrial Fasteners",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category: "Grains & Pulses",
    sku: "",
    selling_price: "",
    cost_price: "",
    current_stock: "50",
    reorder_point: "15",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Modal States
  const [deleteProductTarget, setDeleteProductTarget] = useState<any | null>(null);
  const [deleteForce, setDeleteForce] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.list();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute categories
  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (search) {
      const title = p.title.toLowerCase();
      const sku = p.sku.toLowerCase();
      return title.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
    }
    return true;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData({
      title: "",
      description: "",
      category: "Grains & Pulses",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      selling_price: "",
      cost_price: "",
      current_stock: "50",
      reorder_point: "15",
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: any) => {
    setIsEditMode(true);
    setFormData({
      id: p.id,
      title: p.title || "",
      description: p.description || "",
      category: p.category || "Grains & Pulses",
      sku: p.sku || "",
      selling_price: p.selling_price ? String(p.selling_price) : "",
      cost_price: p.cost_price ? String(p.cost_price) : "",
      current_stock: p.current_stock !== undefined ? String(p.current_stock) : "0",
      reorder_point: p.reorder_point !== undefined ? String(p.reorder_point) : "10",
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Live Gross Margin calculation in modal
  const sellingNum = parseFloat(formData.selling_price) || 0;
  const costNum = parseFloat(formData.cost_price) || 0;
  const profitPerUnit = sellingNum - costNum;
  const marginPercentage = sellingNum > 0 ? ((profitPerUnit / sellingNum) * 100).toFixed(1) : "0.0";

  // Handle Save (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.sku.trim()) {
      setFormError("Title and SKU are required.");
      return;
    }
    if (isNaN(sellingNum) || isNaN(costNum) || sellingNum <= 0 || costNum <= 0) {
      setFormError("Please enter valid positive selling and cost prices.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      if (isEditMode && formData.id) {
        await api.products.update(formData.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          sku: formData.sku.trim(),
          selling_price: sellingNum,
          cost_price: costNum,
          current_stock: parseInt(formData.current_stock) || 0,
          reorder_point: parseInt(formData.reorder_point) || 10,
        });
        showToast(`Product "${formData.title}" successfully updated!`);
      } else {
        await api.products.create({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          sku: formData.sku.trim(),
          selling_price: sellingNum,
          cost_price: costNum,
          currency: "INR",
          initial_stock: parseInt(formData.current_stock) || 0,
          reorder_point: parseInt(formData.reorder_point) || 10,
        });
        showToast(`Product "${formData.title}" added to catalog!`);
      }
      setIsFormModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await api.products.delete(deleteProductTarget.id, deleteForce);
      showToast(`Product "${deleteProductTarget.title}" deleted.`);
      setDeleteProductTarget(null);
      setDeleteForce(false);
      await fetchProducts();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete product.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xl flex items-center gap-2 animate-in fade-in-50 slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <span>Product Catalog Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Master catalog items, margins, inventory allocations, and autonomous procurement mappings.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
              title="Refresh catalog"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Add Product Button */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white border text-slate-600 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-xs text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
              Loading catalog products...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed p-12 text-center bg-white space-y-3">
              <Package className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No products matching your search</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or click below to create a new product.</p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add First Product
              </button>
            </div>
          ) : (
            filtered.map((p) => {
              const grossProfit = p.selling_price - p.cost_price;
              const marginPct = ((grossProfit / p.selling_price) * 100).toFixed(1);
              const isLowStock = p.stockout_risk_level === "CRITICAL" || p.current_stock < 15;

              return (
                <div
                  key={p.id}
                  className="group rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div>
                    {/* Top Tags & Action Buttons */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {p.sku}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setDeleteProductTarget(p);
                            setDeleteForce(false);
                            setDeleteError(null);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{p.title}</h3>
                    </div>

                    <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">
                      {p.category}
                    </span>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {p.description || "No description specified for this catalog item."}
                    </p>

                    {/* Financial & Inventory Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t text-xs bg-slate-50/50 -mx-5 -mb-2 p-4">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Selling Price</span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(p.selling_price)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Cost Price</span>
                        <p className="font-semibold text-slate-700 text-sm mt-0.5">{formatINR(p.cost_price)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Gross Margin</span>
                        <p className={cn(
                          "font-bold text-sm mt-0.5",
                          parseFloat(marginPct) >= 20 ? "text-emerald-600" : parseFloat(marginPct) >= 10 ? "text-amber-600" : "text-red-600"
                        )}>
                          {marginPct}%
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Stock Status</span>
                        <p className={cn(
                          "font-bold text-sm mt-0.5 flex items-center gap-1",
                          isLowStock ? "text-amber-600" : "text-slate-800"
                        )}>
                          {p.current_stock ?? 0} units
                          {isLowStock && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 pt-3 border-t">
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <span>Inspect Intelligence</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE & EDIT PRODUCT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  {isEditMode ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isEditMode ? "Edit Catalog Product" : "Create New Catalog Product"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {isEditMode
                      ? "Update product pricing, category, and inventory parameters."
                      : "Register an internal or regional commodity SKU into the SCM network."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
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

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-3 text-xs">
                {/* Product Title */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kurnool Sona Masoori Rice (25kg Bag)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* SKU and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SKU Identifier <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="e.g. KNL-RICE-25KG"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none uppercase"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}` })
                        }
                        className="rounded-xl border bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100 shrink-0"
                        title="Generate random SKU"
                      >
                        Gen
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Margin Calculator Card */}
                <div className="rounded-xl border bg-slate-50/70 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Calculator className="h-3.5 w-3.5 text-blue-600" />
                      Pricing & Autonomous Margin Calculator
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded border",
                      parseFloat(marginPercentage) >= 20
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : parseFloat(marginPercentage) > 0
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    )}>
                      {marginPercentage}% Margin
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="1250"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Cost Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="1100"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                        className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  {sellingNum > 0 && costNum > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <span>Gross Profit per Unit:</span>
                      <strong className={cn(profitPerUnit >= 0 ? "text-emerald-700 font-mono font-bold" : "text-red-700")}>
                        {formatINR(profitPerUnit)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Inventory Stock & Reorder Point */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {isEditMode ? "Current Stock Units" : "Initial Stock Units"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                      className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Reorder Alert Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.reorder_point}
                      onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                      className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catalog Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide procurement specifications, grain grade, packaging specs..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
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
                  <span>{isEditMode ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Product from Catalog</h3>
                <span className="text-xs text-red-600 font-semibold">Irreversible Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteProductTarget.title}</strong> (
              <span className="font-mono font-semibold">{deleteProductTarget.sku}</span>)? This will remove its inventory
              record and procurement history.
            </p>

            {deleteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-2">
                <p className="font-semibold">{deleteError}</p>
                <label className="flex items-center gap-2 cursor-pointer pt-1 font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={deleteForce}
                    onChange={(e) => setDeleteForce(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Force delete linked purchase order item references</span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setDeleteProductTarget(null);
                  setDeleteForce(false);
                  setDeleteError(null);
                }}
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
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

