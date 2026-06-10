"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Search, Star, Download, CheckCircle2, Sparkles, Bot, CreditCard, Truck, MessageCircle, Shield, Tag, BarChart3, Users, Mail, Globe, Share2, Gift, Repeat, Crown } from "lucide-react";

const installedPlugins = [
  { id: "1", name: "WhatsApp Chat", icon: MessageCircle, description: "Live WhatsApp chat button and order notifications", version: "2.1.0", color: "bg-green-50 text-green-600" },
  { id: "2", name: "Monnify Payments", icon: CreditCard, description: "Accept bank transfers, cards, USSD via Monnify", version: "3.0.1", color: "bg-blue-50 text-blue-600" },
  { id: "3", name: "Paystack", icon: CreditCard, description: "Card and mobile money payments via Paystack", version: "2.5.0", color: "bg-indigo-50 text-indigo-600" },
  { id: "4", name: "Lagos Delivery Zones", icon: Truck, description: "Area-based delivery fees for Lagos mainland and island", version: "1.2.0", color: "bg-orange-50 text-orange-600" },
];

const marketplacePlugins = [
  { id: "5", name: "Flutterwave", icon: CreditCard, description: "International payments with Flutterwave", rating: 4.8, installs: "5.2k", premium: false, color: "bg-amber-50 text-amber-600" },
  { id: "6", name: "AI Product Descriptions", icon: Sparkles, description: "Auto-generate descriptions from images", rating: 4.9, installs: "8.1k", premium: false, color: "bg-purple-50 text-purple-600" },
  { id: "7", name: "Reviews & Ratings", icon: Star, description: "Product reviews with photo uploads", rating: 4.7, installs: "12k", premium: false, color: "bg-yellow-50 text-yellow-600" },
  { id: "8", name: "Coupon & Discounts", icon: Tag, description: "Create percentage and fixed discount codes", rating: 4.6, installs: "9.3k", premium: false, color: "bg-red-50 text-red-600" },
  { id: "9", name: "Abandoned Cart Recovery", icon: Repeat, description: "WhatsApp and email abandoned cart reminders", rating: 4.8, installs: "6.7k", premium: true, color: "bg-teal-50 text-teal-600" },
  { id: "10", name: "Affiliate & Referral", icon: Share2, description: "Referral links with commission tracking", rating: 4.5, installs: "3.4k", premium: true, color: "bg-pink-50 text-pink-600" },
  { id: "11", name: "Facebook & TikTok Pixel", icon: BarChart3, description: "Track conversions with FB and TikTok pixels", rating: 4.7, installs: "7.8k", premium: false, color: "bg-blue-50 text-blue-600" },
  { id: "12", name: "AI SEO Optimizer", icon: Globe, description: "Auto-optimize meta tags, descriptions, and schema", rating: 4.9, installs: "4.5k", premium: true, color: "bg-emerald-50 text-emerald-600" },
  { id: "13", name: "Email Marketing", icon: Mail, description: "Automated email campaigns and newsletters", rating: 4.6, installs: "5.9k", premium: false, color: "bg-violet-50 text-violet-600" },
  { id: "14", name: "Loyalty Points", icon: Gift, description: "Reward customers with points for purchases", rating: 4.4, installs: "2.1k", premium: true, color: "bg-fuchsia-50 text-fuchsia-600" },
  { id: "15", name: "Staff Accounts", icon: Users, description: "Add team members with role-based access", rating: 4.7, installs: "3.8k", premium: false, color: "bg-slate-50 text-slate-600" },
  { id: "16", name: "Trust Badges", icon: Shield, description: "Display verified business and security badges", rating: 4.5, installs: "11k", premium: false, color: "bg-green-50 text-green-600" },
];

export default function PluginsPage() {
  return (
    <>
      <DashboardHeader title="Plugins" subtitle="Extend your store's functionality" />
      <div className="p-6 space-y-6">
        {/* AI Plugin Builder Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 to-brand-700 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Build a Custom Plugin with AI</h3>
            <p className="text-sm text-brand-200/80 mt-0.5">Describe what you need in plain English — like &ldquo;charge ₦2,000 delivery for Lagos mainland, ₦3,500 for island&rdquo; — and AI builds it.</p>
          </div>
          <button className="btn-primary bg-white text-brand-700 shadow-none hover:bg-brand-50 text-sm flex-shrink-0">
            <Sparkles className="h-4 w-4" />
            Build Plugin
          </button>
        </div>

        {/* Installed */}
        <div>
          <h3 className="text-base font-bold text-surface-900 mb-4">Installed Plugins</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {installedPlugins.map((plugin) => {
              const Icon = plugin.icon;
              return (
                <div key={plugin.id} className="rounded-2xl border border-surface-200 bg-white p-5 flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-xl ${plugin.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-surface-900">{plugin.name}</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        <CheckCircle2 className="h-3 w-3" />Active
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{plugin.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-surface-400">v{plugin.version}</span>
                      <button className="text-[10px] font-semibold text-brand-600 hover:text-brand-700">Settings</button>
                      <button className="text-[10px] font-semibold text-red-500 hover:text-red-600">Disable</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marketplace */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-surface-900">Plugin Marketplace</h3>
            <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 w-64">
              <Search className="h-4 w-4 text-surface-400" />
              <input type="text" placeholder="Search plugins..." className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {marketplacePlugins.map((plugin) => {
              const Icon = plugin.icon;
              return (
                <div key={plugin.id} className="rounded-2xl border border-surface-200 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-11 w-11 rounded-xl ${plugin.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {plugin.premium && <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 border border-accent-200 px-2 py-0.5 text-[10px] font-bold text-accent-700"><Crown className="h-3 w-3" />Pro</span>}
                  </div>
                  <h4 className="text-sm font-bold text-surface-900">{plugin.name}</h4>
                  <p className="text-xs text-surface-500 mt-1 leading-relaxed">{plugin.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-semibold text-surface-700">{plugin.rating}</span></div>
                      <span className="text-[10px] text-surface-400">{plugin.installs}</span>
                    </div>
                    <button className="rounded-lg bg-brand-50 px-3 py-1.5 text-[10px] font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                      <Download className="h-3 w-3 inline mr-1" />Install
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
