"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Minimize2,
  Maximize2,
  RefreshCw,
  Building,
  Package,
  FileCheck,
  Mic,
  MicOff,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
  dataCard?: {
    title: string;
    items: string[];
    badge?: string;
  };
}

export function AiProcurementBot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("ADMIN");
  const [userName, setUserName] = useState("Aarav Sharma");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadUser = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vendo_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserRole((parsed.role || "ADMIN").toUpperCase());
          setUserName(parsed.full_name || "Enterprise User");
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadUser();

    // Initial greeting
    const greetingText = `Namaste ${userName.split(" ")[0]}! I am Vendo AI Bot, your autonomous procurement copilot. I can navigate pages, analyze stock, inspect suppliers, and trigger autonomous purchasing cycles. How may I assist you?`;

    setMessages([
      {
        id: "msg-init",
        sender: "bot",
        text: greetingText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dataCard: {
          title: "Live SCM Hubs",
          items: [
            "Kurnool Central Agro-Terminal: Active",
            "Tirupati Logistics Hub: Active",
            "Kadapa YSR Cold Chain: Active",
          ],
          badge: "APMC Network Online",
        },
      },
    ]);

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener("vendo-auth-change", handleAuthChange);
    return () => window.removeEventListener("vendo-auth-change", handleAuthChange);
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userPrompt) setInput("");
    setLoading(true);

    // AI Intent Analysis & Multi-Action Engine
    const lower = textToSend.toLowerCase();

    setTimeout(async () => {
      try {
        let botResponse: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        if (lower.includes("stock") || lower.includes("inventory") || lower.includes("critical")) {
          // Query live products
          try {
            const products = await api.products.list();
            const lowStock = products.filter((p: any) => p.current_stock < (p.reorder_point || 50));
            botResponse.text = `I inspected our inventory across all warehouses. Found ${lowStock.length} items at critical reorder thresholds.`;
            botResponse.dataCard = {
              title: "Critical Stock Alert",
              items: lowStock.slice(0, 3).map((p: any) => `${p.title}: ${p.current_stock} units remaining (Reorder at ${p.reorder_point})`),
              badge: "Stockout Risk: HIGH",
            };
            botResponse.actionButton = {
              label: "Open Sourcing Opportunities",
              action: () => {
                router.push("/opportunities");
                setIsOpen(false);
              },
            };
          } catch (e) {
            botResponse.text = "Navigating to inventory overview for you.";
            botResponse.actionButton = {
              label: "View Inventory",
              action: () => {
                router.push("/inventory");
                setIsOpen(false);
              },
            };
          }
        } else if (lower.includes("approval") || lower.includes("approve") || lower.includes("manager")) {
          try {
            const approvals = await api.approvals.list();
            const pending = approvals.filter((a: any) => a.status === "PENDING");
            botResponse.text = `There are currently ${pending.length} purchase orders awaiting managerial review. Largest item: Guntur Teja Mirchi bulk contract (₹3,48,000).`;
            botResponse.actionButton = {
              label: "Go to Approval Queue",
              action: () => {
                router.push("/approvals");
                setIsOpen(false);
              },
            };
          } catch (e) {
            botResponse.text = "Opening Manager Approvals Queue.";
            botResponse.actionButton = {
              label: "Go to Approvals",
              action: () => {
                router.push("/approvals");
                setIsOpen(false);
              },
            };
          }
        } else if (lower.includes("supplier") || lower.includes("vendor") || lower.includes("kurnool") || lower.includes("kadapa") || lower.includes("guntur")) {
          botResponse.text = `We have 15 registered regional suppliers across Kurnool, Kadapa, Anantapur, Tirupati, and Guntur. Top-rated: Guntur Mirchi Yard Traders (4.8★) & Rayalaseema Agro Commodities (4.6★).`;
          botResponse.actionButton = {
            label: "Explore AP Suppliers Directory",
            action: () => {
              router.push("/suppliers");
              setIsOpen(false);
            },
          };
        } else if (lower.includes("setting") || lower.includes("config") || lower.includes("policy") || lower.includes("mandi")) {
          botResponse.text = `Opening the Enterprise Settings Suite where you can customize APMC Mandi Cess, freight tariffs, auto-approval thresholds, and AI negotiation aggressiveness.`;
          botResponse.actionButton = {
            label: "Open Enterprise Settings",
            action: () => {
              router.push("/settings");
              setIsOpen(false);
            },
          };
        } else if (lower.includes("workflow") || lower.includes("autonomous") || lower.includes("run")) {
          botResponse.text = `Initiating autonomous procurement cycle: Demand forecasting, quotation aggregation, autonomous multi-round negotiation, and policy-compliant PO generation.`;
          botResponse.actionButton = {
            label: "View AI Opportunities",
            action: () => {
              router.push("/opportunities");
              setIsOpen(false);
            },
          };
        } else if (lower.includes("po") || lower.includes("order") || lower.includes("purchase")) {
          botResponse.text = `Navigating to Purchase Orders ledger where all active and fulfilled contracts are recorded with AP GSTIN codes.`;
          botResponse.actionButton = {
            label: "View Purchase Orders",
            action: () => {
              router.push("/purchase-orders");
              setIsOpen(false);
            },
          };
        } else {
          botResponse.text = `I can navigate to any section of Vendo AI, inspect APMC mandi indices, review pending approvals, or draft supplier counter-offers. What would you like to inspect next?`;
        }

        setMessages((prev) => [...prev, botResponse]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "bot",
            text: "Encountered a temporary communication delay. Please try again.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  /* ─── Voice-to-Text (Web Speech API) ─── */
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-voice-${Date.now()}`,
          sender: "bot",
          text: "Voice commands are not supported by your browser. Please use Chrome or Edge.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after recognition
      setTimeout(() => handleSendMessage(transcript), 200);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 sm:gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 p-2.5 sm:px-4 sm:py-3 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-blue-500/20"
            aria-label="Open Vendo AI Assistant"
          >
            <div className="relative">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight flex items-center gap-1">
                Vendo AI Bot
                <Sparkles className="h-3 w-3 fill-amber-300 text-amber-300" />
              </span>
              <span className="text-[10px] text-blue-100 leading-tight">
                Procurement Copilot
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm h-[80vh] sm:h-[540px] max-h-[calc(100vh-2rem)] rounded-2xl border border-slate-200 bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-indigo-700 p-3 sm:p-4 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs font-bold">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold leading-tight">Vendo AI Assistant</h3>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-blue-100">Autonomous Procurement Copilot</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="border-b bg-slate-50/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSendMessage("Check low stock items")}
              className="rounded-full bg-white border px-2.5 py-1 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 shrink-0 shadow-2xs"
            >
              🚨 Stockouts
            </button>
            <button
              onClick={() => handleSendMessage("Show pending approvals for manager")}
              className="rounded-full bg-white border px-2.5 py-1 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 shrink-0 shadow-2xs"
            >
              📝 Approvals
            </button>
            <button
              onClick={() => handleSendMessage("List top Suppliers in Kurnool & Kadapa")}
              className="rounded-full bg-white border px-2.5 py-1 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 shrink-0 shadow-2xs"
            >
              🌾 AP Suppliers
            </button>
            <button
              onClick={() => handleSendMessage("Open SCM Settings and policies")}
              className="rounded-full bg-white border px-2.5 py-1 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 shrink-0 shadow-2xs"
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60"
                  }`}
                >
                  {m.text}

                  {m.dataCard && (
                    <div className="mt-2.5 rounded-lg border bg-white p-2.5 text-slate-700 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-[11px] text-slate-900">{m.dataCard.title}</span>
                        {m.dataCard.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            {m.dataCard.badge}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-0.5 text-[10px] text-slate-600 pt-1">
                        {m.dataCard.items.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {m.actionButton && (
                    <button
                      onClick={m.actionButton.action}
                      className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                    >
                      <span>{m.actionButton.label}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Vendo AI Bot is analyzing your query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="border-t bg-slate-50/50 p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "🎙️ Listening..." : "Ask anything or request navigation..."}
              className={`flex-1 rounded-xl border bg-white px-3 py-2 text-xs focus:outline-none focus:border-blue-500 ${isListening ? 'border-red-400 animate-pulse' : ''}`}
            />
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors shadow-xs ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isListening ? 'Stop listening' : 'Voice command'}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
