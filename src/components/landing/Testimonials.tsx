"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amara Okafor",
    role: "Fashion Seller, Lagos",
    content:
      "I was selling only through WhatsApp and Instagram DMs. AfroStore gave me a real store in literally 5 minutes. My sales tripled in the first month because customers could finally browse and pay directly.",
    rating: 5,
    initials: "AO",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Kwame Mensah",
    role: "Electronics, Accra",
    content:
      "The AI wrote better product descriptions than I ever could. And the delivery zone feature? Game changer. I can set different fees for Accra, Tema, and Kumasi. No other platform does this so easily.",
    rating: 5,
    initials: "KM",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Fatima Hassan",
    role: "Beauty Brand, Nairobi",
    content:
      "I tried Shopify but it felt so foreign — the payments, the shipping, everything. AfroStore just gets it. M-Pesa integration, local delivery, WhatsApp notifications. It's built for us.",
    rating: 5,
    initials: "FH",
    gradient: "from-rose-500 to-orange-500",
  },
  {
    name: "Chidi Eze",
    role: "Food Delivery, Abuja",
    content:
      "The template for food businesses had everything I needed — menu display, delivery zones, order notifications to my WhatsApp. I launched my delivery service in one afternoon.",
    rating: 5,
    initials: "CE",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Nana Ama",
    role: "Agency Owner, Kumasi",
    content:
      "I manage 12 client stores from one dashboard. The agency plan pays for itself with just two clients. My clients love how easy it is to manage their own products and orders.",
    rating: 5,
    initials: "NA",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    name: "Ibrahim Musa",
    role: "Mini Importer, Kano",
    content:
      "Bank transfer checkout is the best feature. Most of my customers don't use cards. With Monnify integration, they transfer and the order confirms automatically. Before, I was checking screenshots manually.",
    rating: 5,
    initials: "IM",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-4">
            <Star className="h-3.5 w-3.5 fill-brand-600" />
            Loved Across Africa
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight text-balance">
            5,000+ Businesses{" "}
            <span className="gradient-text">Trust AfroStore</span>
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Real stories from real sellers who transformed their business.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-surface-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Quote className="h-8 w-8 text-brand-200 mb-4" />
              <p className="text-surface-600 leading-relaxed mb-6 text-sm">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-surface-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-surface-500">{t.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
