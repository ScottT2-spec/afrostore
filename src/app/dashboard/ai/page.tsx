"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { Bot, Send, Sparkles, Loader2, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  "What should I improve on my store?",
  "Generate product descriptions for my items",
  "Create a Valentine promo landing page",
  "How can I increase my checkout conversion?",
  "Write a WhatsApp broadcast for my customers",
  "Help me set up delivery zones for Lagos",
];

export default function AIPage() {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "??";

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // For now, provide helpful canned responses - will be connected to real AI later
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Thanks for your question about "${text.slice(0, 50)}..."!\n\nThe AI commerce co-founder is being set up. Soon I'll be able to help you with product descriptions, marketing copy, store optimization, and more.\n\nIn the meantime, here's what you can do:\n• Add products in the Products tab\n• Set up payment gateways in Payments\n• Configure delivery zones in Settings\n• Share your store: ${currentStore?.subdomain || "your-store"}.afrostore.com`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <DashboardHeader title="AI Assistant" subtitle="Your commerce co-founder" />
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-500/25">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-2">Hi {user?.firstName}! I&apos;m your AI assistant.</h2>
              <p className="text-sm text-surface-500 mb-8">Ask me anything about your store — products, marketing, analytics, or optimization.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="text-left rounded-xl border border-surface-200 bg-white p-3 text-xs text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors">
                    <Sparkles className="h-3.5 w-3.5 text-brand-500 inline mr-1.5" />{s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-brand-600 text-white" : "bg-surface-100 text-surface-800"}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {initials}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-surface-100 rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-surface-100 p-4 bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-3 max-w-3xl mx-auto"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your store..."
              className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
