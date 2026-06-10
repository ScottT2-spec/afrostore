"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Search, MoreHorizontal, Mail, Phone, MapPin, ShoppingCart, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const customers = [
  { id: "1", name: "Chioma Eze", email: "chioma@gmail.com", phone: "+234 812 345 6789", location: "Lagos, Nigeria", orders: 12, spent: 285000, lastOrder: "5 min ago", initials: "CE", gradient: "from-pink-400 to-rose-500" },
  { id: "2", name: "Kwame Asante", email: "kwame@gmail.com", phone: "+233 24 567 8901", location: "Accra, Ghana", orders: 8, spent: 195000, lastOrder: "23 min ago", initials: "KA", gradient: "from-blue-400 to-indigo-500" },
  { id: "3", name: "Fatima Bello", email: "fatima@yahoo.com", phone: "+234 803 456 7890", location: "Abuja, Nigeria", orders: 15, spent: 412000, lastOrder: "1 hour ago", initials: "FB", gradient: "from-amber-400 to-orange-500" },
  { id: "4", name: "Emeka Obi", email: "emeka@outlook.com", phone: "+234 706 789 0123", location: "Port Harcourt, Nigeria", orders: 6, spent: 168000, lastOrder: "3 hours ago", initials: "EO", gradient: "from-green-400 to-emerald-500" },
  { id: "5", name: "Aisha Mohammed", email: "aisha@gmail.com", phone: "+234 809 012 3456", location: "Kano, Nigeria", orders: 22, spent: 680000, lastOrder: "5 hours ago", initials: "AM", gradient: "from-purple-400 to-violet-500" },
  { id: "6", name: "Ngozi Adaeze", email: "ngozi@gmail.com", phone: "+234 815 678 9012", location: "Onitsha, Nigeria", orders: 3, spent: 72000, lastOrder: "1 day ago", initials: "NA", gradient: "from-teal-400 to-cyan-500" },
  { id: "7", name: "Tunde Bakare", email: "tunde@hotmail.com", phone: "+234 708 234 5678", location: "Ibadan, Nigeria", orders: 9, spent: 245000, lastOrder: "2 days ago", initials: "TB", gradient: "from-red-400 to-pink-500" },
  { id: "8", name: "Nana Ama Serwaa", email: "nana@gmail.com", phone: "+233 50 123 4567", location: "Kumasi, Ghana", orders: 5, spent: 135000, lastOrder: "3 days ago", initials: "NS", gradient: "from-yellow-400 to-amber-500" },
];

export default function CustomersPage() {
  return (
    <>
      <DashboardHeader title="Customers" subtitle={`${customers.length} registered customers`} />
      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: "1,249", icon: "👥" },
            { label: "Repeat Buyers", value: "68%", icon: "🔄" },
            { label: "Avg. Order Value", value: "₦24,500", icon: "💰" },
            { label: "New This Month", value: "+89", icon: "📈" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-surface-200 bg-white p-4">
              <p className="text-xs text-surface-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold font-display text-surface-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-surface-400" />
          <input type="text" placeholder="Search customers..." className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Location</th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Orders</th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total Spent</th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden lg:table-cell">Last Order</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-50 transition-colors cursor-pointer">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-[10px] font-bold`}>{c.initials}</div>
                      <div>
                        <div className="text-sm font-semibold text-surface-900">{c.name}</div>
                        <div className="text-[10px] text-surface-400">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 hidden md:table-cell"><span className="text-xs text-surface-500">{c.location}</span></td>
                  <td className="px-6 py-3.5"><span className="text-sm font-medium text-surface-700">{c.orders}</span></td>
                  <td className="px-6 py-3.5"><span className="text-sm font-bold text-surface-900">₦{c.spent.toLocaleString()}</span></td>
                  <td className="px-6 py-3.5 hidden lg:table-cell"><span className="text-xs text-surface-500">{c.lastOrder}</span></td>
                  <td className="px-6 py-3.5"><button className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
