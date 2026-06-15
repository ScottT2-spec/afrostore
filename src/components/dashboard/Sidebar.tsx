"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
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
  ChevronDown,
  LogOut,
  Plus,
  Store,
  Link2,
  FileText,
  Tag,
  Truck,
  FolderTree,
  Star,
  UserPlus,
  Zap,
  RotateCcw,
  Crown,
  ExternalLink,
  Home,
  Info,
  Phone,
  HelpCircle as FAQIcon,
  ScrollText,
  File,
  Mail,
} from "lucide-react";

// ─── Page type icons ───────────────────────────────────────
const pageTypeIcons: Record<string, React.ElementType> = {
  HOME: Home,
  ABOUT: Info,
  CONTACT: Phone,
  FAQ: FAQIcon,
  POLICY: ScrollText,
  CUSTOM: File,
  LANDING: FileText,
};

// ─── Nav groups ────────────────────────────────────────────
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Store",
    items: [
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Categories", href: "/dashboard/categories", icon: FolderTree },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Reviews", href: "/dashboard/reviews", icon: Star },
      { name: "Messages", href: "/dashboard/messages", icon: Mail },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Coupons", href: "/dashboard/coupons", icon: Tag },
      { name: "Flash Sales", href: "/dashboard/flash-sales", icon: Zap },
      { name: "Referrals", href: "/dashboard/referrals", icon: Link2 },
      { name: "Loyalty", href: "/dashboard/loyalty", icon: Crown },
      { name: "Abandoned Carts", href: "/dashboard/abandoned-carts", icon: RotateCcw },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Delivery", href: "/dashboard/delivery", icon: Truck },
      { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
      { name: "Team", href: "/dashboard/team", icon: UserPlus },
      { name: "Themes", href: "/dashboard/themes", icon: Palette },
      { name: "Plugins", href: "/dashboard/plugins", icon: Puzzle },
      { name: "Domains", href: "/dashboard/domains", icon: Globe },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "",
    items: [
      { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
    ],
  },
];

