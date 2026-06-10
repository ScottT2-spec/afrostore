"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronLeft,
  Lock,
  CreditCard,
  Building2,
  Smartphone,
  Truck,
  CheckCircle2,
  Shield,
  Tag,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  ArrowRight,
  MapPin,
} from "lucide-react";

const cartItems = [
  { id: "1", name: "Ankara Maxi Dress", variant: "Size M", price: 15000, qty: 1, image: "from-pink-400 to-rose-500" },
  { id: "2", name: "Gold Hoop Earrings", price: 9000, qty: 2, image: "from-amber-400 to-orange-500" },
];

const paymentMethods = [
  { id: "card", name: "Card Payment", desc: "Visa, Mastercard, Verve", icon: CreditCard },
  { id: "bank", name: "Bank Transfer", desc: "Pay via bank transfer (Monnify)", icon: Building2 },
  { id: "ussd", name: "USSD", desc: "Pay with USSD code", icon: Smartphone },
  { id: "cod", name: "Pay on Delivery", desc: "Pay when order arrives", icon: Truck },
];

const deliveryOptions = [
  { id: "mainland", name: "Lagos Mainland", fee: 2000, time: "1-2 days" },
  { id: "island", name: "Lagos Island", fee: 3500, time: "1-2 days" },
  { id: "other", name: "Other States", fee: 5000, time: "3-5 days" },
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [delivery, setDelivery] = useState("mainland");
  const [step, setStep] = useState(1);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = deliveryOptions.find((d) => d.id === delivery)?.fee || 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="#" className="text-surface-500 hover:text-surface-700 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-surface-900">Checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <Lock className="h-3.5 w-3.5" />
            Secure checkout
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {["Information", "Delivery", "Payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`flex items-center gap-2 ${i + 1 <= step ? "text-brand-600" : "text-surface-400"}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 < step ? "bg-brand-600 text-white" : i + 1 === step ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600" : "bg-surface-100 text-surface-400"}`}>
                    {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${i + 1 < step ? "bg-brand-500" : "bg-surface-200"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact Info */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-surface-700 mb-1.5">First name</label><input type="text" className="input-field" placeholder="Chioma" /></div>
                  <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Last name</label><input type="text" className="input-field" placeholder="Eze" /></div>
                </div>
                <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label><input type="email" className="input-field" placeholder="chioma@gmail.com" /></div>
                <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Phone (WhatsApp)</label><input type="tel" className="input-field" placeholder="+234 812 345 6789" /></div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-600" />
                Delivery Address
              </h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Address</label><input type="text" className="input-field" placeholder="12 Admiralty Way" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-surface-700 mb-1.5">City</label><input type="text" className="input-field" placeholder="Lekki Phase 1" /></div>
                  <div><label className="block text-sm font-medium text-surface-700 mb-1.5">State</label><select className="input-field"><option>Lagos</option><option>Abuja</option><option>Rivers</option></select></div>
                </div>
                <div><label className="block text-sm font-medium text-surface-700 mb-1.5">Delivery instructions (optional)</label><textarea className="input-field" placeholder="Gate code, landmark, etc." rows={2} /></div>
              </div>
            </div>

            {/* Delivery Zone */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-brand-600" />
                Delivery Option
              </h3>
              <div className="space-y-2">
                {deliveryOptions.map((opt) => (
                  <label key={opt.id} className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${delivery === opt.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-surface-200 hover:border-surface-300"}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="delivery" checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="accent-brand-600" />
                      <div>
                        <span className="text-sm font-semibold text-surface-900">{opt.name}</span>
                        <p className="text-xs text-surface-500">{opt.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-surface-900">₦{opt.fee.toLocaleString()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-600" />
                Payment Method
              </h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label key={method.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${paymentMethod === method.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-surface-200 hover:border-surface-300"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-brand-600" />
                      <Icon className="h-5 w-5 text-surface-500" />
                      <div>
                        <span className="text-sm font-semibold text-surface-900">{method.name}</span>
                        <p className="text-xs text-surface-500">{method.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${item.image} flex-shrink-0 relative`}>
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-surface-700 text-white text-[10px] font-bold flex items-center justify-center">{item.qty}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-surface-900">{item.name}</h4>
                      {item.variant && <p className="text-[10px] text-surface-400">{item.variant}</p>}
                      <p className="text-sm font-bold text-surface-900 mt-1">₦{(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2">
                  <Tag className="h-4 w-4 text-surface-400" />
                  <input type="text" placeholder="Discount code" className="flex-1 bg-transparent text-sm focus:outline-none" />
                </div>
                <button className="btn-secondary text-sm py-2 px-4">Apply</button>
              </div>

              {/* Totals */}
              <div className="space-y-2 pb-4 border-b border-surface-100">
                <div className="flex justify-between text-sm text-surface-500"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-surface-500"><span>Delivery</span><span>₦{deliveryFee.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between text-lg font-bold text-surface-900 mt-4 mb-6">
                <span>Total</span><span>₦{total.toLocaleString()}</span>
              </div>

              <button className="btn-primary w-full py-4 text-base">
                <Lock className="h-5 w-5" />
                Pay ₦{total.toLocaleString()}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-400">
                <Shield className="h-3.5 w-3.5" />
                Secure 256-bit SSL encrypted payment
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-4 border-t border-surface-100 grid grid-cols-3 gap-2">
                {[
                  { icon: CheckCircle2, text: "Verified Store" },
                  { icon: Truck, text: "Tracked Delivery" },
                  { icon: MessageCircle, text: "WhatsApp Updates" },
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
    </div>
  );
}
