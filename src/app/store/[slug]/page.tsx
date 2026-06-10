"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Star,
  Heart,
  Eye,
  ChevronRight,
  MessageCircle,
  Truck,
  Shield,
  CreditCard,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Plus,
  Minus,
  Filter,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";

const products = [
  { id: "1", name: "Ankara Maxi Dress", price: 15000, compareAt: 22000, image: "from-pink-400 to-rose-500", badge: "Best Seller", rating: 4.9, reviews: 48, category: "Fashion" },
  { id: "2", name: "Gold Hoop Earrings", price: 9000, image: "from-amber-400 to-orange-500", rating: 4.8, reviews: 36, category: "Jewelry" },
  { id: "3", name: "Leather Crossbody Bag", price: 15000, image: "from-amber-600 to-yellow-600", badge: "Low Stock", rating: 4.7, reviews: 29, category: "Accessories" },
  { id: "4", name: "Shea Butter Skincare Set", price: 8000, image: "from-green-400 to-emerald-500", rating: 4.9, reviews: 24, category: "Beauty" },
  { id: "5", name: "African Print Sneakers", price: 18000, compareAt: 25000, image: "from-blue-400 to-indigo-500", badge: "New", rating: 4.8, reviews: 21, category: "Shoes" },
  { id: "6", name: "Beaded Statement Necklace", price: 6500, image: "from-red-400 to-pink-500", rating: 4.6, reviews: 15, category: "Jewelry" },
  { id: "7", name: "Coconut Oil Hair Treatment", price: 4500, image: "from-teal-400 to-cyan-500", badge: "Popular", rating: 4.8, reviews: 42, category: "Beauty" },
  { id: "8", name: "Dashiki Summer Shirt", price: 12000, image: "from-purple-400 to-violet-500", rating: 4.5, reviews: 18, category: "Fashion" },
];

const categories = ["All", "Fashion", "Jewelry", "Beauty", "Accessories", "Shoes"];

