"use client";
import { ChevronRight, Loader2, LogOut } from "lucide-react";
import {
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  User,
  Award,
} from "@/components/icons/FilledIcons";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
}

interface CustomerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: any;
  totalOrders: number;
  totalSpent: number;
}

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = {
    NGN: "₦",
    KES: "KSh",
    GHS: "GH₵",
    ZAR: "R",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "shipped":
    case "in_transit":
      return "bg-blue-100 text-blue-700";
    case "processing":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

type Tab = "orders" | "wishlist" | "addresses" | "loyalty" | "settings";

export default function MyAccountPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "loyalty" || tab === "orders" || tab === "wishlist" || tab === "addresses" || tab === "settings") {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Editable fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Loyalty
  const [loyalty, setLoyalty] = useState<{
    enabled: boolean; isMember?: boolean; availablePoints: number; totalPoints: number; redeemedPoints: number;
    tier: string; redemptionRate: number; minRedeemPoints: number;
    transactions: { id: string; type: string; points: number; description: string; createdAt: string }[];
  } | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(
          `afrostore_customer_token_${slug}`
        );
        const res = await fetch(`/api/storefront/${slug}/auth/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();

        if (json.success && json.data) {
          setCustomer(json.data);
          setAuthenticated(true);
          setEditFirstName(json.data.firstName);
          setEditLastName(json.data.lastName);
          setEditPhone(json.data.phone || "");

          // Load orders
          const ordersRes = await fetch(
            `/api/storefront/${slug}/orders?email=${encodeURIComponent(json.data.email)}`
          );
          const ordersJson = await ordersRes.json();
          if (ordersJson.success && ordersJson.data) {
            setOrders(ordersJson.data);
          }
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [slug]);

  // Lazy-load loyalty data the first time that tab is opened
  useEffect(() => {
    if (activeTab !== "loyalty" || !authenticated || loyalty || loyaltyLoading) return;
    setLoyaltyLoading(true);
    const token = localStorage.getItem(`afrostore_customer_token_${slug}`);
    fetch(`/api/storefront/${slug}/loyalty/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((json) => { if (json.success && json.data) setLoyalty(json.data); })
      .catch(() => {})
      .finally(() => setLoyaltyLoading(false));
  }, [activeTab, authenticated, loyalty, loyaltyLoading, slug]);

  const joinRewards = async () => {
    setJoining(true);
    const token = localStorage.getItem(`afrostore_customer_token_${slug}`);
    try {
      const res = await fetch(`/api/storefront/${slug}/loyalty/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: "{}",
      });
      const json = await res.json();
      if (json.success) {
        setLoyalty(null); // force refetch with fresh member state
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem(
        `afrostore_customer_token_${slug}`
      );
      await fetch(`/api/storefront/${slug}/auth/me`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      /* ignore */
    }
    localStorage.removeItem(`afrostore_customer_token_${slug}`);
    localStorage.removeItem(`afrostore_customer_${slug}`);
    router.push(`/store/${slug}/login`);
  };

  const handleSaveSettings = async () => {
    // For now, update localStorage (full profile update API can be added later)
    setSaving(true);
    setSaveMsg("");
    try {
      localStorage.setItem(
        `afrostore_customer_${slug}`,
        JSON.stringify({
          id: customer?.id,
          name: `${editFirstName} ${editLastName}`,
          email: customer?.email,
          phone: editPhone,
        })
      );
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("Failed to save");
    }
    setSaving(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (authenticated === false) {
    router.push(`/store/${slug}/login?redirect=/store/${slug}/my-account`);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "loyalty", label: "Rewards", icon: Award },
    { id: "settings", label: "Settings", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href={`/store/${slug}`}
            className="flex items-center gap-2 text-gray-900 font-bold text-lg"
          >
            <ShoppingBag className="h-5 w-5" /> Store
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {customer?.firstName} {customer?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={`/store/${slug}`} className="hover:text-gray-600">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">My Account</span>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Order History
                </h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No orders yet</p>
                    <Link
                      href={`/store/${slug}/shop`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Start Shopping →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/store/${slug}/order-tracking?order=${order.orderNumber}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                            {order.itemCount} item
                            {order.itemCount > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(order.total, order.currency)}
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Wishlist</h2>
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">
                    View and manage your saved items.
                  </p>
                  <Link
                    href={`/store/${slug}/wishlist`}
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    <Heart className="h-4 w-4" /> Go to Wishlist
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Saved Addresses
                </h2>
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Your delivery addresses will appear here after your first
                    order.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "loyalty" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Rewards</h2>
                {loyaltyLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-300" /></div>
                ) : !loyalty || !loyalty.enabled ? (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">This store doesn't have a rewards program yet.</p>
                  </div>
                ) : !loyalty.isMember ? (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-900 font-semibold mb-1">Join Rewards</p>
                    <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">Earn points on every purchase and redeem them for discounts at checkout. Free to join.</p>
                    <button
                      onClick={joinRewards}
                      disabled={joining}
                      className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {joining ? "Joining..." : "Join Rewards"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      <div className="rounded-xl bg-gray-900 text-white p-4">
                        <p className="text-2xl font-bold">{loyalty.availablePoints.toLocaleString()}</p>
                        <p className="text-xs text-gray-300 mt-1">Available points</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-2xl font-bold text-gray-900 capitalize">{loyalty.tier}</p>
                        <p className="text-xs text-gray-500 mt-1">Tier</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-4 col-span-2 sm:col-span-1">
                        <p className="text-2xl font-bold text-gray-900">{loyalty.totalPoints.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Lifetime earned</p>
                      </div>
                    </div>
                    {loyalty.availablePoints < loyalty.minRedeemPoints && loyalty.minRedeemPoints > 0 && (
                      <p className="text-xs text-gray-500 mb-4">
                        Earn {loyalty.minRedeemPoints - loyalty.availablePoints} more points to unlock redeeming them at checkout (minimum {loyalty.minRedeemPoints} points).
                      </p>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent activity</h3>
                    {loyalty.transactions.length === 0 ? (
                      <p className="text-sm text-gray-500">No activity yet — points show up here as you shop.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {loyalty.transactions.map((t) => (
                          <div key={t.id} className="flex items-center justify-between py-2.5">
                            <div>
                              <p className="text-sm text-gray-900">{t.description}</p>
                              <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-sm font-semibold ${t.points >= 0 ? "text-green-600" : "text-gray-500"}`}>
                              {t.points >= 0 ? "+" : ""}{t.points.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Account Settings
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customer?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First name
                      </label>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last name
                      </label>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      placeholder="+234..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    {saveMsg && (
                      <span className="text-sm text-green-600">{saveMsg}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
