"use client";

import React, { useState } from "react";
import { Play, Sparkles, Bell, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { AutonomousDemoModal } from "@/components/demo/AutonomousDemoModal";

export function Header() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunDemo = async () => {
    setIsDemoModalOpen(true);
    setIsRunning(true);
    setError(null);
    try {
      const result = await api.demo.run();
      setDemoResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to execute autonomous demo.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Acme Retail India</span>
            <span>/</span>
            <span className="text-slate-600">Autonomous Procurement Center</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRunDemo}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Autonomous Demo...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 fill-white/20" />
                <span>Run Autonomous Demo</span>
              </>
            )}
          </button>
        </div>
      </header>

      <AutonomousDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        isRunning={isRunning}
        result={demoResult}
        error={error}
        onRerun={handleRunDemo}
      />
    </>
  );
}
