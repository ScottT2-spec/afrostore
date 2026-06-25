"use client";
import { ArrowRight } from "lucide-react";
import { Eye, Sparkles, Star } from "@/components/icons/FilledIcons";

import Link from "next/link";

const templates = [
  {
    name: "Lagos Fashion",
    category: "Fashion & Apparel",
    description: "Bold, vibrant fashion store for streetwear and African prints",
    gradient: "from-purple-500 via-pink-500 to-orange-400",
    tags: ["Fashion", "Streetwear"],
    rating: 4.9,
    uses: "2.3k",
    free: true,
  },
  {
    name: "Nairobi Fresh",
    category: "Food & Restaurant",
    description: "Clean, appetizing layout for restaurants and food delivery",
    gradient: "from-accent-400 via-accent-500 to-brand-600",
    tags: ["Food", "Delivery"],
    rating: 4.8,
    uses: "1.8k",
    free: true,
  },
  {
    name: "Accra Beauty",
    category: "Beauty & Skincare",
    description: "Luxury beauty and skincare store with premium product showcase",
    gradient: "from-rose-400 via-fuchsia-500 to-indigo-500",
    tags: ["Beauty", "Premium"],
    rating: 4.9,
    uses: "3.1k",
    free: false,
  },
  {
    name: "Abuja Tech",
    category: "Electronics",
    description: "Modern electronics and gadget store with comparison features",
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    tags: ["Tech", "Gadgets"],
    rating: 4.7,
    uses: "1.5k",
    free: true,
  },
  {
    name: "Kigali Minimal",
    category: "General Store",
    description: "Clean, minimalist all-purpose store — works for anything",
    gradient: "from-brand-500 via-emerald-500 to-teal-400",
    tags: ["Minimal", "Versatile"],
    rating: 4.8,
    uses: "4.2k",
    free: true,
  },
  {
    name: "Dakar Luxe",
    category: "Luxury & Jewelry",
    description: "High-end luxury store for jewelry, watches, and premium goods",
    gradient: "from-amber-400 via-yellow-500 to-orange-400",
    tags: ["Luxury", "Premium"],
    rating: 5.0,
    uses: "890",
    free: false,
  },
];

export default function Templates() {
  return (
    <section id="templates" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Templates
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight text-balance">
            Stunning Templates for{" "}
            <span className="gradient-text">Every Business</span>
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Designed for African markets. Mobile-first. Conversion-optimized. Just pick one and customize.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.name}
              className="group relative rounded-2xl border border-surface-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Preview */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-90`}
                />
                {/* Fake store layout */}
                <div className="absolute inset-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 w-20 rounded bg-white/30" />
                    <div className="flex gap-2">
                      <div className="h-5 w-12 rounded bg-white/20" />
                      <div className="h-5 w-12 rounded bg-white/20" />
                    </div>
                  </div>
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/30" />
                      <div className="h-3 w-1/2 rounded bg-white/20" />
                      <div className="mt-3 h-8 w-28 rounded-lg bg-white/40" />
                    </div>
                    <div className="w-1/2 rounded-lg bg-white/20" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-white/15"
                      />
                    ))}
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-surface-900 shadow-lg hover:bg-surface-50 transition-colors">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-brand-700 transition-colors">
                      Use Template
                    </button>
                  </div>
                </div>
                {/* Badge */}
                {!template.free && (
                  <div className="absolute top-3 right-3 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                    Premium
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-surface-900">
                      {template.name}
                    </h3>
                    <p className="text-xs text-surface-500">
                      {template.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-surface-700">
                      {template.rating}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-surface-500 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-medium text-surface-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-surface-400">
                    {template.uses} stores
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-10 text-center">
          <Link
            href="#"
            className="btn-secondary text-sm"
          >
            Browse All Templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
