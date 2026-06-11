"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowRight,
  Eye,
  MoreHorizontal,
  Bot,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Total Revenue",
    value: "₦2,458,000",
    change: "+24.5%",
    trend: "up",
    icon: DollarSign,
    color: "brand",
  },
  {
    label: "Orders",
    value: "186",
    change: "+12.3%",
    trend: "up",
    icon: ShoppingCart,
    color: "blue",
  },
  {
    label: "Customers",
    value: "1,249",
    change: "+8.1%",
    trend: "up",
    icon: Users,
    color: "purple",
  },
  {
    label: "Products",
    value: "64",
    change: "+3",
    trend: "up",
    icon: Package,
    color: "accent",
  },
];

const recentOrders = [
  {
    id: "#AF-2847",
    customer: "Chioma Eze",
    items: "Ankara Dress, Gold Earrings",
    total: "₦45,000",
    status: "confirmed",
    time: "5 min ago",
    initials: "CE",
  },
  {
    id: "#AF-2846",
    customer: "Kwame Asante",
    items: "Sneakers (Size 43)",
    total: "₦28,500",
    status: "processing",
    time: "23 min ago",
    initials: "KA",
  },
  {
    id: "#AF-2845",
    customer: "Fatima Bello",
    items: "Skincare Set, Face Mask x2",
    total: "₦18,200",
    status: "shipped",
    time: "1 hour ago",
    initials: "FB",
  },
  {
    id: "#AF-2844",
    customer: "Emeka Obi",
    items: "iPhone 15 Case, AirPods Pro",
    total: "₦67,800",
    status: "delivered",
    time: "3 hours ago",
    initials: "EO",
  },
  {
    id: "#AF-2843",
    customer: "Aisha Mohammed",
    items: "Abaya Collection (3 pieces)",
    total: "₦52,000",
    status: "pending",
    time: "5 hours ago",
    initials: "AM",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  processing: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
  shipped: { label: "Shipped", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
};

const topProducts = [
  { name: "Ankara Maxi Dress", sold: 48, revenue: "₦720,000", image: "from-pink-400 to-rose-500" },
  { name: "Gold Hoop Earrings", sold: 36, revenue: "₦324,000", image: "from-amber-400 to-orange-500" },
  { name: "Leather Crossbody Bag", sold: 29, revenue: "₦435,000", image: "from-amber-600 to-yellow-600" },
  { name: "Shea Butter Skincare Set", sold: 24, revenue: "₦192,000", image: "from-green-400 to-emerald-500" },
  { name: "African Print Sneakers", sold: 21, revenue: "₦378,000", image: "from-blue-400 to-indigo-500" },
];

const aiSuggestions = [
  {
    icon: Sparkles,
    text: "3 products have low stock. Restock Ankara Maxi Dress, Gold Earrings, and Leather Bag.",
    action: "View Products",
    type: "warning",
  },
  {
    icon: TrendingUp,
    text: "Your conversion rate increased 2.1% this week. Checkout optimization is working!",
    action: "See Analytics",
    type: "success",
  },
  {
    icon: MessageCircle,
    text: "12 abandoned carts in the last 24h. Send a WhatsApp recovery message?",
    action: "Send Recovery",
    type: "action",
  },
];

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your store."
        action={{ label: "Add Product", href: "/dashboard/products" }}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isUp = stat.trend === "up";
            const colorMap: Record<string, string> = {
              brand: "bg-brand-50 text-brand-600",
              blue: "bg-blue-50 text-blue-600",
              purple: "bg-purple-50 text-purple-600",
              accent: "bg-accent-50 text-accent-600",
            };
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-surface-200 bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      isUp ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-surface-900 font-display">
                  {stat.value}
                </div>
                <div className="text-xs text-surface-500 mt-0.5">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-surface-900">
                  Revenue Overview
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Last 30 days performance
                </p>
              </div>
              <div className="flex items-center gap-1">
                {["7d", "30d", "90d", "1y"].map((period) => (
                  <button
                    key={period}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === "30d"
                        ? "bg-brand-50 text-brand-700"
                        : "text-surface-400 hover:text-surface-600 hover:bg-surface-50"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            {/* Chart visualization */}
            <div className="relative h-52">
              <div className="absolute inset-0 flex items-end gap-1.5">
                {[35, 52, 48, 65, 42, 78, 55, 82, 90, 68, 75, 88, 72, 95, 85, 60, 92, 78, 88, 96, 82, 70, 85, 92, 88, 95, 80, 90, 98, 86].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600 to-brand-500 transition-all hover:from-brand-700 hover:to-brand-600 cursor-pointer"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-surface-400 -ml-1">
                <span>₦100k</span>
                <span>₦75k</span>
                <span>₦50k</span>
                <span>₦25k</span>
                <span>₦0</span>
              </div>
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900">
                  AI Insights
                </h3>
                <p className="text-[10px] text-surface-500">
                  Your commerce co-founder
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, i) => {
                const SugIcon = suggestion.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-surface-100 bg-surface-50 p-3 hover:bg-surface-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <SugIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        suggestion.type === "warning" ? "text-amber-500" :
                        suggestion.type === "success" ? "text-green-500" :
                        "text-brand-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-surface-600 leading-relaxed">
                          {suggestion.text}
                        </p>
                        <button className="mt-2 text-[10px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                          {suggestion.action}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/ai"
              className="mt-4 w-full btn-secondary text-xs py-2"
            >
              <Bot className="h-3.5 w-3.5" />
              Open AI Assistant
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h3 className="text-base font-bold text-surface-900">
                  Recent Orders
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Latest transactions from your store
                </p>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-surface-100">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden sm:table-cell">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {recentOrders.map((order) => {
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-surface-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-3.5">
                          <div className="text-sm font-semibold text-surface-900">
                            {order.id}
                          </div>
                          <div className="text-[10px] text-surface-400">
                            {order.time}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                              {order.initials}
                            </div>
                            <span className="text-sm text-surface-700">
                              {order.customer}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-surface-500 truncate max-w-[200px] block">
                            {order.items}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${status.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-semibold text-surface-900">
                            {order.total}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-surface-900">
                Top Products
              </h3>
              <Link
                href="/dashboard/products"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div
                  key={product.name}
                  className="flex items-center gap-3"
                >
                  <div className="text-xs font-bold text-surface-300 w-4">
                    {i + 1}
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${product.image} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-[10px] text-surface-500">
                      {product.sold} sold
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-surface-900">
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
