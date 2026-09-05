"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ClipboardCheck,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";

type RoleId = "ADMIN" | "MANAGER" | "BUYER";

export default function LoginPage() {
  const router = useRouter();

  // Role selection
  const [selectedRole, setSelectedRole] = useState<RoleId>("ADMIN");

  // Step in the flow:
  // "ROLE" -> "QUESTION" (for Manager/Buyer only) -> "AUTH"
  const [flowStep, setFlowStep] = useState<"ROLE" | "QUESTION" | "AUTH">("ROLE");

  // Single Role Question Answer
  const [managerThreshold, setManagerThreshold] = useState("tier1");
  const [buyerZone, setBuyerZone] = useState("agro");

  // Secure Blank Credentials (Zero Pre-Filled values)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleContinue = () => {
    setError(null);
    if (selectedRole === "ADMIN") {
      // Admin skips questions entirely
      setFlowStep("AUTH");
    } else {
      // Manager & Buyer get 1 simple role-specific verification question
      setFlowStep("QUESTION");
    }
  };

  const handleQuestionContinue = () => {
    setError(null);
    setFlowStep("AUTH");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your work email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("vendo_token", res.access_token);
        localStorage.setItem(
          "vendo_user",
          JSON.stringify({
            ...res,
            manager_threshold: managerThreshold,
            buyer_zone: buyerZone,
          })
        );
        window.dispatchEvent(new Event("vendo-auth-change"));
      }

      // Role-specific intelligent redirection
      const activeRole = (res.role || selectedRole).toUpperCase();
      if (activeRole === "ADMIN") {
        router.push("/dashboard");
      } else if (activeRole === "MANAGER") {
        router.push("/approvals");
      } else {
        router.push("/opportunities");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/60 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-xs">
              V
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Vendo AI</h1>
              <p className="text-xs text-slate-500">Autonomous Procurement System</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
            Secure Access
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {flowStep === "ROLE" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Select your Workspace Role
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your organization role to proceed to authentication.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Admin Card */}
              <div
                onClick={() => setSelectedRole("ADMIN")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                  selectedRole === "ADMIN"
                    ? "border-violet-600 bg-violet-50/50 shadow-xs ring-2 ring-violet-600/20"
                    : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-2xs">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Administrator (Admin)</span>
                    <span className="text-[11px] text-slate-500">Full system authority (Direct Sign In)</span>
                  </div>
                </div>
                {selectedRole === "ADMIN" && <CheckCircle2 className="h-5 w-5 text-violet-600" />}
              </div>

              {/* Manager Card */}
              <div
                onClick={() => setSelectedRole("MANAGER")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                  selectedRole === "MANAGER"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20"
                    : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Procurement Manager</span>
                    <span className="text-[11px] text-slate-500">Approvals, oversight & supplier sign-off</span>
                  </div>
                </div>
                {selectedRole === "MANAGER" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              </div>

              {/* Buyer Card */}
              <div
                onClick={() => setSelectedRole("BUYER")}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                  selectedRole === "BUYER"
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Sourcing Specialist (Buyer)</span>
                    <span className="text-[11px] text-slate-500">Catalog sourcing, inventory & PO drafting</span>
                  </div>
                </div>
                {selectedRole === "BUYER" && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleRoleContinue}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
              >
                <span>{selectedRole === "ADMIN" ? "Proceed to Sign In" : "Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ROLE-SPECIFIC VERIFICATION QUESTION (FOR MANAGER OR BUYER) */}
        {flowStep === "QUESTION" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {selectedRole === "MANAGER" ? (
              <>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    Manager Verification
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    What is your purchase order sign-off authorization tier?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sets your active approval ceiling for incoming purchase orders.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setManagerThreshold("tier1")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                      managerThreshold === "tier1"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Tier 1: Standard Management (Up to ₹5,00,000)</span>
                      <span className="text-[11px] text-slate-500">Direct sign-off on regional commodity contracts</span>
                    </div>
                    {managerThreshold === "tier1" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>

                  <div
                    onClick={() => setManagerThreshold("tier2")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                      managerThreshold === "tier2"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Tier 2: Executive (Unrestricted Regional Sign-Off)</span>
                      <span className="text-[11px] text-slate-500">Authorizes multi-lot bulk grain & industrial procurement</span>
                    </div>
                    {managerThreshold === "tier2" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Buyer Verification
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    Which procurement warehouse zone are you operating?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Loads your primary inventory catalog and supplier reorder triggers.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setBuyerZone("agro")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                      buyerZone === "agro"
                        ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-600/20"
                        : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Central Agricultural & APMC Mandi Hub</span>
                      <span className="text-[11px] text-slate-500">Paddy, Rice, Chilli, Groundnut Oil & Produce</span>
                    </div>
                    {buyerZone === "agro" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                  </div>

                  <div
                    onClick={() => setBuyerZone("industrial")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-center justify-between ${
                      buyerZone === "industrial"
                        ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-600/20"
                        : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Industrial SEZ & Hardware Logistics Zone</span>
                      <span className="text-[11px] text-slate-500">Automotive fasteners, precision parts & packaging</span>
                    </div>
                    {buyerZone === "industrial" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setFlowStep("ROLE")}
                className="flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleQuestionContinue}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SECURE SIGN IN (ZERO PRE-FILLED INPUTS) */}
        {flowStep === "AUTH" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    selectedRole === "ADMIN"
                      ? "bg-violet-100 text-violet-800 border-violet-200"
                      : selectedRole === "MANAGER"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  {selectedRole} Workspace
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Enter Account Credentials</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in with your enterprise credentials to access Vendo AI.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block">Work Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vendo.ai"
                  required
                  autoFocus
                  className="mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block">Account Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setFlowStep(selectedRole === "ADMIN" ? "ROLE" : "QUESTION")}
                  className="flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize & Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
