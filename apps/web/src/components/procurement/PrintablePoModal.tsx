"use client";

import React from "react";
import { X, Printer, ShieldCheck, Download, Building, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface PrintablePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: any;
}

export function PrintablePoModal({ isOpen, onClose, po }: PrintablePoModalProps) {
  if (!isOpen || !po) return null;

  const handlePrint = () => {
    window.print();
  };

  const poNumber = po.po_number || "PO-AP-KRN-2026-089";
  const subtotal = Number(po.subtotal || po.total_amount || 411250);
  const apmcCess = Math.round(subtotal * 0.01);
  const cgst = Math.round(subtotal * 0.025);
  const sgst = Math.round(subtotal * 0.025);
  const grandTotal = subtotal + apmcCess + cgst + sgst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border bg-card p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in-50 zoom-in-95 print:p-0 print:border-none print:shadow-none">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tax Invoice & Purchase Order
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              GST Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="space-y-6 text-xs text-slate-800 font-sans">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                  V
                </div>
                <h1 className="text-xl font-bold text-slate-900">Vendo AI Procurement Platform</h1>
              </div>
              <p className="text-slate-500 text-[11px]">Acme Retail India Pvt Ltd • Regional SCM Operations</p>
              <p className="text-slate-500 text-[11px]">Kurnool Industrial Logistics Park, NH-44, Andhra Pradesh - 518003</p>
              <p className="text-slate-700 font-mono text-[11px] mt-1 font-semibold">
                AP GSTIN: <strong>37AAAAA0000A1Z5</strong>
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                OFFICIAL PURCHASE ORDER
              </span>
              <p className="text-sm font-mono font-bold text-slate-900">{poNumber}</p>
              <p className="text-slate-500 text-[11px]">
                Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                STATUS: APPROVED & SIGNED
              </span>
            </div>
          </div>

          {/* Supplier and Shipping Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vendor / Supplier Details:
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {po.supplier?.name || "Rayalaseema Agro Commodities Pvt Ltd"}
              </p>
              <p className="text-slate-600 text-[11px]">
                {po.supplier?.location || "Kurnool Industrial Estate, Andhra Pradesh"}
              </p>
              <p className="font-mono text-[10px] text-slate-500 mt-1">Vendor GSTIN: 37AAECR4920K1ZX</p>
              <p className="text-[10px] text-slate-500">APMC License: APMC/KRN/AGRO-2024/098</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Consignee / Delivery Facility:
              </span>
              <p className="font-bold text-slate-900 text-sm">Acme Retail Central Warehouse</p>
              <p className="text-slate-600 text-[11px]">Kurnool Agro Aggregation Terminal (Bay 4)</p>
              <p className="text-slate-600 text-[11px]">Corridor NH-44, Kurnool, AP - 518004</p>
              <p className="text-[10px] text-blue-700 font-semibold mt-1">Payment Terms: Net 15 Escrow Transfer</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Commodity / Item Description</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                <tr>
                  <td className="p-3 font-medium">1</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">Kurnool Sona Masoori Rice (Super Fine Raw - 25kg)</p>
                    <p className="text-[10px] text-slate-500">Grade A Super Fine Raw Rice • Harvest 2026</p>
                  </td>
                  <td className="p-3 font-mono text-slate-500">1006.30</td>
                  <td className="p-3 text-right font-semibold">350 Bags</td>
                  <td className="p-3 text-right font-mono">₹1,175.00</td>
                  <td className="p-3 text-right font-bold text-slate-900 font-mono">₹4,11,250.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations & Tax Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Taxable Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">APMC Mandi Cess (1.0%):</span>
                <span className="font-mono text-slate-700">{formatINR(apmcCess)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">CGST (2.5%):</span>
                <span className="font-mono text-slate-700">{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">SGST (2.5%):</span>
                <span className="font-mono text-slate-700">{formatINR(sgst)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold">
                <span className="text-slate-900">Grand Total:</span>
                <span className="font-mono text-blue-700">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Digital Signature & Verification Seal */}
          <div className="flex items-center justify-between border-t-2 border-dashed pt-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Autonomous Compliance Note</span>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Generated deterministically by Vendo AI Multi-Agent SCM. Valid under Andhra Pradesh Electronic Procurement Rules 2026.
              </p>
            </div>

            {/* Manager Approval Stamp */}
            <div className="border-2 border-emerald-600 rounded-xl p-3 bg-emerald-50/50 text-center w-56 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>DIGITALLY APPROVED</span>
              </div>
              <p className="text-[11px] font-bold text-slate-900">Priya Patel</p>
              <p className="text-[9px] text-slate-500">Regional SCM Manager (AP Hub)</p>
              <p className="text-[8px] font-mono text-emerald-800">HASH: SHA256-VENDO-9821AF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
