"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Image,
  TrendingUp,
  ShoppingBag,
  Palette,
  MessageCircle,
  Languages,
  Target,
  Zap,
  ArrowRight,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  PenLine,
  Lightbulb,
  BarChart3,
} from "lucide-react";

const quickActions = [
  { icon: PenLine, label: "Write product description", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { icon: Palette, label: "Create landing page", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { icon: TrendingUp, label: "Improve my conversion", color: "bg-green-50 text-green-600 border-green-100" },
  { icon: Image, label: "Generate ad creatives", color: "bg-pink-50 text-pink-600 border-pink-100" },
  { icon: MessageCircle, label: "WhatsApp broadcast", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { icon: Languages, label: "Translate my store", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { icon: Zap, label: "Create a plugin", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { icon: BarChart3, label: "Analyze my sales", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];

const examplePrompts = [
  "Make my homepage look more premium and luxurious",
  "Rewrite this hero section for Nigerian fashion buyers",
  "Create a Valentine promo landing page with countdown",
  "Generate a plugin that charges delivery by Lagos area",
  "Improve my checkout conversion rate",
  "Create product descriptions from uploaded images",
  "Create a WhatsApp broadcast for abandoned carts",
  "Generate 5 Instagram ad creatives for my best seller",
  "Translate this store to Pidgin English",
  "Create a one-product store from this product image",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const sampleConversation: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Can you write a compelling product description for my Ankara Maxi Dress? It's a handmade Nigerian fashion piece, priced at ₦15,000.",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "2",
    role: "assistant",
    content: `Here's a compelling product description for your Ankara Maxi Dress:

**Ankara Maxi Dress — Bold African Elegance**

Turn heads at every occasion with this stunning handcrafted Ankara maxi dress. Made from premium 100% cotton Ankara fabric, each piece features vibrant, authentic African prints that celebrate our rich heritage.

**Why You'll Love It:**
- Handcrafted by skilled local artisans
- Premium breathable cotton — perfect for our warm weather
- Flattering A-line silhouette suits every body type
- Versatile — from owambe to Sunday brunch to date night
- Each print is unique — no two dresses are exactly alike

**Details:**
- Available in sizes S, M, L, XL
- Care: Hand wash cold, hang dry
- Ships within 2-3 business days across Nigeria

**₦15,000** — Free delivery on orders above ₦50,000

I've optimized this for:
- Mobile readability (short paragraphs)
- Emotional appeal + practical details
- Local cultural references ("owambe")
- Trust signals (handcrafted, premium)
- Clear CTA with delivery incentive

Want me to create variations for Instagram, WhatsApp catalog, or a different tone?`,
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(sampleConversation);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm working on that for you! In a production environment, this would connect to the AI backend to generate a real response based on your store data, products, and analytics.",
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  };

  return (
    <>
      <DashboardHeader title="AI Assistant" subtitle="Your commerce co-founder" />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-500/25">
                  <Bot className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-surface-900 font-display mb-2">
                  Hi! I&apos;m your Commerce Co-Founder
                </h2>
                <p className="text-surface-500 mb-8 max-w-md">
                  I can write product descriptions, create landing pages, improve conversions, generate plugins, and help grow your business.
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => setInput(action.label)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium text-center leading-tight">
                          {action.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Messages */
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-brand-600 text-white rounded-br-md"
                        : "bg-surface-50 border border-surface-200 text-surface-700 rounded-bl-md"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200">
                        <button className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg text-surface-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      AO
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Example prompts */}
          {messages.length > 0 && (
            <div className="px-6 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Lightbulb className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
                {examplePrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="flex-shrink-0 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-[10px] font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-surface-100 bg-white p-4">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything about your store..."
                  className="w-full bg-transparent text-sm placeholder:text-surface-400 focus:outline-none resize-none min-h-[20px] max-h-[120px]"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </div>
            <p className="text-center text-[10px] text-surface-400 mt-2">
              AI can make mistakes. Review important outputs before using.
            </p>
          </div>
        </div>

        {/* Right Sidebar - Capabilities */}
        <div className="hidden xl:flex w-72 border-l border-surface-100 bg-white flex-col p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-surface-900 mb-4">What I can do</h3>
          <div className="space-y-2">
            {[
              { icon: PenLine, label: "Product Descriptions", desc: "Generate compelling copy from images or text" },
              { icon: Palette, label: "Page Design", desc: "Create and improve landing pages and store pages" },
              { icon: TrendingUp, label: "Conversion Audit", desc: "Analyze your store and suggest improvements" },
              { icon: Image, label: "Ad Creatives", desc: "Generate ad images and copy for social media" },
              { icon: MessageCircle, label: "WhatsApp Marketing", desc: "Create broadcasts and recovery messages" },
              { icon: Languages, label: "Translation", desc: "Translate your store to local languages" },
              { icon: Zap, label: "Plugin Builder", desc: "Describe functionality, I build the plugin" },
              { icon: Target, label: "SEO Optimization", desc: "Optimize pages for search engines" },
              { icon: FileText, label: "Policy Generator", desc: "Create privacy, refund, and shipping policies" },
              { icon: BarChart3, label: "Sales Analysis", desc: "Understand your data and trends" },
            ].map((cap) => {
              const Icon = cap.icon;
              return (
                <button
                  key={cap.label}
                  onClick={() => setInput(cap.label)}
                  className="w-full flex items-start gap-3 rounded-xl p-3 text-left hover:bg-surface-50 transition-colors"
                >
                  <Icon className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-surface-900">{cap.label}</div>
                    <div className="text-[10px] text-surface-500 leading-relaxed">{cap.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
