"use client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { name: "Products", href: "/dashboard/products" },
  { name: "Categories", href: "/dashboard/categories" },
  { name: "Brands", href: "/dashboard/brands" },
  { name: "Tax Rates", href: "/dashboard/taxes" },
];

export default function ProductsSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex items-center gap-1 rounded-2xl border border-surface-200 bg-white px-2 py-1 overflow-x-auto">
      <button
        onClick={() => window.history.back()}
        className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-surface-200 text-surface-500 hover:bg-surface-50 transition-colors"
        aria-label="Back"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? "border-accent-400 text-surface-900 font-semibold"
                : "border-transparent text-surface-400 hover:text-surface-600"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
