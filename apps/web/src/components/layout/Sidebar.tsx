"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  full_name?: string;
  role?: string;
  email?: string;
  organization_id?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "BUYER"] },
  { name: "Approvals", href: "/approvals", icon: CheckCircle2, roles: ["ADMIN", "MANAGER"], badge: "Active" },
  { name: "AI Opportunities", href: "/opportunities", icon: Sparkles, roles: ["ADMIN", "MANAGER", "BUYER"] },
  { name: "Negotiations", href: "/negotiations", icon: Handshake, roles: ["ADMIN", "MANAGER", "BUYER"] },
  { name: "Purchase Orders", href: "/purchase-orders", icon: FileSpreadsheet, roles: ["ADMIN", "MANAGER", "BUYER"] },
  { name: "Inventory", href: "/inventory", icon: Boxes, roles: ["ADMIN", "BUYER"] },
  { name: "Products", href: "/products", icon: Package, roles: ["ADMIN", "BUYER"] },
  { name: "Suppliers", href: "/suppliers", icon: Building2, roles: ["ADMIN", "MANAGER", "BUYER"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { name: "Agent Control", href: "/agents", icon: Bot, roles: ["ADMIN"] },
  { name: "Activity Log", href: "/activity", icon: Activity, roles: ["ADMIN", "MANAGER"] },
  { name: "Notifications", href: "/notifications", icon: Bell, roles: ["ADMIN", "MANAGER", "BUYER"] },
  { name: "Data Health", href: "/data-health", icon: HeartPulse, roles: ["ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "MANAGER"] },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    full_name: "Aarav Sharma",
    role: "ADMIN",
    email: "admin@vendo.ai",
  });

  const loadUserFromStorage = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vendo_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUser({
            full_name: parsed.full_name || "Aarav Sharma",
            role: (parsed.role || "ADMIN").toUpperCase(),
            email: parsed.email || "admin@vendo.ai",
            organization_id: parsed.organization_id,
          });
        }
      } catch (e) {
        console.error("Failed to parse vendo_user from localStorage", e);
      }
    }
  };

  useEffect(() => {
    loadUserFromStorage();

    const handleAuthChange = () => {
      loadUserFromStorage();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("vendo-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("vendo-auth-change", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vendo_token");
      localStorage.removeItem("vendo_user");
      window.dispatchEvent(new Event("vendo-auth-change"));
    }
    router.push("/login");
  };

  // Compute Initials
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userRole = (currentUser.role || "BUYER").toUpperCase();

  // Role visual identity
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          avatarBg: "bg-violet-600 text-white",
          badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
          label: "Admin",
          sublabel: "Full Access",
        };
      case "MANAGER":
        return {
          avatarBg: "bg-emerald-600 text-white",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Manager",
          sublabel: "Approvals & Oversight",
        };
      case "BUYER":
      default:
        return {
          avatarBg: "bg-blue-600 text-white",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Buyer",
          sublabel: "Procurement & SCM",
        };
    }
  };

  const roleStyle = getRoleBadge(userRole);

  // Filter navigation items by role
  const visibleNavigation = allNavigation.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Drawer Backdrop Scrim */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card text-card-foreground shadow-2xl lg:shadow-sm transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900">Vendo AI</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                Autonomous SCM
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Autonomous System Status Banner */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-xs text-slate-700 border border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Autonomous Engine</span>
            </div>
            <span className="text-[10px] font-bold uppercase rounded px-1.5 py-0.5 bg-emerald-100 text-emerald-800">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {userRole} Workspace
          </div>
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && userRole === "MANAGER" && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      {/* Dynamic User Profile Footer (Fixing Hardcoded Rohan Verma) */}
      <div className="border-t p-4 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs", roleStyle.avatarBg)}>
              {getInitials(currentUser.full_name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                {currentUser.full_name || "Enterprise User"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border", roleStyle.badgeBg)}>
                  {roleStyle.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Switch User / Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  </>
);
}
