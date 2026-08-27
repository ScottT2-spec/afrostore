"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HelpCircle, Mail, Search } from "@/components/icons/FilledIcons";

import { useMemo, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Getting Started",
    question: "How do I add my first product?",
    answer: "Go to Products in the sidebar, then click \"Add Product.\" You'll need a name, price, and at least one photo before you can publish it. Stock quantity and a description are optional but recommended.",
  },
  {
    category: "Getting Started",
    question: "How do I set my store's currency?",
    answer: "Open your store from Dashboard \u2192 Sites, then go to Customize \u2192 Store settings, where you can set the currency your prices and checkout will use. This only affects that store — each store you run can use a different currency.",
  },
  {
    category: "Payments",
    question: "Which payment methods can I accept?",
    answer: "Paystack, Monnify, and Flutterwave for card/bank transfer/USSD payments, plus Pay on Delivery if you'd rather collect cash or transfer in person. Configure these under Payments in the sidebar.",
  },
  {
    category: "Payments",
    question: "Why hasn't a customer's payment shown up yet?",
    answer: "Card and transfer payments are usually confirmed within a minute via the payment provider's webhook. If it's been longer, check Orders for the order's payment status — if it still shows pending after several minutes, the provider may not have delivered the webhook yet, and the payment can be re-verified from the order detail view.",
  },
  {
    category: "Orders & Returns",
    question: "How do customers request a return or refund?",
    answer: "Customers can request one from the order-tracking page on your storefront (found via the \"Track Order\" link in your store's nav or footer), or from My Account if they created one. It shows up in your Returns page, where you review it and move it through Approved \u2192 Received \u2192 Refunded.",
  },
  {
    category: "Orders & Returns",
    question: "Does approving a return automatically refund the customer?",
    answer: "No — approving or marking a return as refunded updates its status and records the amount in your dashboard, but it doesn't move money on its own. You'll still need to issue the refund through your payment provider (Paystack, Monnify, or Flutterwave) directly.",
  },
  {
    category: "Delivery",
    question: "How do I set up delivery zones and fees?",
    answer: "Go to Delivery in the sidebar to create zones (e.g. by city or region), each with its own fee and optional free-delivery threshold. Customers pick their zone at checkout and the fee is added automatically.",
  },
  {
    category: "Store & Domains",
    question: "Can I use my own domain instead of the default one?",
    answer: "Yes — go to Domains in the sidebar to connect a custom domain you already own. You'll point its DNS to the address shown there; it can take a little while to propagate after you save it.",
  },
  {
    category: "Store & Domains",
    question: "Can I run more than one store?",
    answer: "Yes — each store you create has its own products, orders, currency, and settings. Switch between them from the store switcher at the top of the sidebar.",
  },
  {
    category: "Team & Access",
    question: "How do I give a staff member access to my dashboard?",
    answer: "Go to Team in the sidebar and send an invite by email. You can assign what they're allowed to manage from there.",
  },
];

const CATEGORIES = Array.from(new Set(FAQS.map((f) => f.category)));

export default function SupportPage() {
  const { user } = useAuth();
  const { currentStore } = useSite();
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [filtered]);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Support request${currentStore ? ` — ${currentStore.name}` : ""}`);
    const bodyLines = [
      "Describe your issue here:",
      "",
      "",
      "---",
      user?.email ? `Account: ${user.email}` : "",
      currentStore ? `Store: ${currentStore.name} (${currentStore.slug})` : "",
    ].filter(Boolean);
    return `mailto:support@prokip.app?subject=${subject}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }, [user, currentStore]);

  return (
    <>
      <DashboardHeader title="Help & Support" subtitle="Search common questions or reach us directly" />
      <div className="p-6 space-y-8 max-w-3xl">
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <Search className="h-5 w-5 text-surface-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenIndex(null); }}
            placeholder="Search help articles..."
            className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
          />
        </div>

        <a
          href={mailtoHref}
          className="flex items-center gap-4 rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md hover:border-brand-300 transition-all group"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">Email Support</h3>
            <p className="text-xs text-surface-500">support@prokip.app — opens pre-filled with your account details</p>
          </div>
        </a>

        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-10 w-10 text-surface-300 mx-auto mb-3" />
              <p className="text-sm text-surface-500">No articles match &ldquo;{query}&rdquo;.</p>
              <p className="text-xs text-surface-400 mt-1">Try a different search, or email us directly above.</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 px-1">{category}</h2>
                <div className="rounded-2xl border border-surface-200 bg-white divide-y divide-surface-100 overflow-hidden">
                  {items.map((item) => {
                    const globalIndex = FAQS.indexOf(item);
                    const isOpen = openIndex === globalIndex;
                    return (
                      <div key={item.question}>
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-surface-900">{item.question}</span>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-surface-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-surface-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-sm text-surface-600 leading-relaxed">{item.answer}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
