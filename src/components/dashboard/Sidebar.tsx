"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Palette,
  Puzzle,
  Bot,
  Globe,
  CreditCard,
  Settings,
  HelpCircle,
  Receipt,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Store,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Themes", href: "/dashboard/themes", icon: Palette },
  { name: "Plugins", href: "/dashboard/plugins", icon: Puzzle },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { name: "Domains", href: "/dashboard/domains", icon: Globe },
];

const bottomNav = [
  { name: "Billing", href: "/dashboard/billing", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/support", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { currentStore, stores } = useStore();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-surface-200 bg-white transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-surface-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 shadow-md shadow-brand-600/20">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-surface-900 truncate">
              Afro<span className="text-brand-600">Store</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Store selector */}
      <div className="px-3 py-3">
        <button
          className={cn(
            "w-full flex items-center gap-2.5 rounded-xl border border-surface-200 bg-surface-50 p-2.5 transition-colors hover:bg-surface-100",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 text-white">
            <Store className="h-4 w-4" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-semibold text-surface-900 truncate">
                  {currentStore?.name || "No store yet"}
                </div>
                <div className="text-[10px] text-surface-500 truncate">
                  {currentStore ? `${currentStore.subdomain}.afrostore.com` : "Create your first store"}
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-surface-400 rotate-90" />
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm"
                  : "text-surface-500 hover:bg-surface-50 hover:text-surface-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-brand-600" : "")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-100 px-3 py-3 space-y-0.5">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-50 hover:text-surface-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* User info + logout */}
        <div className={cn("rounded-xl bg-surface-50 p-2.5 mt-2", collapsed && "text-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-surface-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-2 text-sm text-surface-500 hover:text-accent-500 transition-colors",
              collapsed ? "mx-auto" : "w-full"
            )}
          >
            <LogOut className="h-[16px] w-[16px]" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
