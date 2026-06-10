"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { CheckCircle2, AlertCircle, CreditCard, Building2, Smartphone, ArrowRight, ExternalLink, Shield } from "lucide-react";

const gateways = [
  {
    name: "Monnify",
    description: "Bank transfers, cards, USSD, virtual accounts, same-day settlement",
    status: "connected",
    logo: "M",
    gradient: "from-blue-600 to-blue-700",
    features: ["Bank Transfer", "Cards", "USSD", "Virtual Accounts"],
    transactions: "₦1.2M",
    info: "Best for Nigerian bank transfers and USSD payments. Supports same-day settlement.",
  },
  {
    name: "Paystack",
    description: "Cards, bank transfer, mobile money — trusted by 200,000+ businesses",
    status: "connected",
    logo: "P",
    gradient: "from-cyan-500 to-blue-500",
    features: ["Cards", "Bank Transfer", "Mobile Money", "Apple Pay"],
    transactions: "₦890K",
    info: "Widely used across Africa. Excellent for card payments and mobile money.",
  },
  {
    name: "Flutterwave",
    description: "Pan-African and international payments — cards, mobile money, bank",
    status: "not_connected",
    logo: "F",
    gradient: "from-orange-400 to-amber-500",
    features: ["Cards", "Mobile Money", "Bank", "International"],
    transactions: "—",
    info: "Best for broader African coverage and international payments.",
  },
];

const paymentOptions = [
  { name: "Pay on Delivery", description: "Allow customers to pay when order is delivered", enabled: true, icon: Building2 },
  { name: "Manual Bank Transfer", description: "Display bank details for manual transfer", enabled: true, icon: CreditCard },
  { name: "USSD Payments", description: "Accept USSD payments via supported gateways", enabled: true, icon: Smartphone },
];

export default function PaymentsPage() {
  return (
    <>
      <DashboardHeader title="Payments" subtitle="Manage your payment gateways and options" />
      <div className="p-6 space-y-6">
        {/* Gateways */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-surface-900">Payment Gateways</h3>
          {gateways.map((gw) => (
            <div key={gw.name} className={`rounded-2xl border bg-white p-6 ${gw.status === "connected" ? "border-brand-200" : "border-surface-200"}`}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gw.gradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>{gw.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-bold text-surface-900">{gw.name}</h4>
                    {gw.status === "connected" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[10px] font-semibold text-green-700"><CheckCircle2 className="h-3 w-3" />Connected</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-50 border border-surface-200 px-2.5 py-0.5 text-[10px] font-semibold text-surface-500"><AlertCircle className="h-3 w-3" />Not Connected</span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 mt-1">{gw.description}</p>
                  <p className="text-xs text-surface-400 mt-1.5">{gw.info}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {gw.features.map((f) => (
                      <span key={f} className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-medium text-surface-600">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {gw.status === "connected" ? (
                    <>
                      <div className="text-lg font-bold text-surface-900">{gw.transactions}</div>
                      <div className="text-[10px] text-surface-400">This month</div>
                      <button className="mt-2 btn-ghost text-xs py-1.5 px-3">Settings</button>
                    </>
                  ) : (
                    <button className="btn-primary text-sm">
                      Connect
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Options */}
        <div>
          <h3 className="text-base font-bold text-surface-900 mb-4">Payment Options</h3>
          <div className="space-y-3">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <div key={opt.name} className="rounded-2xl border border-surface-200 bg-white p-5 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-surface-50 flex items-center justify-center text-surface-500 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-surface-900">{opt.name}</h4>
                    <p className="text-xs text-surface-500">{opt.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:ring-4 peer-focus:ring-brand-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-surface-200 bg-surface-50 p-6 flex items-start gap-4">
          <Shield className="h-6 w-6 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-surface-900">Payment Security</h4>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">All payments are processed securely through PCI-compliant payment gateways. AfroStore never stores your customers&apos; card details. All transactions are encrypted with 256-bit SSL.</p>
          </div>
        </div>
      </div>
    </>
  );
}
