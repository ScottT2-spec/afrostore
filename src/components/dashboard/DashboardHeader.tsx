"use client";
import { ChevronDown, Plus, X } from "lucide-react";
import { AlertTriangle, Bell, Bot, CheckCircle2, CreditCard, HelpCircle, Info, LogOut, Mail, Megaphone, Package, Search, Settings, Shield, ShoppingCart, Star, Store, User, Users } from "@/components/icons/FilledIcons";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// One row in the bell menu. Merges store notifications (new orders, low stock,
// messages, reviews...) and account notifications into a single list.
interface BellNotif {
  id: string;
  source: "site" | "user";
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data: Record<string, unknown> | null;
}

interface RawNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data: Record<string, unknown> | null;
}

const notificationIcons: Record<string, typeof Bell> = {
  ORDER: ShoppingCart,
  PAYMENT: CreditCard,
  LOW_STOCK: Package,
  REVIEW: Star,
  LEAD: Users,
  MESSAGE: Mail,
  CAMPAIGN: Megaphone,
  SYSTEM: Bell,
  SECURITY: Shield,
  WARNING: AlertTriangle,
  INFO: Info,
};

const notificationColors: Record<string, string> = {
  ORDER: "bg-blue-50 text-blue-600",
  PAYMENT: "bg-green-50 text-green-600",
  LOW_STOCK: "bg-amber-50 text-amber-600",
  REVIEW: "bg-purple-50 text-purple-600",
  LEAD: "bg-indigo-50 text-indigo-600",
  MESSAGE: "bg-sky-50 text-sky-600",
  CAMPAIGN: "bg-orange-50 text-orange-600",
  SYSTEM: "bg-surface-100 text-surface-600",
  SECURITY: "bg-red-50 text-red-600",
};

// Where clicking a notification should take the merchant
const notificationLinks: Record<string, string> = {
  ORDER: "/dashboard/orders",
  PAYMENT: "/dashboard/orders",
  LOW_STOCK: "/dashboard/inventory",
  REVIEW: "/dashboard/reviews",
  LEAD: "/dashboard/crm",
  MESSAGE: "/dashboard/messages",
  CAMPAIGN: "/dashboard/marketing",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

const POLL_MS = 30_000;

export default function DashboardHeader({
  title,
  subtitle,
  action,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { currentStore } = useSite();
  const [notifications, setNotifications] = useState<BellNotif[]>([]);
  const [siteUnread, setSiteUnread] = useState(0);
  const [userUnread, setUserUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  const unreadCount = siteUnread + userUnread;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadNotifications = useCallback(async () => {
    const [siteRes, userRes] = await Promise.all([
      currentStore
        ? api.get<{ notifications: RawNotif[]; unreadCount: number }>(`/api/sites/${currentStore.id}/notifications?limit=15`)
        : Promise.resolve(null),
      api.get<{ notifications: RawNotif[]; unreadCount: number }>(`/api/notifications?limit=15`),
    ]);

    const merged: BellNotif[] = [];
    if (siteRes?.success && siteRes.data) {
      setSiteUnread(siteRes.data.unreadCount || 0);
      for (const n of siteRes.data.notifications || []) merged.push({ ...n, source: "site" });
    } else if (!currentStore) {
      setSiteUnread(0);
    }
    if (userRes?.success && userRes.data) {
      setUserUnread(userRes.data.unreadCount || 0);
      for (const n of userRes.data.notifications || []) merged.push({ ...n, source: "user" });
    }
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(merged.slice(0, 15));
  }, [currentStore]);

  // Load on mount / store switch, poll, and refresh when the tab regains focus
  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, POLL_MS);
    const onFocus = () => loadNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  const endpointFor = (n: { source: "site" | "user" }) =>
    n.source === "site" && currentStore ? `/api/sites/${currentStore.id}/notifications` : `/api/notifications`;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setSiteUnread(0);
    setUserUnread(0);
    await Promise.all([
      currentStore ? api.patch(`/api/sites/${currentStore.id}/notifications`, { isRead: true }) : Promise.resolve(),
      api.patch(`/api/notifications`, { isRead: true }),
    ]);
  };

  const openNotification = async (n: BellNotif) => {
    setShowNotifications(false);
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      if (n.source === "site") setSiteUnread((c) => Math.max(0, c - 1));
      else setUserUnread((c) => Math.max(0, c - 1));
      api.patch(endpointFor(n), { ids: [n.id], isRead: true });
    }
    router.push(notificationLinks[n.type.toUpperCase()] || "/dashboard/notifications");
  };

  const dismissNotification = async (n: BellNotif) => {
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    if (!n.isRead) {
      if (n.source === "site") setSiteUnread((c) => Math.max(0, c - 1));
      else setUserUnread((c) => Math.max(0, c - 1));
    }
    await api.delete(`${endpointFor(n)}?id=${n.id}`);
  };

  const handleLogout = async () => {
    setShowProfile(false);
    if (logout) {
      await logout();
    }
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-100">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-surface-900">{title}</h1>
            {subtitle && (
              <p className="text-xs text-surface-500">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 w-64">
            <Search className="h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-surface-400">
              ⌘K
            </kbd>
          </div>

          {/* AI Assistant */}
          <Link
            href="/dashboard/ai"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
            title="AI Assistant"
          >
            <Bot className="h-[18px] w-[18px]" />
          </Link>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { if (!showNotifications) loadNotifications(); setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-surface-200 bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                  <h3 className="text-sm font-bold text-surface-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-500">No notifications</p>
                      <p className="text-xs text-surface-400 mt-0.5">You&apos;re all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const key = notif.type.toUpperCase();
                      const Icon = notificationIcons[key] || Bell;
                      const colorClass = notificationColors[key] || "bg-surface-100 text-surface-600";
                      return (
                        <div
                          key={`${notif.source}-${notif.id}`}
                          onClick={() => openNotification(notif)}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors cursor-pointer ${
                            !notif.isRead ? "bg-brand-50/30" : ""
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold ${!notif.isRead ? "text-surface-900" : "text-surface-600"}`}>
                                {notif.title}
                              </p>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissNotification(notif); }}
                                className="text-surface-300 hover:text-surface-500 flex-shrink-0"
                                aria-label="Dismiss notification"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-surface-400 mt-1">{timeAgo(notif.createdAt)}</p>
                          </div>
                          {!notif.isRead && (
                            <div className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-surface-100 text-center">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Action button (only render if provided) */}
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="btn-primary text-sm py-2 px-4"
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="btn-primary text-sm py-2 px-4"
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </button>
            )
          )}

          {/* User Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-surface-400 hidden sm:block transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl border border-surface-200 bg-white shadow-xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-surface-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[11px] text-surface-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { icon: User, label: "My Profile", href: "/dashboard/profile" },
                    { icon: Store, label: "My Stores", href: "/dashboard" },
                    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
                    { icon: HelpCircle, label: "Help & Support", href: "/dashboard/support" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-surface-400" />
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-surface-100 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4 text-surface-400" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
