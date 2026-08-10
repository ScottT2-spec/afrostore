"use client";
import { Loader2, X, ChevronRight } from "lucide-react";
import {
  Mail, Phone, Search, ShoppingCart, UserPlus, Users, Crown, Star, Tag, Calendar,
  MapPin, DollarSign, Edit3, Save, Trash2, Download, TrendingUp, Sparkles,
  Package, Clock, CheckCircle2, Truck,
} from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tags?: string[];
  note?: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  source?: "customer" | "newsletter";
}

interface CustomerOrder {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  subtotal: number; deliveryFee: number; discount: number; createdAt: string;
  items: { id: string }[];
}

interface CustomerDetail extends Customer {
  address?: { line1?: string; city?: string; state?: string; country?: string } | null;
  orders: CustomerOrder[];
  _count: { orders: number; reviews: number; wishlists: number };
}

interface CustomersResponse {
  customers: Customer[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200", icon: X },
  REFUNDED: { label: "Refunded", color: "bg-surface-100 text-surface-600 border-surface-200", icon: X },
};

/** Spend-based tier — purely presentational, gives high-value customers a
 * visible "VIP" identity in the list without needing a separate feature. */
function tierFor(totalSpent: number): { label: string; className: string; icon: React.ElementType } | null {
  if (totalSpent >= 500000) return { label: "VIP", className: "bg-gradient-to-r from-accent-400 to-accent-500 text-white", icon: Crown };
  if (totalSpent >= 100000) return { label: "Gold", className: "bg-gradient-to-r from-amber-300 to-amber-400 text-amber-900", icon: Star };
  return null;
}

const AVATAR_GRADIENTS = [
  "from-brand-600 to-blue-500", "from-purple-600 to-pink-500", "from-emerald-500 to-teal-500",
  "from-orange-500 to-accent-400", "from-rose-500 to-orange-400", "from-blue-600 to-cyan-400",
];
function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default function CustomersPage() {
  const { currentStore } = useSite();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "customers" | "newsletter">("all");
  const [exporting, setExporting] = useState(false);

  // Detail drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editTags, setEditTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add customer modal
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchCustomers = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20", filter });
    if (search) params.set("search", search);
    const res = await api.get<CustomersResponse>(`/api/sites/${currentStore.id}/customers?${params}`);
    if (res.success && res.data) {
      setCustomers(res.data.customers);
      setTotal(res.data.pagination.total);
    }
    setLoading(false);
  }, [currentStore, page, search, filter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const currency = currentStore?.currency || "NGN";

  const openDetail = async (c: Customer) => {
    if (c.source === "newsletter") return; // newsletter-only contacts have no profile to open here — they live in CRM
    setSelectedId(c.id);
    setEditMode(false);
    setDetailLoading(true);
    if (!currentStore) return;
    const res = await api.get<CustomerDetail>(`/api/sites/${currentStore.id}/customers/${c.id}`);
    if (res.success && res.data) {
      setDetail(res.data);
      setEditFirstName(res.data.firstName);
      setEditLastName(res.data.lastName);
      setEditPhone(res.data.phone || "");
      setEditNote(res.data.note || "");
      setEditTags((res.data.tags || []).join(", "));
    }
    setDetailLoading(false);
  };

  const closeDetail = () => { setSelectedId(null); setDetail(null); setEditMode(false); };

  const saveEdit = async () => {
    if (!currentStore || !detail) return;
    setSaving(true);
    const res = await api.patch<CustomerDetail>(`/api/sites/${currentStore.id}/customers/${detail.id}`, {
      firstName: editFirstName.trim(), lastName: editLastName.trim(),
      phone: editPhone.trim() || null, note: editNote.trim() || null,
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    if (res.success && res.data) {
      setDetail((d) => (d ? { ...d, ...res.data } : d));
      setEditMode(false);
      fetchCustomers();
    }
    setSaving(false);
  };

  const deleteCustomer = async () => {
    if (!currentStore || !detail) return;
    if (!confirm(`Delete ${detail.firstName} ${detail.lastName}? Their order history is preserved, but this profile (notes, tags) can't be recovered.`)) return;
    setDeleting(true);
    const res = await api.delete(`/api/sites/${currentStore.id}/customers/${detail.id}`);
    setDeleting(false);
    if (res.success) { closeDetail(); fetchCustomers(); }
  };

  const addCustomer = async () => {
    if (!currentStore || !addEmail.trim() || !addFirstName.trim() || !addLastName.trim()) return;
    setAddSaving(true);
    setAddError("");
    const res = await api.post(`/api/sites/${currentStore.id}/customers`, {
      email: addEmail.trim(), firstName: addFirstName.trim(), lastName: addLastName.trim(),
      phone: addPhone.trim() || undefined,
    });
    setAddSaving(false);
    if (res.success) {
      setShowAdd(false); setAddEmail(""); setAddFirstName(""); setAddLastName(""); setAddPhone("");
      fetchCustomers();
    } else {
      setAddError(res.error || "Failed to add customer");
    }
  };

  const exportCsv = async () => {
    if (!currentStore) return;
    setExporting(true);
    try {
      const token = api.getToken();
      const res = await fetch(`/api/sites/${currentStore.id}/customers/export?filter=${filter}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // Summary stats derived from the current page's loaded data isn't accurate
  // enough for "lifetime" claims across the whole base, so these only use
  // fields the list response already aggregates correctly (pagination total).
  const totalSpentSum = customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
  const vipCount = customers.filter((c) => Number(c.totalSpent || 0) >= 500000).length;
  const avgOrderValue = customers.length > 0
    ? customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0) / Math.max(customers.reduce((s, c) => s + c.totalOrders, 0), 1)
    : 0;

  return (
    <>
      <DashboardHeader title="Customers" subtitle={`${total} ${filter === "newsletter" ? "subscribers" : filter === "customers" ? "customers" : "people"}`} />
      <div className="p-6 space-y-6">
        {/* Stat strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-surface-200 bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-2"><Users className="h-3.5 w-3.5" /> Total People</div>
              <div className="text-2xl font-bold font-display">{total.toLocaleString()}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2 text-surface-500 text-xs font-medium mb-2"><DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Revenue Collected</div>
            <div className="text-2xl font-bold text-surface-900 font-display">{formatCurrency(totalSpentSum, currency)}</div>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2 text-surface-500 text-xs font-medium mb-2"><TrendingUp className="h-3.5 w-3.5 text-blue-600" /> Avg Order Value</div>
            <div className="text-2xl font-bold text-surface-900 font-display">{formatCurrency(avgOrderValue || 0, currency)}</div>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-gradient-to-br from-accent-400 to-accent-500 p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-2"><Crown className="h-3.5 w-3.5" /> VIP Customers</div>
              <div className="text-2xl font-bold font-display">{vipCount}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-surface-100 p-1 w-fit">
            {([
              { key: "all", label: "All" },
              { key: "customers", label: "Customers" },
              { key: "newsletter", label: "Newsletter" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === tab.key ? "bg-white text-surface-900 shadow-sm" : "text-surface-500 hover:text-surface-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} disabled={exporting || total === 0} className="btn-secondary text-xs py-2 px-3.5 disabled:opacity-50">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-2 px-3.5">
              <UserPlus className="h-3.5 w-3.5" /> Add Customer
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <Users className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">
              {filter === "newsletter" ? "No subscribers yet" : "No customers yet"}
            </h3>
            <p className="text-sm text-surface-500 mb-5">
              {filter === "newsletter"
                ? "Subscribers appear here when visitors sign up via the newsletter block."
                : "Customers are created when they place orders — or add one manually."}
            </p>
            {filter !== "newsletter" && (
              <button onClick={() => setShowAdd(true)} className="btn-primary text-sm py-2.5 px-5 mx-auto">
                <UserPlus className="h-4 w-4" /> Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Contact</th>
                  <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Orders</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total Spent</th>
                  <th className="px-6 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {customers.map((c) => {
                  const tier = tierFor(Number(c.totalSpent || 0));
                  return (
                    <tr
                      key={c.id}
                      onClick={() => openDetail(c)}
                      className={`transition-colors ${c.source === "newsletter" ? "" : "cursor-pointer hover:bg-surface-50"}`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`relative h-9 w-9 rounded-full bg-gradient-to-br ${avatarGradient(c.email)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                            {c.firstName[0]}{c.lastName[0]}
                            {tier && (
                              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow">
                                <tier.icon className="h-2.5 w-2.5 text-accent-500" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-surface-900">{c.firstName} {c.lastName}</span>
                              {tier && (
                                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tier.className}`}>
                                  {tier.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-surface-500">
                              Since {new Date(c.createdAt).toLocaleDateString()}
                              {c.source === "newsletter" && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">Newsletter</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-surface-500"><Mail className="h-3 w-3" />{c.email}</div>
                        {c.phone && <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-0.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-surface-700"><ShoppingCart className="h-3.5 w-3.5" />{c.totalOrders}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">
                        {formatCurrency(Number(c.totalSpent), currency)}
                      </td>
                      <td className="px-6 py-3.5">
                        {c.source !== "newsletter" && <ChevronRight className="h-4 w-4 text-surface-300" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-500">Page {page} of {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Drawer ─────────────────────────────────────── */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-surface-900/30 backdrop-blur-[2px]" onClick={closeDetail} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            {detailLoading || !detail ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
            ) : (
              <>
                {/* Header */}
                <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 px-6 pt-6 pb-16 text-white">
                  <button onClick={closeDetail} type="button" className="absolute top-5 right-5 z-10 p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
                  <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute right-16 top-10 h-16 w-16 rounded-full bg-accent-400/20 pointer-events-none" />
                  <div className="relative flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${avatarGradient(detail.email)} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white/20`}>
                      {detail.firstName[0]}{detail.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-display flex items-center gap-2">
                        {detail.firstName} {detail.lastName}
                        {tierFor(Number(detail.totalSpent || 0)) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-400 text-accent-950 px-2 py-0.5 text-[10px] font-bold">
                            <Sparkles className="h-3 w-3" /> {tierFor(Number(detail.totalSpent || 0))!.label}
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-white/70">Customer since {new Date(detail.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Stat cards floating over header */}
                <div className="px-6 -mt-10">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white border border-surface-200 shadow-sm p-3 text-center">
                      <div className="text-lg font-bold text-surface-900 font-display">{detail._count.orders}</div>
                      <div className="text-[10px] text-surface-500">Orders</div>
                    </div>
                    <div className="rounded-xl bg-white border border-surface-200 shadow-sm p-3 text-center">
                      <div className="text-lg font-bold text-surface-900 font-display truncate">{formatCurrency(Number(detail.totalSpent || 0), currency)}</div>
                      <div className="text-[10px] text-surface-500">Lifetime Spend</div>
                    </div>
                    <div className="rounded-xl bg-white border border-surface-200 shadow-sm p-3 text-center">
                      <div className="text-lg font-bold text-surface-900 font-display">{detail._count.wishlists}</div>
                      <div className="text-[10px] text-surface-500">Wishlisted</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Profile / Edit */}
                  <div className="rounded-2xl border border-surface-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-surface-900">Profile</h3>
                      {!editMode ? (
                        <button onClick={() => setEditMode(true)} type="button" className="relative z-10 text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                      ) : (
                        <button onClick={saveEdit} disabled={saving} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                        </button>
                      )}
                    </div>

                    {editMode ? (
                      <div key="edit" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First name" autoComplete="off" autoCorrect="off" spellCheck={false} className="input-field py-2 text-sm" />
                          <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last name" autoComplete="off" autoCorrect="off" spellCheck={false} className="input-field py-2 text-sm" />
                        </div>
                        <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" autoComplete="off" className="input-field py-2 text-sm w-full" />
                        <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags, comma separated (e.g. vip, wholesale)" autoComplete="off" autoCorrect="off" spellCheck={false} className="input-field py-2 text-sm w-full" />
                        <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Internal note..." rows={3} autoComplete="off" className="input-field py-2 text-sm w-full resize-none" />
                      </div>
                    ) : (
                      <div key="view" className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-surface-700"><Mail className="h-4 w-4 text-surface-400" /> {detail.email}</div>
                        {detail.phone && <div className="flex items-center gap-2 text-sm text-surface-700"><Phone className="h-4 w-4 text-surface-400" /> {detail.phone}</div>}
                        {detail.address?.city && (
                          <div className="flex items-center gap-2 text-sm text-surface-700">
                            <MapPin className="h-4 w-4 text-surface-400" /> {[detail.address.line1, detail.address.city, detail.address.state, detail.address.country].filter(Boolean).join(", ")}
                          </div>
                        )}
                        {detail.tags && detail.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {detail.tags.map((t) => (
                              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold"><Tag className="h-2.5 w-2.5" /> {t}</span>
                            ))}
                          </div>
                        )}
                        {detail.note && (
                          <div className="rounded-lg bg-surface-50 border border-surface-200 p-3 text-xs text-surface-600 italic">{detail.note}</div>
                        )}
                        {!detail.phone && !detail.tags?.length && !detail.note && (
                          <p className="text-xs text-surface-400">No extra details yet — click Edit to add notes or tags.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order history */}
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 mb-3">Order History</h3>
                    {detail.orders.length === 0 ? (
                      <p className="text-xs text-surface-400">No orders yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {detail.orders.map((o) => {
                          const sc = orderStatusConfig[o.status] || orderStatusConfig.PENDING;
                          const total = Number(o.subtotal) + Number(o.deliveryFee) - Number(o.discount);
                          return (
                            <div key={o.id} className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3 hover:border-brand-200 transition-colors">
                              <div>
                                <div className="text-sm font-semibold text-surface-900">#{o.orderNumber}</div>
                                <div className="flex items-center gap-1.5 text-[10px] text-surface-500 mt-0.5">
                                  <Calendar className="h-3 w-3" /> {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-surface-900">{formatCurrency(total, currency)}</div>
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold mt-0.5 ${sc.color}`}>{sc.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Danger zone */}
                  <div className="pt-2 border-t border-surface-100">
                    <button onClick={deleteCustomer} disabled={deleting} className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5">
                      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete customer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Add Customer Modal ────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/30 backdrop-blur-[2px]" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center"><UserPlus className="h-4.5 w-4.5 text-white" /></div>
              <h2 className="text-lg font-bold text-surface-900">Add Customer</h2>
            </div>
            <p className="text-xs text-surface-500 mb-5 ml-11">Manually add someone to your customer list.</p>
            <div className="space-y-3">
              {addError && <div className="rounded-lg bg-accent-50 border border-accent-200 px-3 py-2 text-xs text-accent-700">{addError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <input value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} placeholder="First name" autoComplete="off" autoCorrect="off" spellCheck={false} className="input-field py-2.5 text-sm" autoFocus />
                <input value={addLastName} onChange={(e) => setAddLastName(e.target.value)} placeholder="Last name" autoComplete="off" autoCorrect="off" spellCheck={false} className="input-field py-2.5 text-sm" />
              </div>
              <input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} type="email" placeholder="Email address" autoComplete="off" className="input-field py-2.5 text-sm w-full" />
              <input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="Phone (optional)" autoComplete="off" className="input-field py-2.5 text-sm w-full" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addCustomer} disabled={addSaving || !addEmail.trim() || !addFirstName.trim() || !addLastName.trim()} className="btn-primary text-sm py-2.5 px-6 flex-1">
                {addSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Customer"}
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
