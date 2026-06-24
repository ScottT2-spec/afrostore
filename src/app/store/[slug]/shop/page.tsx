"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Menu,
  X,
  Star,
  Heart,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ImageIcon,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
} from "lucide-react";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";

/* ───────── Types ───────── */

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock?: number;
  inStock: boolean;
  isFeatured: boolean;
  tags: string[];
  images: ProductImage[];
  category?: ProductCategory;
  reviewCount: number;
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface StoreData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    currency: string;
  };
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
  categories: StoreCategory[];
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  theme: ThemeData | null;
}

/* ───────── Helpers ───────── */

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-amber-600 to-yellow-600",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-red-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-purple-400 to-violet-500",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return sorted.sort((a, b) => Number(b.price) - Number(a.price));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted;
  }
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
};

/* ───────── Component ───────── */

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, pages: 0 });
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const cartKey = `afrostore_cart_${slug}`;
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: Product }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });
  const [mobileMenu, setMobileMenu] = useState(false);

  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(storeData?.store?.id || "");

  // Update URL params
  const updateParams = useCallback(
    (cat: string, search: string) => {
      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      if (search) params.set("search", search);
      const qs = params.toString();
      router.replace(`/store/${slug}/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [slug, router]
  );

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "24");
        if (selectedCategory) params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/storefront/${slug}?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          if (!storeData || page === 1) {
            setStoreData(json.data);
            setCategories(json.data.categories);
          }

          if (append) {
            setProducts((prev) => [...prev, ...json.data.products]);
          } else {
            setProducts(json.data.products);
          }
          setPagination(json.data.pagination);
        } else {
          setError(json.error || "Failed to load products");
        }
      } catch {
        setError("Failed to load products");
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [slug, selectedCategory, searchQuery, storeData]
  );

  // Initial load + refetch on filter changes
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  // Save cart to localStorage
  useEffect(() => {
    if (storeData) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
      localStorage.setItem("afrostore_siteId", storeData.store.id);
      localStorage.setItem("afrostore_storeSlug", storeData.store.slug);
      localStorage.setItem("afrostore_storeName", storeData.store.name);
      localStorage.setItem("afrostore_currency", storeData.store.currency);
    }
  }, [cart, storeData]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    updateParams(catSlug, searchQuery);
    setMobileFilters(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    updateParams(selectedCategory, searchInput);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSearchInput("");
    updateParams("", "");
  };

  const hasFilters = selectedCategory || searchQuery;
  const sortedProducts = sortProducts(products, sort);
  const currency = storeData?.store.currency || "NGN";

  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = (storeData?.pages || [])
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  /* ── Loading ── */
  if (loading && !storeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Store not found</h1>
          <p className="text-surface-500">{error}</p>
        </div>
      </div>
    );
  }

  const { store } = storeData;
  const activeCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;

  return (
    <ThemeProvider theme={storeData.theme}>
    <div className="min-h-screen bg-surface-50">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm themed-header">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 -ml-2 text-surface-600">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={`/store/${slug}`} className="flex items-center gap-2">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-display text-lg font-bold text-surface-900">{store.name}</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Home</Link>
            <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-brand-700 transition-colors">Shop</Link>
            <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
            {navPages.slice(0, 4).map((page) => (
              <Link key={page.id} href={`/store/${slug}/${page.slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">{page.title}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={`/store/${slug}/wishlist`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg hidden sm:flex">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>
            <Link href="/checkout" className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="sm:hidden bg-white border-t border-surface-200 px-4 py-4 space-y-2">
            <Link href={`/store/${slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Home</Link>
            <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-brand-700 py-2">Shop</Link>
            <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
            {navPages.map((page) => (
              <Link key={page.id} href={`/store/${slug}/${page.slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">{page.title}</Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <Link href={`/store/${slug}`} className="hover:text-surface-600 transition-colors">{store.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-surface-900 font-medium">
            {activeCategoryName || "All Products"}
          </span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
          {activeCategoryName || "All Products"}
        </h1>
        <p className="text-surface-500 text-sm mt-1">
          {pagination.total === 0
            ? "No products found"
            : `Showing ${products.length} of ${pagination.total} product${pagination.total !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex gap-8">
          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
                />
              </div>
            </form>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    !selectedCategory ? "bg-surface-900 text-white" : "text-surface-600 hover:bg-surface-100"
                  }`}
                >
                  All Products
                  <span className="ml-auto float-right text-xs opacity-60">{pagination.total || "—"}</span>
                </button>
                {categories
                  .filter((c) => c._count.products > 0)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        selectedCategory === cat.slug ? "bg-surface-900 text-white" : "text-surface-600 hover:bg-surface-100"
                      }`}
                    >
                      {cat.name}
                      <span className="ml-auto float-right text-xs opacity-60">{cat._count.products}</span>
                    </button>
                  ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 w-full text-center text-sm font-medium text-red-600 hover:text-red-700 py-2"
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="lg:hidden flex-1">
                <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5">
                  <Search className="h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
                  />
                </div>
              </form>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilters(!mobileFilters)}
                className="lg:hidden flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium text-surface-600"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {selectedCategory && <span className="h-2 w-2 rounded-full bg-brand-600" />}
              </button>

              {/* Sort */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium text-surface-600 hover:border-surface-300 transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-xl z-20 py-1">
                      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setSort(key); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === key ? "bg-surface-50 text-brand-700 font-semibold" : "text-surface-600 hover:bg-surface-50"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile category chips */}
            {mobileFilters && (
              <div className="lg:hidden mb-6 rounded-2xl border border-surface-200 bg-white p-4">
                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      !selectedCategory ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600"
                    }`}
                  >
                    All
                  </button>
                  {categories
                    .filter((c) => c._count.products > 0)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedCategory === cat.slug ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600"
                        }`}
                      >
                        {cat.name} ({cat._count.products})
                      </button>
                    ))}
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-3 text-sm font-medium text-red-600">
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Active filter badges */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeCategoryName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 px-3 py-1.5 text-xs font-medium">
                    {activeCategoryName}
                    <button onClick={() => handleCategoryChange("")} className="hover:text-brand-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 text-surface-700 px-3 py-1.5 text-xs font-medium">
                    &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => { setSearchQuery(""); setSearchInput(""); updateParams(selectedCategory, ""); }} className="hover:text-surface-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading overlay for filter changes */}
            {loading && storeData && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            )}

            {/* Empty state */}
            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
                <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-surface-900 mb-2">No products found</h3>
                <p className="text-sm text-surface-500 mb-6">
                  {hasFilters
                    ? "Try adjusting your filters or search terms."
                    : "This store hasn't added any products yet."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-2 rounded-xl bg-surface-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-surface-800 transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!loading && sortedProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {sortedProducts.map((product) => {
                    const hasImage = product.images.length > 0 && product.images[0].url;
                    const discount = product.compareAtPrice
                      ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                      : 0;
                    const justAdded = addedToCart === product.id;

                    return (
                      <div key={product.id} className="group">
                        <Link href={`/store/${slug}/product/${product.slug}`} className="block">
                          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-white">
                            {hasImage ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(product.id)} transition-transform duration-500 group-hover:scale-110 flex items-center justify-center`}>
                                <ImageIcon className="h-10 w-10 text-white/40" />
                              </div>
                            )}
                            {product.isFeatured && (
                              <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-brand-600">Featured</div>
                            )}
                            {!product.inStock && (
                              <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-red-500">Sold Out</div>
                            )}
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white z-10">-{discount}%</div>
                            )}
                            {/* Always-visible wishlist + cart icons */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-sm ${isWishlisted(product.id) ? "ring-1 ring-red-200" : ""}`}
                              >
                                <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-surface-500"}`} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                                disabled={!product.inStock}
                                className={`h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm disabled:opacity-40 ${
                                  justAdded ? "bg-green-500 text-white" : "bg-white/90 text-surface-500 hover:bg-white"
                                }`}
                              >
                                {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        </Link>
                        <Link href={`/store/${slug}/product/${product.slug}`}>
                          <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                        </Link>
                        {product.category && (
                          <p className="text-[10px] text-surface-400 mt-0.5">{product.category.name}</p>
                        )}
                        {product.reviewCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] text-surface-400">({product.reviewCount})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-surface-900">{formatCurrency(Number(product.price), currency)}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-surface-400 line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More */}
                {pagination.page < pagination.pages && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => fetchProducts(pagination.page + 1, true)}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 rounded-2xl bg-surface-900 text-white px-8 py-3.5 text-sm font-bold hover:bg-surface-800 transition-all shadow-lg disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                      ) : (
                        <>Load More Products</>
                      )}
                    </button>
                    <p className="text-xs text-surface-400 mt-3">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-surface-900 text-surface-400 py-10 themed-footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <span className="font-display font-bold text-white">{store.name}</span>
          </div>
          <span className="flex items-center gap-1">
            &copy; {new Date().getFullYear()} {store.name}. Powered by <span className="font-semibold text-brand-400">AfroStore</span>
          </span>
        </div>
      </footer>

      {/* ── Mobile cart bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 shadow-2xl px-4 py-3 sm:hidden">
          <Link href="/checkout" className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            View Cart ({cartCount})
          </Link>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}
