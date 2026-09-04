"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@vendo.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("vendo_token", res.access_token);
        localStorage.setItem("vendo_user", JSON.stringify(res));
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    setLoading(true);
    api.auth.login({ email: roleEmail, password: "password123" }).then((res) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("vendo_token", res.access_token);
        localStorage.setItem("vendo_user", JSON.stringify(res));
      }
      router.push("/dashboard");
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg mb-3">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendo AI</h1>
          <p className="text-xs text-slate-500 mt-1">Autonomous Procurement Intelligence Platform</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In to Vendo AI</span>}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2">
            One-Click Demo Roles
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin("demo@vendo.ai")}
              className="rounded-lg border bg-slate-50 p-2 text-center text-xs hover:bg-slate-100 transition-colors"
            >
              <p className="font-bold text-slate-900">Buyer</p>
              <p className="text-[10px] text-slate-500">Rohan Verma</p>
            </button>
            <button
              onClick={() => handleQuickLogin("manager@vendo.ai")}
              className="rounded-lg border bg-slate-50 p-2 text-center text-xs hover:bg-slate-100 transition-colors"
            >
              <p className="font-bold text-slate-900">Manager</p>
              <p className="text-[10px] text-slate-500">Priya Patel</p>
            </button>
            <button
              onClick={() => handleQuickLogin("admin@vendo.ai")}
              className="rounded-lg border bg-slate-50 p-2 text-center text-xs hover:bg-slate-100 transition-colors"
            >
              <p className="font-bold text-slate-900">Admin</p>
              <p className="text-[10px] text-slate-500">Aarav Sharma</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
