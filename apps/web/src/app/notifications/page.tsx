"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, CheckCircle2, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications & Alerts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time procurement alerts, managerial approvals, and stockout warnings.
            </p>
          </div>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="divide-y text-xs">
            {loading ? (
              <p className="py-6 text-center text-slate-400">Loading alerts...</p>
            ) : notifications.length === 0 ? (
              <p className="py-6 text-center text-slate-400">No active notifications.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={cn("py-4 flex items-start justify-between gap-4", !n.is_read && "bg-blue-50/40 -mx-5 px-5 rounded-lg")}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {n.type === "STOCKOUT_RISK" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Bell className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                        {!n.is_read && (
                          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="rounded bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                      >
                        Action <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="rounded border bg-white px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
