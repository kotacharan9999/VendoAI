"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, ArrowRight, CheckCircle2, Clock, RefreshCw, CreditCard, Printer } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PrintablePoModal } from "@/components/procurement/PrintablePoModal";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrintPo, setSelectedPrintPo] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.purchaseOrders.list();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Purchase Orders Registry</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Executed procurement orders, fulfillment dates, and payment settlement records.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Expected Delivery</th>
                  <th className="px-4 py-3">Order Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No purchase orders recorded yet. Initiate an autonomous procurement cycle to generate.
                    </td>
                  </tr>
                ) : (
                  orders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-blue-600 font-mono">{po.po_number}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">{po.supplier?.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {po.items?.length > 0 ? `${po.items[0].quantity}x ${po.items[0].product?.title || "Item"}` : "1 item"}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{formatINR(po.total_amount)}</td>
                      <td className="px-4 py-3.5 text-slate-500">{po.expected_delivery_date || "7 days"}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                          <CreditCard className="h-3 w-3" /> {po.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPrintPo(po)}
                          className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 border border-blue-200"
                          title="Print Official GSTIN PO"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Official PO</span>
                        </button>
                        <Link
                          href={`/purchase-orders/${po.id}`}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          View PO <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable PO Modal */}
        <PrintablePoModal
          isOpen={!!selectedPrintPo}
          onClose={() => setSelectedPrintPo(null)}
          po={selectedPrintPo}
        />
      </div>
    </AppShell>
  );
}
