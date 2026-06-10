"use client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { CheckCircle2, ArrowRight, Star, Crown, Zap } from "lucide-react";

const plans = [
  { name: "Free", price: "₦0", period: "forever", current: false, features: ["1 store", "5 products", "Free subdomain"] },
  { name: "Starter", price: "₦5,000", period: "/month", current: true, features: ["Custom domain", "50 products", "All payments", "WhatsApp ordering"] },
  { name: "Business", price: "₦15,000", period: "/month", current: false, features: ["3 stores", "Unlimited products", "Abandoned cart", "AI descriptions"] },
  { name: "Growth", price: "₦35,000", period: "/month", current: false, features: ["10 stores", "AI full suite", "A/B testing", "API access"] },
];

export default function BillingPage() {
  return (
    <>
      <DashboardHeader title="Billing" subtitle="Manage your subscription and invoices" />
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/30 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-bold text-surface-900">Starter Plan</h3></div>
            <p className="text-sm text-surface-500 mt-1">₦5,000/month — Next billing: Feb 15, 2025</p>
          </div>
          <button className="btn-primary text-sm"><Crown className="h-4 w-4" />Upgrade</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-5 ${p.current ? "border-brand-500 bg-white ring-1 ring-brand-500" : "border-surface-200 bg-white"}`}>
              {p.current && <span className="text-[10px] font-bold text-brand-600 uppercase mb-2 block">Current Plan</span>}
              <h4 className="text-lg font-bold text-surface-900">{p.name}</h4>
              <div className="mt-2 mb-4"><span className="text-2xl font-extrabold font-display text-surface-900">{p.price}</span><span className="text-xs text-surface-500">{p.period}</span></div>
              <div className="space-y-2">
                {p.features.map((f) => (<div key={f} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-brand-500" /><span className="text-surface-600">{f}</span></div>))}
              </div>
              {!p.current && <button className="btn-secondary w-full mt-4 text-xs">{p.name === "Free" ? "Downgrade" : "Upgrade"}<ArrowRight className="h-3.5 w-3.5" /></button>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
