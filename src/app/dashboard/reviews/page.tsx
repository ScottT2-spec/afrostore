"use client";
import { Loader2 } from "lucide-react";
import { MessageCircle, Star, XCircle } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
  product?: { id: string; name: string; slug: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const PAGE_SIZE = 20;

export default function ReviewsPage() {
  const { currentStore } = useSite();

  // The header cards always reflect the store's true totals, independent of
  // whichever page of the list below is currently loaded.
  const [overallTotal, setOverallTotal] = useState(0);
  const [overallAvgRating, setOverallAvgRating] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!currentStore) return;
    const allRes = await api.get<any>(`/api/sites/${currentStore.id}/reviews?limit=1`);
    if (allRes.success && allRes.data) {
      setOverallTotal(allRes.data.stats.totalCount);
      setOverallAvgRating(allRes.data.stats.averageRating);
    }
  }, [currentStore]);

  const fetchReviews = useCallback(async (targetPage: number, reset: boolean) => {
    if (!currentStore) return;
    if (reset) setLoading(true); else setLoadingMore(true);

    const params = new URLSearchParams({ page: String(targetPage), limit: String(PAGE_SIZE) });

    const res = await api.get<any>(`/api/sites/${currentStore.id}/reviews?${params.toString()}`);
    if (res.success && res.data) {
      setReviews((prev) => (reset ? res.data.reviews : [...prev, ...res.data.reviews]));
      setPagination(res.data.pagination);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [currentStore]);

  useEffect(() => { fetchReviews(1, true); }, [fetchReviews]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const deleteReview = async (id: string) => {
    if (!currentStore || !confirm("Delete this review?")) return;
    await api.delete(`/api/sites/${currentStore.id}/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
    fetchSummary();
  };

  const hasMore = reviews.length < pagination.total;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Reviews</h1>
          <p className="text-sm text-surface-500 mt-1">Customer reviews are published instantly. Delete any you don&apos;t want shown.</p>
        </div>
      </div>

      {/* Stats — always reflect the store's true totals, not just what's loaded below */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-brand-900 p-7 text-white relative overflow-hidden">
          <Star className="absolute -right-4 -bottom-4 h-28 w-28 text-white/5" strokeWidth={1} />
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 relative">Total Reviews</p>
          <p className="text-5xl font-black tracking-tight mt-4 relative">{overallTotal}</p>
        </div>
        <div className="rounded-2xl border border-surface-200 border-l-4 border-l-accent-500 bg-white p-7">
          <p className="text-xs font-bold uppercase tracking-wider text-surface-400">Average Rating</p>
          <div className="flex items-center gap-2 mt-4">
            <p className="text-5xl font-black text-surface-900 tracking-tight">{overallAvgRating ? overallAvgRating.toFixed(1) : "0.0"}</p>
            <Star className="h-6 w-6 text-accent-400 fill-accent-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">
            No reviews yet
          </h3>
          <p className="text-sm text-surface-500">Reviews will appear here when customers leave feedback.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-surface-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                      {review.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-surface-900">{review.name}</span>
                        {review.isVerified && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Verified</span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400">{review.email} · {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-accent-400 fill-accent-400" : "text-surface-200"}`} />
                    ))}
                  </div>
                  {review.title && <p className="text-sm font-semibold text-surface-900 mb-1">{review.title}</p>}
                  {review.body && <p className="text-sm text-surface-600 leading-relaxed">{review.body}</p>}
                  {review.product && (
                    <p className="text-xs text-surface-400 mt-2">Product: <span className="font-medium text-surface-600">{review.product.name}</span></p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => deleteReview(review.id)}
                    className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600" title="Delete">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchReviews(pagination.page + 1, false)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Load more ({pagination.total - reviews.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
