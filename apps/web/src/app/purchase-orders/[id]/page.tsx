"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, CheckCircle2, Building2, CreditCard, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatINR, cn } from "@/lib/utils";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.purchaseOrders.get(id).then((data) => {
        setPo(data);
        setLoading(false);
      }).catch(console.error);
    }
  }, [id]);

  if (loading || !po) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            href="/purchase-orders"
            className="rounded-lg border bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-mono">
              Purchase Order — {po.po_number}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued to: {po.supplier?.name} | Created: {new Date(po.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-xs text-slate-400">Order Status:</span>
              <p className="text-base font-bold text-emerald-600">{po.status}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Payment Status:</span>
              <p className="text-base font-bold text-blue-600">{po.payment_status}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Line Items</h3>
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Item Description</th>
                  <th className="px-4 py-2.5 text-center">Quantity</th>
                  <th className="px-4 py-2.5 text-right">Negotiated Unit Price</th>
                  <th className="px-4 py-2.5 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {po.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.product?.title || "Item"}</td>
                    <td className="px-4 py-3 text-center">{item.quantity} units</td>
                    <td className="px-4 py-3 text-right">{formatINR(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatINR(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatINR(po.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freight & Shipping:</span>
                <span className="font-semibold text-emerald-600">₹0 (Included)</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold">
                <span className="text-slate-900">Total Amount:</span>
                <span className="text-blue-600">{formatINR(po.total_amount)}</span>
              </div>
            </div>
          </div>

          {po.payments?.length > 0 && (
            <div className="rounded-xl border bg-slate-50 p-4 text-xs space-y-2">
              <span className="font-bold text-slate-700">Payment Clearance & Transaction</span>
              <div className="flex justify-between text-slate-600">
                <span>Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{po.payments[0].transaction_id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Settlement Method:</span>
                <span>{po.payments[0].payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Clearing Provider:</span>
                <span>{po.payments[0].provider}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
