"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Star,
  ArrowLeft,
  Loader2,
  BadgeCheck,
  ImageIcon,
} from "lucide-react";

interface ReviewProduct {
  name: string;
  slug: string;
  image: string | null;
}

interface StoreReview {
  id: string;
  name: string;
  rating: number;
  title?: string;
  body?: string;
  isVerified: boolean;
  createdAt: string;
  product: ReviewProduct;
}

interface ReviewStats {
  averageRating: number;
  totalCount: number;
  ratingDistribution: { rating: number; count: number }[];
}

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-surface-200"} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}

export default function StoreReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async (p: number, rating: number | null, append: boolean) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `/api/storefront/${slug}/reviews?page=${p}&limit=10`;
      if (rating) url += `&rating=${rating}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setReviews((prev) => [...prev, ...data.data.items]);
        } else {
          setReviews(data.data.items);
        }
        setStats(data.data.stats);
        setHasMore(data.data.pagination.hasMore);
      } else {
        setError(data.error || "Failed to load reviews");
      }
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [slug]);

  // Fetch store info
  useEffect(() => {
    fetch(`/api/storefront/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const s = res.data.store;
          setStore({ id: s.id, name: s.name, slug: s.slug, logo: s.logo });
        }
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    fetchReviews(1, ratingFilter, false);
  }, [fetchReviews, ratingFilter]);

  const handleFilterChange = (rating: number | null) => {
    setRatingFilter(rating);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, ratingFilter, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-surface-500">{error}</p>
        <Link href={`/store/${slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">← Back to store</Link>
      </div>
    );
  }

  const ratingTabs = [
    { label: "All", value: null },
    { label: "5 Stars", value: 5 },
    { label: "4 Stars", value: 4 },
    { label: "3 Stars", value: 3 },
    { label: "2 Stars", value: 2 },
    { label: "1 Star", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5">
            {store?.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-display font-bold text-surface-900">{store?.name || "Store"}</span>
          </Link>
          <Link href={`/store/${slug}`} className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 font-display mb-8">Customer Reviews</h1>

        {stats && stats.totalCount > 0 ? (
          <>
            {/* Aggregate Stats */}
            <div className="rounded-2xl bg-surface-50 p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-5xl font-bold text-surface-900 font-display">{stats.averageRating.toFixed(1)}</div>
                  <div className="flex justify-center sm:justify-start mt-2">
                    <Stars rating={stats.averageRating} size={22} />
                  </div>
                  <p className="text-sm text-surface-500 mt-1">{stats.totalCount} review{stats.totalCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex-1 w-full max-w-sm space-y-1.5">
                  {[...stats.ratingDistribution].reverse().map((d) => {
                    const pct = stats.totalCount > 0 ? (d.count / stats.totalCount) * 100 : 0;
                    return (
                      <div key={d.rating} className="flex items-center gap-2">
                        <span className="text-xs text-surface-500 w-3 text-right">{d.rating}</span>
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2.5 rounded-full bg-surface-200 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-surface-400 w-6 text-right">{d.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              {ratingTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => handleFilterChange(tab.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    ratingFilter === tab.value
                      ? "bg-surface-900 text-white"
                      : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Reviews Grid */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-surface-100 p-5 hover:border-surface-200 transition-colors">
                    {/* Product Info */}
                    <Link
                      href={`/store/${slug}/product/${review.product.slug}`}
                      className="flex items-center gap-3 mb-4 group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-surface-50 overflow-hidden flex-shrink-0 border border-surface-100">
                        {review.product.image ? (
                          <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-surface-200" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-surface-500 group-hover:text-brand-600 transition-colors truncate">
                        {review.product.name}
                      </span>
                    </Link>

                    {/* Reviewer */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-surface-900">{review.name}</span>
                            {review.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                <BadgeCheck className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-surface-400">
                            {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Stars rating={review.rating} size={14} />
                    {review.title && <p className="text-sm font-bold text-surface-900 mt-2">{review.title}</p>}
                    {review.body && <p className="text-sm text-surface-600 mt-1 leading-relaxed line-clamp-4">{review.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-8 w-8 text-surface-200 mx-auto mb-2" />
                <p className="text-sm text-surface-500">No reviews with this rating yet.</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-6 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition-all"
                >
                  {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : "Load More Reviews"}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-surface-200 p-16 text-center">
            <Star className="h-12 w-12 text-surface-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 font-display">No reviews yet</h3>
            <p className="text-sm text-surface-500 mt-2 mb-6">This store hasn&apos;t received any reviews yet.</p>
            <Link
              href={`/store/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-700 transition-all"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-xs text-surface-400">© {new Date().getFullYear()} {store?.name}. Powered by ProkipSites.</p>
        </div>
      </footer>
    </div>
  );
}
