"use client";

import { ArrowRight, ShoppingBag, Star, TrendingUp, Package, Users, CreditCard, Bell, Search, Menu, Heart, Share2, ChevronRight, BarChart3, Eye } from "lucide-react";
import Link from "next/link";

/**
 * Showcase Section
 * 
 * A stunning visual section showing AfroStore in action — both desktop and mobile.
 * Features a stylized African woman entrepreneur with device mockups showing
 * real merchant store UIs. Sits between HowItWorks and Templates sections.
 */

// ─── Desktop Storefront Mockup ──────────────────────────────

function DesktopMockup() {
  return (
    <div className="relative w-full max-w-[560px]">
      {/* Desktop Frame */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-1.5 shadow-2xl">
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 rounded-t-xl bg-surface-900/80 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-1 text-[10px] text-white/50">
              <Search className="h-2.5 w-2.5" />
              elegance-boutique.afrostore.com
            </div>
          </div>
        </div>

        {/* Storefront Content */}
        <div className="rounded-b-xl bg-white overflow-hidden">
          {/* Store Navbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-surface-900">Elegance Boutique</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-surface-500 font-medium">
              <span>Shop</span>
              <span>New In</span>
              <span>About</span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> <span className="bg-pink-500 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">2</span>
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" /> <span className="bg-purple-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">3</span>
              </span>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 px-6 py-8">
            <div className="relative z-10">
              <span className="inline-block text-[9px] font-semibold text-pink-300 bg-pink-500/20 rounded-full px-2.5 py-0.5 mb-2">✨ New Collection</span>
              <h2 className="text-lg font-bold text-white leading-tight">Summer Elegance<br />Collection 2026</h2>
              <p className="text-[10px] text-purple-200 mt-1.5 max-w-[200px]">Handcrafted African fashion meets modern style. Free delivery in Lagos.</p>
              <button className="mt-3 bg-white text-purple-900 text-[10px] font-bold rounded-lg px-4 py-1.5 flex items-center gap-1">
                Shop Now <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <div className="h-28 w-28 rounded-full border-2 border-white/30" />
              <div className="h-20 w-20 rounded-full border-2 border-white/20 absolute top-4 left-4" />
            </div>
          </div>

          {/* Product Grid */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-surface-900">Trending Now 🔥</h3>
              <span className="text-[9px] text-purple-600 font-semibold flex items-center gap-0.5">View All <ChevronRight className="h-2.5 w-2.5" /></span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: "Ankara Wrap Dress", price: "₦18,500", color: "from-amber-200 to-orange-300", badge: "Best Seller" },
                { name: "Beaded Necklace Set", price: "₦12,000", color: "from-emerald-200 to-teal-300", badge: null },
                { name: "Silk Head Wrap", price: "₦8,500", color: "from-rose-200 to-pink-300", badge: "New" },
              ].map((product, i) => (
                <div key={i} className="group">
                  <div className={`aspect-square rounded-lg bg-gradient-to-br ${product.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-6 w-6 text-white/40" />
                    </div>
                    {product.badge && (
                      <span className={`absolute top-1 left-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md ${
                        product.badge === "Best Seller" ? "bg-amber-500 text-white" : "bg-purple-600 text-white"
                      }`}>{product.badge}</span>
                    )}
                    <button className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-2.5 w-2.5 text-surface-600" />
                    </button>
                  </div>
                  <p className="text-[9px] font-semibold text-surface-800 mt-1.5 truncate">{product.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-surface-900">{product.price}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Bar */}
          <div className="flex items-center justify-center gap-6 py-2.5 bg-surface-50 border-t border-surface-100">
            {["🔒 Secure Pay", "🚚 Fast Delivery", "💬 WhatsApp Support", "🔄 Easy Returns"].map((badge, i) => (
              <span key={i} className="text-[8px] text-surface-500 font-medium">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phone Dashboard Mockup ─────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative w-[200px] sm:w-[220px]">
      {/* Phone Frame */}
      <div className="rounded-[28px] border-[3px] border-surface-700 bg-surface-900 p-1 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface-900 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="rounded-[24px] bg-white overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 pt-6 pb-1 bg-brand-600">
            <span className="text-[8px] text-white/80 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-3 rounded-sm bg-white/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Dashboard Header */}
          <div className="bg-brand-600 px-4 pb-4 pt-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[8px] text-brand-200">Good morning 👋</p>
                <p className="text-xs font-bold text-white">Amara's Store</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center relative">
                  <Bell className="h-3 w-3 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-brand-600" />
                </div>
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[8px] font-bold text-white">A</div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-brand-200">Today's Revenue</p>
                  <p className="text-base font-extrabold text-white">₦485,200</p>
                </div>
                <div className="flex items-center gap-1 bg-green-500/20 rounded-full px-2 py-0.5">
                  <TrendingUp className="h-2.5 w-2.5 text-green-300" />
                  <span className="text-[8px] font-bold text-green-300">+24%</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                <div>
                  <p className="text-[7px] text-brand-200">Orders</p>
                  <p className="text-[10px] font-bold text-white">47</p>
                </div>
                <div>
                  <p className="text-[7px] text-brand-200">Visitors</p>
                  <p className="text-[10px] font-bold text-white">1,284</p>
                </div>
                <div>
                  <p className="text-[7px] text-brand-200">Conversion</p>
                  <p className="text-[10px] font-bold text-white">3.7%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Package, label: "Products", color: "bg-purple-100 text-purple-600" },
                { icon: ShoppingBag, label: "Orders", color: "bg-blue-100 text-blue-600" },
                { icon: Users, label: "Customers", color: "bg-emerald-100 text-emerald-600" },
                { icon: BarChart3, label: "Analytics", color: "bg-amber-100 text-amber-600" },
              ].map((action, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`h-8 w-8 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[7px] font-medium text-surface-600">{action.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-surface-900">Recent Orders</span>
              <span className="text-[8px] text-brand-600 font-semibold">See all</span>
            </div>
            {[
              { name: "Chioma A.", amount: "₦32,500", status: "Delivered", statusColor: "bg-green-100 text-green-700", time: "2h ago" },
              { name: "Emeka O.", amount: "₦18,000", status: "Processing", statusColor: "bg-blue-100 text-blue-700", time: "4h ago" },
              { name: "Fatima B.", amount: "₦45,800", status: "Pending", statusColor: "bg-amber-100 text-amber-700", time: "5h ago" },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-surface-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-surface-100 flex items-center justify-center text-[8px] font-bold text-surface-600">
                    {order.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-surface-800">{order.name}</p>
                    <p className="text-[7px] text-surface-400">{order.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-surface-900">{order.amount}</p>
                  <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Nav */}
          <div className="flex items-center justify-around py-2 border-t border-surface-100 bg-white">
            {[
              { icon: BarChart3, label: "Home", active: true },
              { icon: Package, label: "Products", active: false },
              { icon: ShoppingBag, label: "Orders", active: false },
              { icon: Users, label: "More", active: false },
            ].map((nav, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <nav.icon className={`h-3.5 w-3.5 ${nav.active ? "text-brand-600" : "text-surface-400"}`} />
                <span className={`text-[7px] font-medium ${nav.active ? "text-brand-600" : "text-surface-400"}`}>{nav.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Woman Illustration (SVG) ───────────────────────────────

function WomanIllustration() {
  return (
    <div className="relative">
      {/* Glow behind */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-400/20 to-brand-400/10 rounded-full blur-3xl scale-110" />
      
      <svg viewBox="0 0 300 420" className="relative w-[240px] sm:w-[280px] drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hair */}
        <ellipse cx="150" cy="100" rx="75" ry="85" fill="#1a1a2e" />
        <ellipse cx="150" cy="90" rx="80" ry="70" fill="#1a1a2e" />
        {/* Hair volume - afro texture */}
        <circle cx="85" cy="75" r="25" fill="#1a1a2e" />
        <circle cx="215" cy="75" r="25" fill="#1a1a2e" />
        <circle cx="75" cy="100" r="20" fill="#1a1a2e" />
        <circle cx="225" cy="100" r="20" fill="#1a1a2e" />
        <circle cx="100" cy="50" r="22" fill="#1a1a2e" />
        <circle cx="200" cy="50" r="22" fill="#1a1a2e" />
        <circle cx="150" cy="35" r="20" fill="#1a1a2e" />
        <circle cx="120" cy="40" r="18" fill="#1a1a2e" />
        <circle cx="180" cy="40" r="18" fill="#1a1a2e" />

        {/* Face */}
        <ellipse cx="150" cy="120" rx="52" ry="60" fill="#8B5E3C" />
        
        {/* Eyes */}
        <ellipse cx="130" cy="110" rx="8" ry="5" fill="white" />
        <ellipse cx="170" cy="110" rx="8" ry="5" fill="white" />
        <circle cx="132" cy="110" r="3.5" fill="#1a1a2e" />
        <circle cx="172" cy="110" r="3.5" fill="#1a1a2e" />
        <circle cx="133" cy="109" r="1.2" fill="white" />
        <circle cx="173" cy="109" r="1.2" fill="white" />
        
        {/* Eyebrows */}
        <path d="M118 100 Q130 95 140 100" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M160 100 Q170 95 182 100" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        
        {/* Nose */}
        <path d="M145 120 Q150 128 155 120" stroke="#7A5231" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        
        {/* Smile */}
        <path d="M130 138 Q150 152 170 138" stroke="#6B4226" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M133 138 Q150 148 167 138" fill="#C0392B" opacity="0.6" />
        
        {/* Earrings */}
        <circle cx="97" cy="130" r="6" fill="#F5B731" />
        <circle cx="97" cy="130" r="3" fill="#D4941F" />
        <circle cx="203" cy="130" r="6" fill="#F5B731" />
        <circle cx="203" cy="130" r="3" fill="#D4941F" />
        
        {/* Neck */}
        <rect x="135" y="170" width="30" height="25" rx="5" fill="#8B5E3C" />
        
        {/* Body / Blazer */}
        <path d="M80 195 Q85 185 135 190 L150 190 L165 190 Q215 185 220 195 L235 280 Q235 290 225 290 L75 290 Q65 290 65 280 Z" fill="#2D5F8A" />
        {/* Blazer lapels */}
        <path d="M135 190 L145 230 L150 190" fill="#245275" />
        <path d="M165 190 L155 230 L150 190" fill="#245275" />
        {/* Inner top */}
        <path d="M140 190 L145 230 L155 230 L160 190" fill="white" />
        
        {/* Necklace */}
        <path d="M125 185 Q150 200 175 185" stroke="#F5B731" strokeWidth="2" fill="none" />
        <circle cx="150" cy="198" r="4" fill="#F5B731" />
        
        {/* Thumbs up hand - right */}
        <g transform="translate(225, 230) rotate(-10)">
          {/* Arm */}
          <rect x="-15" y="-40" width="25" height="50" rx="10" fill="#8B5E3C" />
          {/* Fist */}
          <rect x="-12" y="-55" width="20" height="22" rx="8" fill="#8B5E3C" />
          {/* Thumb up */}
          <rect x="-5" y="-75" width="12" height="28" rx="6" fill="#8B5E3C" />
        </g>
        
        {/* Left arm holding area */}
        <path d="M80 200 Q60 240 70 280" stroke="#2D5F8A" strokeWidth="25" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="280" r="10" fill="#8B5E3C" />
      </svg>
    </div>
  );
}

// ─── Main Showcase Section ──────────────────────────────────

export default function Showcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-[#0a1628] to-brand-900 py-20 sm:py-28">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-500/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[150px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      <div className="container-max relative px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-sm text-accent-300 mb-6">
            <Eye className="h-3.5 w-3.5" />
            <span>See It In Action</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
            Beautiful Stores.{" "}
            <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              Powerful Dashboard.
            </span>
          </h2>
          <p className="mt-4 text-lg text-brand-200/70 max-w-2xl mx-auto">
            Your customers see a stunning storefront. You see real-time analytics, orders, and everything you need to grow — on any device.
          </p>
        </div>

        {/* Main Showcase Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
          {/* Desktop Mockup - Left */}
          <div className="relative animate-fade-up order-2 lg:order-1" style={{ animationDelay: "0.1s" }}>
            <DesktopMockup />
            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white/80">
                <ShoppingBag className="h-3 w-3 text-accent-400" />
                Customer Storefront
              </span>
            </div>
          </div>

          {/* Woman Illustration - Center */}
          <div className="relative order-1 lg:order-2 flex-shrink-0 hidden lg:flex animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <WomanIllustration />
            
            {/* Floating badges around the woman */}
            <div className="absolute -top-2 -right-8 animate-float">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white">Sales Up</p>
                    <p className="text-[8px] text-green-400 font-semibold">+127% this month</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 -left-12 animate-float" style={{ animationDelay: "2s" }}>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-accent-500/20 flex items-center justify-center">
                    <Star className="h-3.5 w-3.5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white">New Review</p>
                    <p className="text-[8px] text-accent-400 font-semibold">⭐⭐⭐⭐⭐ "Amazing!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Mockup - Right */}
          <div className="relative animate-fade-up order-3" style={{ animationDelay: "0.3s" }}>
            <PhoneMockup />
            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white/80 whitespace-nowrap">
                <BarChart3 className="h-3 w-3 text-brand-400" />
                Merchant Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: "50K+", label: "Stores Created", icon: ShoppingBag },
            { value: "₦5B+", label: "Revenue Processed", icon: CreditCard },
            { value: "99.9%", label: "Uptime", icon: TrendingUp },
            { value: "4.9/5", label: "Merchant Rating", icon: Star },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 mb-2 mx-auto group-hover:bg-white/10 transition-colors">
                <stat.icon className="h-4 w-4 text-accent-400" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-[11px] text-brand-300/60 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-accent-500/20 transition-all duration-300 hover:shadow-accent-500/40 hover:-translate-y-1"
          >
            Start Your Free Store
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-brand-300/50">
            Join 50,000+ African entrepreneurs. No credit card needed.
          </p>
        </div>
      </div>
    </section>
  );
}
