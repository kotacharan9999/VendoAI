"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogOut, CheckCircle2, Lock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

interface AccessRestrictedProps {
  currentRole: string;
  requiredRole: string;
  pageName: string;
  allowedUsage: string[];
}

export function AccessRestricted({
  currentRole,
  requiredRole,
  pageName,
  allowedUsage,
}: AccessRestrictedProps) {
  const router = useRouter();

  const handleSwitchUser = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vendo_token");
      localStorage.removeItem("vendo_user");
      window.dispatchEvent(new Event("vendo-auth-change"));
    }
    router.push("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-violet-100 text-violet-800 border-violet-200";
      case "MANAGER":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "BUYER":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-[75vh] items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-xl rounded-2xl border bg-card p-4 sm:p-8 shadow-xl text-center space-y-6">
          {/* Visual Alert Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto shadow-xs">
            <ShieldAlert className="h-9 w-9" />
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                RBAC Security Boundary
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Access Restricted: {pageName}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This module requires <strong>{requiredRole}</strong> authority. Your account is currently authenticated under a restricted permission tier.
            </p>
          </div>

          {/* Current Identity & Role Details */}
          <div className="rounded-xl border bg-slate-50 p-4 text-xs space-y-3 text-left">
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-slate-500 font-medium">Your Current Role:</span>
              <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded border ${getRoleBadgeColor(currentRole)}`}>
                {currentRole}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-slate-500 font-medium">Required Authority Level:</span>
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                {requiredRole}
              </span>
            </div>

            <div className="pt-1">
              <span className="font-semibold text-slate-700 block mb-1.5">
                Authorized Scope for {currentRole}:
              </span>
              <div className="space-y-1">
                {allowedUsage.map((usage, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{usage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg border bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Permitted Workspace</span>
            </button>
            <button
              onClick={handleSwitchUser}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Switch User / Login as {requiredRole.split(" ")[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