export default function StorePage() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [qty, setQty] = useState(1);

  const filteredProducts = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-brand-600 text-white text-center py-2 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          Free delivery on orders above ₦50,000 — Shop now!
        </div>
      </div>

      {/* Store Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 -ml-2 text-surface-600">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="#" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-surface-900">Amara&apos;s Fashion</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            {["Shop", "New Arrivals", "About", "Contact"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 text-surface-600 hover:bg-surface-50 rounded-lg"><Search className="h-5 w-5" /></button>
            <button className="p-2 text-surface-600 hover:bg-surface-50 rounded-lg hidden sm:flex"><Heart className="h-5 w-5" /></button>
            <button
              onClick={() => setCartCount(c => c + 1)}
              className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/80 mb-4">
              <Zap className="h-3 w-3" />New Collection 2025
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              African Fashion,<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Reimagined.</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-md text-base leading-relaxed">
              Handcrafted pieces that celebrate our heritage. Bold prints, premium quality, and styles that tell your story.
            </p>
            <div className="mt-6 flex items-center gap-3 justify-center sm:justify-start">
              <a href="#shop" className="btn-primary text-sm">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#" className="inline-flex items-center gap-2 text-white/70 text-sm font-medium hover:text-white transition-colors">
                <MessageCircle className="h-4 w-4" />
                Order via WhatsApp
              </a>
            </div>
          </div>
          <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-2xl shadow-purple-500/20 flex-shrink-0" />
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-b border-surface-100 bg-surface-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Truck, text: "Fast Delivery" },
            { icon: Shield, text: "Secure Payment" },
            { icon: CreditCard, text: "Pay Your Way" },
            { icon: MessageCircle, text: "WhatsApp Support" },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.text} className="flex items-center gap-2 justify-center">
                <Icon className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-medium text-surface-600">{t.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products */}
      <section id="shop" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-surface-900">Our Collection</h2>
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`hidden sm:block rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); setQty(1); }}>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                <div className={`absolute inset-0 bg-gradient-to-br ${product.image} transition-transform duration-500 group-hover:scale-110`} />
                {product.badge && (
                  <div className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${product.badge === "Best Seller" ? "bg-brand-600" : product.badge === "Low Stock" ? "bg-red-500" : product.badge === "New" ? "bg-blue-600" : "bg-purple-600"}`}>
                    {product.badge}
                  </div>
                )}
                {product.compareAt && (
                  <div className="absolute top-3 right-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    -{Math.round(((product.compareAt - product.price) / product.compareAt) * 100)}%
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={(e) => { e.stopPropagation(); setCartCount(c => c + 1); }}
                  className="absolute bottom-3 left-3 right-3 rounded-xl bg-white py-2.5 text-xs font-semibold text-surface-900 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg flex items-center justify-center gap-2 hover:bg-surface-50"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </button>
              </div>
              <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">{product.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-surface-200 text-surface-200"}`} />
                  ))}
                </div>
                <span className="text-[10px] text-surface-400">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-base font-bold text-surface-900">₦{product.price.toLocaleString()}</span>
                {product.compareAt && <span className="text-xs text-surface-400 line-through">₦{product.compareAt.toLocaleString()}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-green-600 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Prefer to order on WhatsApp?</h3>
            <p className="text-green-100 text-sm mt-1">Send us a message and we&apos;ll help you place your order.</p>
          </div>
          <a href="https://wa.me/2348123456789" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors shadow-lg">
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-white" /></div>
                <span className="font-display font-bold text-white">Amara&apos;s Fashion</span>
              </div>
              <p className="text-xs leading-relaxed">Handcrafted African fashion and accessories. Bold. Beautiful. Yours.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
              <ul className="space-y-2 text-xs">
                {["New Arrivals", "Best Sellers", "Fashion", "Jewelry", "Beauty"].map((l) => (<li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Help</h4>
              <ul className="space-y-2 text-xs">
                {["Shipping", "Returns", "FAQ", "Contact Us"].map((l) => (<li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />+234 812 345 6789</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />hello@amarasfashion.com</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Lagos, Nigeria</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-800 flex items-center justify-between text-xs text-surface-600">
            <span>&copy; 2025 Amara&apos;s Fashion. All rights reserved.</span>
            <span className="flex items-center gap-1">Powered by <span className="font-semibold text-brand-400">AfroStore</span></span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/2348123456789" className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all">
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Image */}
              <div className={`aspect-square bg-gradient-to-br ${selectedProduct.image} relative`}>
                {selectedProduct.badge && (
                  <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white ${selectedProduct.badge === "Best Seller" ? "bg-brand-600" : selectedProduct.badge === "Low Stock" ? "bg-red-500" : "bg-blue-600"}`}>
                    {selectedProduct.badge}
                  </span>
                )}
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-surface-700 hover:bg-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Details */}
              <div className="p-6 sm:p-8 flex flex-col">
                <h2 className="font-display text-2xl font-bold text-surface-900">{selectedProduct.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? "fill-yellow-400 text-yellow-400" : "fill-surface-200 text-surface-200"}`} />))}</div>
                  <span className="text-sm text-surface-500">({selectedProduct.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-3xl font-extrabold text-surface-900 font-display">₦{selectedProduct.price.toLocaleString()}</span>
                  {selectedProduct.compareAt && <span className="text-lg text-surface-400 line-through">₦{selectedProduct.compareAt.toLocaleString()}</span>}
                  {selectedProduct.compareAt && <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-0.5 text-xs font-bold">Save ₦{(selectedProduct.compareAt - selectedProduct.price).toLocaleString()}</span>}
                </div>
                <p className="mt-4 text-sm text-surface-500 leading-relaxed">Beautiful handcrafted {selectedProduct.name.toLowerCase()} made with premium materials. Celebrate African heritage with style.</p>

                {/* Size selector example */}
                {selectedProduct.category === "Fashion" && (
                  <div className="mt-5">
                    <span className="text-sm font-semibold text-surface-900">Size</span>
                    <div className="flex gap-2 mt-2">
                      {["S", "M", "L", "XL"].map((s) => (<button key={s} className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${s === "M" ? "border-surface-900 bg-surface-900 text-white" : "border-surface-200 text-surface-600 hover:border-surface-400"}`}>{s}</button>))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-5">
                  <span className="text-sm font-semibold text-surface-900">Quantity</span>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 rounded-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-50"><Minus className="h-4 w-4" /></button>
                    <span className="text-lg font-bold text-surface-900 w-8 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="h-10 w-10 rounded-lg border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-50"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="mt-6 space-y-3 flex-1 flex flex-col justify-end">
                  <button onClick={() => { setCartCount(c => c + qty); setSelectedProduct(null); }} className="btn-primary w-full py-3.5">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart — ₦{(selectedProduct.price * qty).toLocaleString()}
                  </button>
                  <a href="https://wa.me/2348123456789" className="btn-secondary w-full py-3 text-green-700 border-green-200 hover:bg-green-50">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    Order via WhatsApp
                  </a>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-surface-100">
                  {[
                    { icon: Truck, text: "Fast Delivery" },
                    { icon: Shield, text: "Secure Pay" },
                    { icon: CheckCircle2, text: "Verified" },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.text} className="flex flex-col items-center gap-1 text-center">
                        <Icon className="h-4 w-4 text-brand-600" />
                        <span className="text-[10px] text-surface-500">{t.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
