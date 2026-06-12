"use client";

import { useState, useRef, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { Bot, Send, Sparkles, Loader2, User, AlertCircle, RefreshCw, Zap } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
  ragSources?: number;
}

interface AIChatResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  ragContext?: {
    sourcesUsed: number;
    documentTypes: string[];
  };
}

const suggestions = [
  "What should I improve on my store today?",
  "Generate product descriptions for my items",
  "Create a Valentine promo landing page",
  "How can I increase my checkout conversion?",
  "Write a WhatsApp broadcast for my customers",
  "Help me set up delivery zones for Lagos",
  "Why are my visitors not buying?",
  "Create a flash sale announcement",
];

export default function AIPage() {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentStore || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      // Build conversation history from existing messages
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post<AIChatResponse>(
        `/api/stores/${currentStore.id}/ai`,
        {
          message: text.trim(),
          conversationHistory,
        }
      );

      if (res.success && res.data) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.data.content,
          timestamp: new Date(),
          provider: res.data.provider,
          model: res.data.model,
          ragSources: res.data.ragContext?.sourcesUsed,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Handle specific error cases
        const errMsg = res.error || "Something went wrong";

        if (errMsg.includes("not configured") || errMsg.includes("API key")) {
          setError("AI is not configured yet. Ask your admin to set up an AI provider (OpenAI, Anthropic, Google, Groq, or DeepSeek).");
        } else if (errMsg.includes("unavailable")) {
          setError("AI service is temporarily unavailable. Please try again in a moment.");
        } else {
          setError(errMsg);
        }

        // Add error as a visible assistant message so the user sees it in context
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${errMsg}\n\nPlease try again or rephrase your question.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      setError("Network error — couldn't reach the AI service.");
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Couldn't connect to the AI service. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <>
      <DashboardHeader
        title="AI Assistant"
        subtitle="Your commerce co-founder"
        action={
          messages.length > 0
            ? { label: "New Chat", onClick: clearChat }
            : undefined
        }
      />
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Error banner */}
        {error && !error.includes("not configured") && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-500/25">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-2">
                Hi {user?.firstName}! I&apos;m your AI commerce co-founder.
              </h2>
              <p className="text-sm text-surface-500 mb-8">
                I can help with product descriptions, marketing copy, store optimization,
                analytics insights, and more. Ask me anything about{" "}
                <strong>{currentStore?.name || "your store"}</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left rounded-xl border border-surface-200 bg-white p-3 text-xs text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-brand-500 inline mr-1.5" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 text-surface-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (msg.provider || msg.ragSources) && (
                      <div className="mt-2 pt-2 border-t border-surface-200/50 flex items-center gap-3 text-[10px] text-surface-400">
                        {msg.provider && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" />
                            {msg.provider}/{msg.model}
                          </span>
                        )}
                        {msg.ragSources !== undefined && msg.ragSources > 0 && (
                          <span>{msg.ragSources} store data sources used</span>
                        )}
                      </div>
                    )}
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
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
                      <span className="text-xs text-surface-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-surface-100 p-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-3 max-w-3xl mx-auto"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your store..."
              className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              disabled={loading}
              maxLength={5000}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
