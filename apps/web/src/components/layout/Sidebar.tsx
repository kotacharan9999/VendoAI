"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Package,
  Sparkles,
  Handshake,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  Bot,
  Activity,
  Bell,
  Settings,
  HeartPulse,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Products", href: "/products", icon: Package },
  { name: "AI Opportunities", href: "/opportunities", icon: Sparkles },
  { name: "Negotiations", href: "/negotiations", icon: Handshake },
  { name: "Suppliers", href: "/suppliers", icon: Building2 },
  { name: "Purchase Orders", href: "/purchase-orders", icon: FileSpreadsheet },
  { name: "Approvals", href: "/approvals", icon: CheckCircle2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Agent Control", href: "/agents", icon: Bot },
  { name: "Activity Log", href: "/activity", icon: Activity },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Data Health", href: "/data-health", icon: HeartPulse },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-card text-card-foreground shadow-sm">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow">
          V
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900">Vendo AI</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-blue-600">Procurement OS</span>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 rounded-md bg-blue-50/80 px-3 py-1.5 text-xs text-blue-700 border border-blue-100">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span className="font-semibold">Local Demo Mode</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              RV
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">Rohan Verma</span>
              <span className="text-[11px] text-slate-500 leading-tight">Buyer (Demo)</span>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Switch User / Logout"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
