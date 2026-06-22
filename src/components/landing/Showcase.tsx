"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ShoppingBag, Star, Heart, Search,
  Eye, Globe, Plus, ChevronRight,
} from "lucide-react";

/**
 * Showcase Section — Prokip-style layout
 *
 * The woman is a real photo that BLENDS into the dark background (no box).
 * The phone sits beside/behind her right shoulder showing a product shop.
 * Desktop storefront mockup on the left side.
 * No cart UI — just a clean product browsing experience.
 */

// Woman — professional African woman. Use a portrait-style photo.
// This should ideally be replaced with a proper cutout PNG in /public/images/
const WOMAN_PHOTO = "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&h=900&fit=crop&crop=face&q=80";

// Desktop storefront products
const DESKTOP_PRODUCTS = [
  {
    name: "Ankara Wrap Dress",
    price: "₦18,500",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=200&h=200&fit=crop",
  },
  {
    name: "Beaded Necklace Set",
    price: "₦12,000",
    badge: null,
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop",
  },
  {
    name: "Silk Head Wrap",
    price: "₦8,500",
    badge: "New",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop",
  },
];

// Phone storefront products — grocery shop (browsing, not cart)
const PHONE_PRODUCTS = [
  {
    name: "Fresh Avocados",
    price: "₦800",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop",
  },
  {
    name: "Ripe Tomatoes",
    price: "₦1,200",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=200&h=200&fit=crop",
  },
  {
    name: "Bell Peppers",
    price: "₦500",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop",
  },
  {
    name: "Fresh Carrots",
    price: "₦650",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop",
  },
  {
    name: "Red Onions",
    price: "₦400",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&h=200&fit=crop",
  },
  {
    name: "Fresh Spinach",
    price: "₦350",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop",
  },
];

// ─── Desktop Storefront ─────────────────────────────────────

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

        <div className="rounded-b-xl bg-white overflow-hidden">
          {/* Navbar */}
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
                <ShoppingBag className="h-3 w-3" />
                <span className="bg-purple-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">3</span>
              </span>
            </div>
          </div>

          {/* Hero */}
          <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 px-6 py-8">
            <span className="inline-block text-[9px] font-semibold text-pink-300 bg-pink-500/20 rounded-full px-2.5 py-0.5 mb-2">✨ New Collection</span>
            <h2 className="text-lg font-bold text-white leading-tight">Summer Elegance<br />Collection 2026</h2>
            <p className="text-[10px] text-purple-200 mt-1.5 max-w-[200px]">Handcrafted African fashion meets modern style. Free delivery in Lagos.</p>
            <button className="mt-3 bg-white text-purple-900 text-[10px] font-bold rounded-lg px-4 py-1.5 flex items-center gap-1">
              Shop Now <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Products */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-surface-900">Trending Now 🔥</h3>
              <span className="text-[9px] text-purple-600 font-semibold flex items-center gap-0.5">View All <ChevronRight className="h-2.5 w-2.5" /></span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {DESKTOP_PRODUCTS.map((product, i) => (
                <div key={i} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden relative bg-surface-100">
                    <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-full object-cover" />
                    {product.badge && (
                      <span className={`absolute top-1 left-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md ${product.badge === "Best Seller" ? "bg-amber-500 text-white" : "bg-purple-600 text-white"}`}>{product.badge}</span>
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

          {/* Trust */}
          <div className="flex items-center justify-center gap-6 py-2.5 bg-surface-50 border-t border-surface-100">
            {["🔒 Secure Pay", "🚚 Fast Delivery", "💬 WhatsApp Support"].map((b, i) => (
              <span key={i} className="text-[8px] text-surface-500 font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phone Storefront (Product Shop — browsing, NOT cart) ───

function PhoneMockup() {
  return (
    <div className="relative w-[200px] sm:w-[220px]">
      <div className="rounded-[28px] border-[3px] border-surface-700 bg-surface-900 p-1 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface-900 rounded-b-2xl z-10" />

        <div className="rounded-[24px] bg-white overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 pt-6 pb-1 bg-green-700">
            <span className="text-[8px] text-white/80 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-3 rounded-sm bg-white/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Store Header */}
          <div className="bg-green-700 px-3 pb-3 pt-0.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">FM</div>
                <span className="text-[10px] font-bold text-white">FreshMart Lagos</span>
              </div>
              <ShoppingBag className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-lg px-2.5 py-1.5">
              <Search className="h-2.5 w-2.5 text-white/60" />
              <span className="text-[8px] text-white/50">Search groceries...</span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-1 px-3 py-2 overflow-hidden">
            {["All", "Vegetables", "Fruits", "Meat"].map((cat, i) => (
              <span key={i} className={`text-[7px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${i === 1 ? "bg-green-600 text-white" : "bg-surface-100 text-surface-500"}`}>{cat}</span>
            ))}
          </div>

          {/* Product Grid — Shop browsing */}
          <div className="px-2.5 pb-3">
            <div className="grid grid-cols-2 gap-1.5">
              {PHONE_PRODUCTS.map((product, i) => (
                <div key={i} className="rounded-lg border border-surface-100 bg-white p-1.5">
                  <div className="aspect-square rounded-md overflow-hidden bg-surface-50 mb-1">
                    <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[8px] font-semibold text-surface-800 truncate">{product.name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Star className="h-2 w-2 fill-amber-400 text-amber-400" />
                    <span className="text-[7px] text-surface-400">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[8px] font-bold text-surface-900">{product.price}</span>
                    <button className="h-4.5 w-4.5 rounded-md bg-green-600 flex items-center justify-center">
                      <Plus className="h-2.5 w-2.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ───────────────────────────────────────────

export default function Showcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-[#0a1628] to-brand-900 py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-500/8 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      <div className="container-max relative px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            Your customers get a stunning shopping experience whether they&apos;re on desktop or mobile. Every store looks amazing out of the box.
          </p>
        </div>

        {/* Layout: Desktop left | Woman+Phone right */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          
          {/* Desktop */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <DesktopMockup />
          </div>

          {/* Woman + Phone — Prokip composition */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.25s" }}>
            {/*
              Prokip style: Woman in foreground (left), phone beside her (right).
              Woman photo fades into the dark background — no box, no border.
              Phone overlaps slightly at her shoulder area.
            */}
            <div className="relative w-[340px] sm:w-[400px] h-[440px] sm:h-[520px]">
              
              {/* Woman — blends into background, no visible edges */}
              <div className="absolute bottom-0 left-0 w-[230px] sm:w-[270px] h-full">
                <div className="relative w-full h-full">
                  <Image
                    src={WOMAN_PHOTO}
                    alt="African woman entrepreneur showcasing mobile store"
                    fill
                    className="object-cover object-top"
                    sizes="270px"
                    priority
                    style={{
                      // Mask: fade all edges into the dark background
                      maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 70%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 60%, transparent 100%)",
                      maskComposite: "intersect",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 70%, transparent 100%)",
                      WebkitMaskComposite: "source-in",
                    }}
                  />
                </div>
              </div>

              {/* Phone — positioned at her right shoulder area */}
              <div className="absolute top-6 sm:top-10 right-0 z-20">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
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
