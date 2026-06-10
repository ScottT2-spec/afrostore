"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  ArrowUpDown,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";

const orders = [
  { id: "#AF-2847", customer: "Chioma Eze", email: "chioma@gmail.com", phone: "+234 812 345 6789", items: [{ name: "Ankara Maxi Dress", qty: 1, price: 15000 }, { name: "Gold Hoop Earrings", qty: 1, price: 9000 }], total: 26500, delivery: 2500, status: "confirmed", payment: "paid", method: "Paystack (Card)", date: "2025-01-15 14:23", address: "12 Admiralty Way, Lekki Phase 1, Lagos", initials: "CE" },
  { id: "#AF-2846", customer: "Kwame Asante", email: "kwame@gmail.com", phone: "+233 24 567 8901", items: [{ name: "African Print Sneakers", qty: 1, price: 18000 }], total: 20500, delivery: 2500, status: "processing", payment: "paid", method: "Flutterwave (Mobile Money)", date: "2025-01-15 13:45", address: "14 Oxford Street, Osu, Accra", initials: "KA" },
  { id: "#AF-2845", customer: "Fatima Bello", email: "fatima@yahoo.com", phone: "+234 803 456 7890", items: [{ name: "Shea Butter Skincare Set", qty: 1, price: 8000 }, { name: "Coconut Oil Hair Treatment", qty: 2, price: 9000 }], total: 19500, delivery: 2500, status: "shipped", payment: "paid", method: "Monnify (Bank Transfer)", date: "2025-01-15 11:20", address: "7 Gwarimpa Estate, Abuja", initials: "FB" },
  { id: "#AF-2844", customer: "Emeka Obi", email: "emeka@outlook.com", phone: "+234 706 789 0123", items: [{ name: "Leather Crossbody Bag", qty: 1, price: 15000 }, { name: "Beaded Statement Necklace", qty: 2, price: 13000 }], total: 31000, delivery: 3000, status: "delivered", payment: "paid", method: "Paystack (Card)", date: "2025-01-14 16:50", address: "23 Trans Amadi, Port Harcourt", initials: "EO" },
  { id: "#AF-2843", customer: "Aisha Mohammed", email: "aisha@gmail.com", phone: "+234 809 012 3456", items: [{ name: "Ankara Maxi Dress", qty: 3, price: 45000 }], total: 47500, delivery: 2500, status: "pending", payment: "pending", method: "Monnify (Bank Transfer)", date: "2025-01-14 09:15", address: "5 Sani Abacha Way, Kano", initials: "AM" },
  { id: "#AF-2842", customer: "Ngozi Adaeze", email: "ngozi@gmail.com", phone: "+234 815 678 9012", items: [{ name: "Gold Hoop Earrings", qty: 2, price: 18000 }], total: 20500, delivery: 2500, status: "cancelled", payment: "refunded", method: "Paystack (Card)", date: "2025-01-13 22:30", address: "18 New Market Road, Onitsha", initials: "NA" },
  { id: "#AF-2841", customer: "Tunde Bakare", email: "tunde@hotmail.com", phone: "+234 708 234 5678", items: [{ name: "Dashiki Summer Shirt", qty: 1, price: 12000 }, { name: "African Print Sneakers", qty: 1, price: 18000 }], total: 33000, delivery: 3000, status: "delivered", payment: "paid", method: "Flutterwave (USSD)", date: "2025-01-13 15:10", address: "42 Ring Road, Ibadan", initials: "TB" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  processing: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
  shipped: { label: "Shipped", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const paymentConfig: Record<string, { color: string }> = {
  paid: { color: "bg-green-50 text-green-700 border-green-200" },
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  refunded: { color: "bg-red-50 text-red-600 border-red-200" },
};

const statusFilters = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);

  return (
    <>
      <DashboardHeader
        title="Orders"
        subtitle={`${orders.length} orders total`}
      />

      <div className="p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: "186", sub: "This month", color: "text-surface-900" },
            { label: "Pending", value: "12", sub: "Needs attention", color: "text-yellow-600" },
            { label: "Processing", value: "8", sub: "In progress", color: "text-purple-600" },
            { label: "Revenue", value: "₦2.4M", sub: "+24% vs last month", color: "text-brand-600" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-surface-200 bg-white p-4">
              <p className="text-xs text-surface-500 font-medium">{card.label}</p>
              <p className={`text-2xl font-bold font-display mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-surface-400" />
            <input type="text" placeholder="Search orders..." className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selectedFilter === f ? "bg-brand-50 text-brand-700 border border-brand-200" : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="btn-secondary text-xs py-2 px-3 ml-auto">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-6 py-3 text-left"><input type="checkbox" className="rounded border-surface-300" /></th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Order</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden lg:table-cell">Date</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Payment</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const payment = paymentConfig[order.payment];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={order.id} className="hover:bg-surface-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="px-6 py-3.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-surface-300" /></td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-semibold text-surface-900">{order.id}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">{order.initials}</div>
                          <div>
                            <div className="text-sm font-medium text-surface-900">{order.customer}</div>
                            <div className="text-[10px] text-surface-400">{order.items.length} item{order.items.length > 1 ? "s" : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell"><span className="text-xs text-surface-500">{order.date}</span></td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />{status.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${payment.color}`}>{order.payment}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right"><span className="text-sm font-bold text-surface-900">₦{order.total.toLocaleString()}</span></td>
                      <td className="px-6 py-3.5">
                        <button className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100"><MoreHorizontal className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-surface-100 bg-surface-50">
            <span className="text-xs text-surface-500">Showing 1-7 of 186 orders</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-surface-400 hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
              {[1, 2, 3, "...", 27].map((p, i) => (
                <button key={i} className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${p === 1 ? "bg-brand-600 text-white" : "text-surface-500 hover:bg-white"}`}>{p}</button>
              ))}
              <button className="p-1.5 rounded-lg text-surface-400 hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Slide-over */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-surface-100 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Order {selectedOrder.id}</h2>
                <p className="text-xs text-surface-500">{selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg text-surface-400 hover:bg-surface-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig[selectedOrder.status].color}`}>
                  {(() => { const Icon = statusConfig[selectedOrder.status].icon; return <Icon className="h-3.5 w-3.5" />; })()}
                  {statusConfig[selectedOrder.status].label}
                </span>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${paymentConfig[selectedOrder.payment].color}`}>{selectedOrder.payment}</span>
              </div>

              {/* Customer Info */}
              <div className="rounded-xl border border-surface-200 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-surface-900">Customer</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">{selectedOrder.initials}</div>
                  <div>
                    <div className="text-sm font-semibold text-surface-900">{selectedOrder.customer}</div>
                    <div className="text-xs text-surface-500">{selectedOrder.email}</div>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-surface-100">
                  <div className="flex items-center gap-2 text-xs text-surface-600"><Phone className="h-3.5 w-3.5 text-surface-400" />{selectedOrder.phone}</div>
                  <div className="flex items-center gap-2 text-xs text-surface-600"><Mail className="h-3.5 w-3.5 text-surface-400" />{selectedOrder.email}</div>
                  <div className="flex items-start gap-2 text-xs text-surface-600"><MapPin className="h-3.5 w-3.5 text-surface-400 mt-0.5" />{selectedOrder.address}</div>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-xl border border-surface-200 p-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-200 to-accent-200" />
                        <div>
                          <div className="text-sm font-medium text-surface-900">{item.name}</div>
                          <div className="text-[10px] text-surface-400">Qty: {item.qty}</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-surface-900">₦{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-surface-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-surface-500"><span>Subtotal</span><span>₦{(selectedOrder.total - selectedOrder.delivery).toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs text-surface-500"><span>Delivery</span><span>₦{selectedOrder.delivery.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm font-bold text-surface-900 pt-1.5 border-t border-surface-100"><span>Total</span><span>₦{selectedOrder.total.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-xl border border-surface-200 p-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-2">Payment</h3>
                <div className="flex items-center gap-2 text-xs text-surface-600"><CreditCard className="h-3.5 w-3.5 text-surface-400" />{selectedOrder.method}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="btn-primary flex-1 text-sm"><CheckCircle2 className="h-4 w-4" />Update Status</button>
                <button className="btn-secondary text-sm"><MessageCircle className="h-4 w-4" />WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
