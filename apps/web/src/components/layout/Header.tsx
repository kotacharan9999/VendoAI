"use client";

import React, { useState } from "react";
import { Play, Sparkles, Bell, CheckCircle2, Loader2, AlertCircle, Menu } from "lucide-react";
import { api } from "@/lib/api";
import { AutonomousWorkflowModal } from "@/components/workflow/AutonomousWorkflowModal";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunWorkflow = async () => {
    setIsWorkflowModalOpen(true);
    setIsRunning(true);
    setError(null);
    try {
      const result = await api.workflow.run();
      setWorkflowResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to execute autonomous procurement.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/95 px-3 sm:px-6 lg:px-8 backdrop-blur supports-[backdrop-filter]:bg-card/60 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Hamburger toggle for Mobile & Tablets (< lg) */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Vendo AI Mobile Brand Logo */}
          <div className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow shrink-0">
            V
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0 truncate">
            <span className="font-semibold text-slate-900 truncate">Acme Retail</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline text-slate-600 truncate">Autonomous Procurement</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span className="hidden sm:inline">Running Autonomous Procurement...</span>
                <span className="sm:hidden">Running...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 fill-white/20 shrink-0" />
                <span className="hidden md:inline">Run Autonomous Procurement</span>
                <span className="md:hidden">Run SCM</span>
              </>
            )}
          </button>
        </div>
      </header>

      <AutonomousWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        isRunning={isRunning}
        result={workflowResult}
        error={error}
        onRerun={handleRunWorkflow}
      />
    </>
  );
}