const bottomNav = [
  { name: "Billing", href: "/dashboard/billing", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/support", icon: HelpCircle },
];

// ─── Store page type ───────────────────────────────────────
interface StorePage {
  id: string;
  title: string;
  slug: string;
  type: string;
  isPublished: boolean;
}

const pageTypeSortOrder: Record<string, number> = {
  HOME: 0, ABOUT: 1, CONTACT: 2, FAQ: 3, POLICY: 4, LANDING: 5, CUSTOM: 6,
};

// ─── Component ─────────────────────────────────────────────

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);
  const [storePages, setStorePages] = useState<StorePage[]>([]);
  const { user, logout } = useAuth();
  const { currentStore, stores, setCurrentStore } = useStore();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  // Fetch store pages for sidebar
  const fetchPages = useCallback(async () => {
    if (!currentStore) return;
    try {
      const res = await api.get<{ pages: StorePage[] }>(`/api/stores/${currentStore.id}/pages?limit=20`);
      if (res.success && res.data) {
        const pages = res.data.pages || (Array.isArray(res.data) ? res.data as unknown as StorePage[] : []);
        pages.sort((a, b) => {
          const aOrder = pageTypeSortOrder[a.type] ?? 99;
          const bOrder = pageTypeSortOrder[b.type] ?? 99;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.title.localeCompare(b.title);
        });
        setStorePages(pages);
      }
    } catch { /* silent */ }
  }, [currentStore]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  // Render a nav link
  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
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
  };

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

      {/* Store selector + View Store */}
      <div className="px-3 py-3 space-y-2 border-b border-surface-100 relative">
        <button
          onClick={() => !collapsed && setStoreDropdownOpen(!storeDropdownOpen)}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-xl border border-surface-200 bg-surface-50 p-2.5 transition-colors hover:bg-surface-100",
            storeDropdownOpen && "border-brand-300 bg-brand-50",
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
              <ChevronRight className={cn("h-3.5 w-3.5 text-surface-400 transition-transform", storeDropdownOpen ? "rotate-180" : "rotate-90")} />
            </>
          )}
        </button>

        {/* Store dropdown */}
        {storeDropdownOpen && !collapsed && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setStoreDropdownOpen(false)} />
            <div className="absolute left-3 right-3 top-[60px] z-50 rounded-xl border border-surface-200 bg-white shadow-xl overflow-hidden">
              {stores.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto">
                  {stores.map((s) => {
                    const isActive = currentStore?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setCurrentStore(s); setStoreDropdownOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-50",
                          isActive && "bg-brand-50"
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white text-[10px] font-bold",
                          isActive ? "bg-brand-600" : "bg-gradient-to-br from-accent-400 to-accent-600"
                        )}>
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-xs font-semibold truncate", isActive ? "text-brand-700" : "text-surface-900")}>{s.name}</div>
                          <div className="text-[10px] text-surface-400 truncate">{s.subdomain}.afrostore.com</div>
                        </div>
                        {isActive && <div className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {stores.length > 0 && <div className="border-t border-surface-100" />}
              <Link
                href="/dashboard/new-store"
                onClick={() => setStoreDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-50"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-surface-300 text-surface-400">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-surface-600">Create New Store</span>
              </Link>
            </div>
          </>
        )}

        {currentStore && (
          <Link
            href={`/store/${currentStore.slug}`}
            target="_blank"
            className={cn(
              "w-full flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100",
              collapsed ? "justify-center p-2" : "px-3 py-2"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">View My Store</span>}
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(group.label ? "mt-4 first:mt-0" : "")}>
            {/* Group label */}
            {group.label && !collapsed && (
              <div className="px-3 py-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            {collapsed && group.label && (
              <div className="my-2 mx-2 border-t border-surface-100" />
            )}

            {/* Group items */}
            <div className="space-y-0.5">
              {group.items.map((item) => renderNavLink(item))}
            </div>

            {/* Pages tree — after the Store group */}
            {group.label === "Store" && storePages.length > 0 && !collapsed && (
              <div className="mt-1">
                <button
                  onClick={() => setPagesOpen(!pagesOpen)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-900 transition-all"
                >
                  <FileText className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="flex-1 text-left">Pages</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", pagesOpen && "rotate-180")} />
                </button>

                {pagesOpen && (
                  <div className="ml-4 pl-4 border-l border-surface-100 space-y-0.5 mt-0.5">
                    {storePages.map((page) => {
                      const PageIcon = pageTypeIcons[page.type] || File;
                      const pageHref = currentStore
                        ? `/store/${currentStore.slug}${page.type === "HOME" ? "" : `/${page.slug}`}`
                        : "#";

                      return (
                        <div key={page.id} className="flex items-center group">
                          <Link
                            href={`/builder/${page.id}`}
                            onClick={onNavigate}
                            className="flex-1 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-900 transition-all"
                          >
                            <PageIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{page.title}</span>
                            {!page.isPublished && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-surface-100 text-surface-400 font-bold">DRAFT</span>
                            )}
                          </Link>
                          {page.isPublished && currentStore && (
                            <Link
                              href={pageHref}
                              target="_blank"
                              className="p-1 rounded text-surface-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all"
                              title={`View ${page.title}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                    <Link
                      href="/dashboard/pages"
                      onClick={onNavigate}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Manage Pages</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Collapsed: just show Pages icon */}
            {group.label === "Store" && storePages.length > 0 && collapsed && (
              <Link
                href="/dashboard/pages"
                className="flex items-center justify-center rounded-xl px-2 py-2 text-surface-500 hover:bg-surface-50 hover:text-surface-900 transition-all"
              >
                <FileText className="h-[18px] w-[18px]" />
              </Link>
            )}
          </div>
        ))}
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
