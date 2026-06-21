"use client";

import { ArrowRight, ShoppingBag, Star, Package, Heart, Search, ChevronRight, Plus, Check, Minus, Eye, Globe } from "lucide-react";
import Link from "next/link";

/**
 * Showcase Section
 * 
 * Woman on the left with phone overlapping her on the right (like the Prokip reference).
 * Desktop mockup on the far left. Both devices show storefronts.
 * Phone shows a grocery store with add-to-cart interaction.
 */

// ─── Desktop Storefront Mockup ──────────────────────────────

function DesktopMockup() {
  return (
    <div className="relative w-full max-w-[520px]">
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
              <Globe className="h-2.5 w-2.5" />
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
                <Heart className="h-3 w-3" />
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                <span className="bg-purple-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">3</span>
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
                  </div>
                  <p className="text-[9px] font-semibold text-surface-800 mt-1.5 truncate">{product.name}</p>
                  <span className="text-[9px] font-bold text-surface-900">{product.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Bar */}
          <div className="flex items-center justify-center gap-6 py-2.5 bg-surface-50 border-t border-surface-100">
            {["🔒 Secure Pay", "🚚 Fast Delivery", "💬 WhatsApp Support"].map((badge, i) => (
              <span key={i} className="text-[8px] text-surface-500 font-medium">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phone Storefront Mockup (Grocery Store with Add to Cart) ─

function PhoneMockup() {
  return (
    <div className="relative w-[210px] sm:w-[230px]">
      {/* Phone Frame */}
      <div className="rounded-[28px] border-[3px] border-surface-700 bg-surface-900 p-1 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface-900 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="rounded-[24px] bg-white overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 pt-6 pb-1.5 bg-green-700">
            <span className="text-[8px] text-white/80 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-3 rounded-sm bg-white/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Store Header */}
          <div className="bg-green-700 px-4 pb-3 pt-0.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-[10px]">🥑</div>
                <div>
                  <p className="text-[10px] font-bold text-white">FreshMart Lagos</p>
                  <p className="text-[7px] text-green-200">🟢 Open · Delivers in 30min</p>
                </div>
              </div>
              <div className="relative">
                <ShoppingBag className="h-4 w-4 text-white" />
                <div className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 flex items-center justify-center text-[7px] font-bold text-white border border-green-700">4</div>
              </div>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5">
              <Search className="h-3 w-3 text-white/60" />
              <span className="text-[9px] text-white/50">Search for groceries...</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 px-3 py-2.5 overflow-hidden">
            {[
              { label: "All", active: false },
              { label: "🥬 Vegetables", active: true },
              { label: "🍎 Fruits", active: false },
              { label: "🥩 Meat", active: false },
            ].map((cat, i) => (
              <span key={i} className={`text-[8px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                cat.active ? "bg-green-600 text-white" : "bg-surface-100 text-surface-600"
              }`}>{cat.label}</span>
            ))}
          </div>

          {/* Products - Grid with Add to Cart */}
          <div className="px-3 pb-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Product 1 - Added to cart state */}
              <div className="rounded-xl border border-surface-100 bg-white p-2 shadow-sm">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center mb-1.5 relative">
                  <span className="text-2xl">🥑</span>
                  <span className="absolute top-1 right-1 text-[7px] font-bold bg-red-500 text-white px-1 py-0.5 rounded">-15%</span>
                </div>
                <p className="text-[9px] font-semibold text-surface-800">Avocado</p>
                <p className="text-[7px] text-surface-400">Per piece</p>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <span className="text-[9px] font-bold text-surface-900">₦800</span>
                    <span className="text-[7px] text-surface-400 line-through ml-1">₦950</span>
                  </div>
                  {/* Quantity control - already in cart */}
                  <div className="flex items-center gap-0.5">
                    <button className="h-5 w-5 rounded-md bg-green-600 flex items-center justify-center">
                      <Minus className="h-2.5 w-2.5 text-white" />
                    </button>
                    <span className="text-[9px] font-bold text-surface-900 w-4 text-center">2</span>
                    <button className="h-5 w-5 rounded-md bg-green-600 flex items-center justify-center">
                      <Plus className="h-2.5 w-2.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product 2 - Added to cart */}
              <div className="rounded-xl border border-surface-100 bg-white p-2 shadow-sm">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-red-100 to-orange-200 flex items-center justify-center mb-1.5">
                  <span className="text-2xl">🍅</span>
                </div>
                <p className="text-[9px] font-semibold text-surface-800">Tomatoes</p>
                <p className="text-[7px] text-surface-400">1kg basket</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-bold text-surface-900">₦1,200</span>
                  <div className="flex items-center gap-0.5">
                    <button className="h-5 w-5 rounded-md bg-green-600 flex items-center justify-center">
                      <Minus className="h-2.5 w-2.5 text-white" />
                    </button>
                    <span className="text-[9px] font-bold text-surface-900 w-4 text-center">1</span>
                    <button className="h-5 w-5 rounded-md bg-green-600 flex items-center justify-center">
                      <Plus className="h-2.5 w-2.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product 3 - Not in cart yet */}
              <div className="rounded-xl border border-surface-100 bg-white p-2 shadow-sm">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center mb-1.5">
                  <span className="text-2xl">🫑</span>
                </div>
                <p className="text-[9px] font-semibold text-surface-800">Bell Pepper</p>
                <p className="text-[7px] text-surface-400">Per piece</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-bold text-surface-900">₦500</span>
                  <button className="h-5 w-5 rounded-md bg-green-100 flex items-center justify-center">
                    <Plus className="h-2.5 w-2.5 text-green-700" />
                  </button>
                </div>
              </div>

              {/* Product 4 - Not in cart */}
              <div className="rounded-xl border border-surface-100 bg-white p-2 shadow-sm">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-orange-100 to-yellow-200 flex items-center justify-center mb-1.5 relative">
                  <span className="text-2xl">🥕</span>
                  <span className="absolute top-1 left-1 text-[7px] font-bold bg-green-600 text-white px-1 py-0.5 rounded">New</span>
                </div>
                <p className="text-[9px] font-semibold text-surface-800">Carrots</p>
                <p className="text-[7px] text-surface-400">500g pack</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-bold text-surface-900">₦650</span>
                  <button className="h-5 w-5 rounded-md bg-green-100 flex items-center justify-center">
                    <Plus className="h-2.5 w-2.5 text-green-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cart Summary */}
          <div className="mx-3 mb-2 rounded-xl bg-green-700 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingBag className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-white">4 items · ₦4,250</p>
                <p className="text-[7px] text-green-200">Free delivery above ₦5,000</p>
              </div>
            </div>
            <div className="bg-white rounded-lg px-2.5 py-1 flex items-center gap-1">
              <span className="text-[9px] font-bold text-green-700">Checkout</span>
              <ArrowRight className="h-2.5 w-2.5 text-green-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Woman SVG Illustration ─────────────────────────────────

function WomanIllustration() {
  return (
    <svg viewBox="0 0 320 500" className="w-[260px] sm:w-[300px] lg:w-[340px] drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hair - Voluminous Afro */}
      <ellipse cx="160" cy="105" rx="85" ry="95" fill="#1a1a2e" />
      <ellipse cx="160" cy="95" rx="90" ry="78" fill="#1a1a2e" />
      <circle cx="85" cy="78" r="28" fill="#1a1a2e" />
      <circle cx="235" cy="78" r="28" fill="#1a1a2e" />
      <circle cx="75" cy="108" r="22" fill="#1a1a2e" />
      <circle cx="245" cy="108" r="22" fill="#1a1a2e" />
      <circle cx="105" cy="48" r="24" fill="#1a1a2e" />
      <circle cx="215" cy="48" r="24" fill="#1a1a2e" />
      <circle cx="160" cy="35" r="22" fill="#1a1a2e" />
      <circle cx="130" cy="38" r="20" fill="#1a1a2e" />
      <circle cx="190" cy="38" r="20" fill="#1a1a2e" />
      <circle cx="95" cy="55" r="18" fill="#1a1a2e" />
      <circle cx="225" cy="55" r="18" fill="#1a1a2e" />

      {/* Face */}
      <ellipse cx="160" cy="130" rx="56" ry="65" fill="#8B5E3C" />
      
      {/* Forehead highlight */}
      <ellipse cx="160" cy="100" rx="35" ry="20" fill="#9B6E4C" opacity="0.3" />
      
      {/* Eyes */}
      <ellipse cx="138" cy="120" rx="9" ry="5.5" fill="white" />
      <ellipse cx="182" cy="120" rx="9" ry="5.5" fill="white" />
      <circle cx="140" cy="120" r="4" fill="#1a1a2e" />
      <circle cx="184" cy="120" r="4" fill="#1a1a2e" />
      <circle cx="141.5" cy="119" r="1.5" fill="white" />
      <circle cx="185.5" cy="119" r="1.5" fill="white" />
      
      {/* Eyelashes */}
      <path d="M128 116 Q138 112 148 116" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M172 116 Q182 112 192 116" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      
      {/* Eyebrows */}
      <path d="M125 108 Q138 102 150 108" stroke="#1a1a2e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M170 108 Q182 102 195 108" stroke="#1a1a2e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      
      {/* Nose */}
      <path d="M153 132 Q160 140 167 132" stroke="#7A5231" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      
      {/* Smile - Wide and warm */}
      <path d="M135 150 Q160 168 185 150" stroke="#6B4226" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M139 150 Q160 164 181 150" fill="#C0392B" opacity="0.5" />
      {/* Teeth hint */}
      <path d="M145 151 L175 151" stroke="white" strokeWidth="2" opacity="0.7" />
      
      {/* Dimples */}
      <circle cx="130" cy="148" r="2" fill="#7A5231" opacity="0.3" />
      <circle cx="190" cy="148" r="2" fill="#7A5231" opacity="0.3" />
      
      {/* Earrings - Gold hoops */}
      <ellipse cx="103" cy="140" rx="5" ry="8" stroke="#F5B731" strokeWidth="2.5" fill="none" />
      <ellipse cx="217" cy="140" rx="5" ry="8" stroke="#F5B731" strokeWidth="2.5" fill="none" />
      
      {/* Neck */}
      <path d="M140 185 Q160 195 180 185 L178 210 L142 210 Z" fill="#8B5E3C" />
      
      {/* Necklace */}
      <path d="M130 200 Q160 215 190 200" stroke="#F5B731" strokeWidth="2" fill="none" />
      <circle cx="160" cy="213" r="5" fill="#F5B731" />
      <circle cx="160" cy="213" r="2.5" fill="#D4941F" />
      
      {/* Body - Cream/Beige Blazer */}
      <path d="M85 210 Q90 200 140 205 L160 205 L180 205 Q230 200 235 210 L255 380 Q255 395 240 395 L80 395 Q65 395 65 380 Z" fill="#E8D5B7" />
      
      {/* Blazer shadow/lapels */}
      <path d="M140 205 L152 260 L160 205" fill="#D4C4A5" />
      <path d="M180 205 L168 260 L160 205" fill="#D4C4A5" />
      
      {/* Inner top - White */}
      <path d="M148 205 L152 260 L168 260 L172 205" fill="white" />
      
      {/* Blazer pocket detail */}
      <rect x="100" y="280" width="30" height="2" rx="1" fill="#D4C4A5" />
      <rect x="190" y="280" width="30" height="2" rx="1" fill="#D4C4A5" />
      
      {/* Blazer buttons */}
      <circle cx="160" cy="270" r="3" fill="#C4B498" />
      <circle cx="160" cy="290" r="3" fill="#C4B498" />
      
      {/* Right arm - Thumbs up */}
      <path d="M235 215 Q260 250 255 300" stroke="#E8D5B7" strokeWidth="28" strokeLinecap="round" fill="none" />
      {/* Hand / Fist */}
      <rect x="240" y="285" width="22" height="25" rx="10" fill="#8B5E3C" />
      {/* Thumb pointing up */}
      <rect x="246" y="260" width="13" height="30" rx="6.5" fill="#8B5E3C" />
      {/* Thumb highlight */}
      <rect x="249" y="264" width="6" height="15" rx="3" fill="#9B6E4C" opacity="0.3" />
      
      {/* Left arm - relaxed */}
      <path d="M85 215 Q60 260 72 340" stroke="#E8D5B7" strokeWidth="28" strokeLinecap="round" fill="none" />
      <ellipse cx="72" cy="345" r="12" ry="10" fill="#8B5E3C" />

      {/* Glasses - stylish rectangular */}
      <rect x="124" y="112" rx="4" width="30" height="18" stroke="#1a1a2e" strokeWidth="2" fill="none" opacity="0.15" />
      <rect x="166" y="112" rx="4" width="30" height="18" stroke="#1a1a2e" strokeWidth="2" fill="none" opacity="0.15" />
      <line x1="154" y1="120" x2="166" y2="120" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.15" />
    </svg>
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
              Any Device.
            </span>
          </h2>
          <p className="mt-4 text-lg text-brand-200/70 max-w-2xl mx-auto">
            Your customers get a stunning shopping experience whether they&apos;re on desktop or phone. Every store looks amazing out of the box.
          </p>
        </div>

        {/* Main Layout: Desktop on left, Woman + Phone on right */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          
          {/* Desktop Mockup */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <DesktopMockup />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white/80">
                <Globe className="h-3 w-3 text-accent-400" />
                Desktop Experience
              </span>
            </div>
          </div>

          {/* Woman + Phone Composite (Prokip style) */}
          <div className="relative animate-fade-up flex-shrink-0" style={{ animationDelay: "0.25s" }}>
            {/* Woman - base layer */}
            <div className="relative">
              <WomanIllustration />
            </div>
            
            {/* Phone - overlapping the woman on the right */}
            <div className="absolute top-8 -right-16 sm:-right-12 z-10">
              <PhoneMockup />
            </div>

            {/* Label under the composite */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white/80 whitespace-nowrap">
                <ShoppingBag className="h-3 w-3 text-green-400" />
                Mobile Experience
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-accent-500/20 transition-all duration-300 hover:shadow-accent-500/40 hover:-translate-y-1"
          >
            Start Your Free Store
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-brand-300/50">
            No credit card needed. Launch in 5 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
