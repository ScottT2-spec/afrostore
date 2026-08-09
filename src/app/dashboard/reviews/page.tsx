"use client";
import { Loader2 } from "lucide-react";
import { CheckCircle2, Filter, MessageCircle, Star, XCircle } from "@/components/icons/FilledIcons";

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
  isApproved: boolean;
  createdAt: string;
  product?: { id: string; name: string; slug: string };
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: { averageRating: number; totalCount: number; ratingDistribution: { rating: number; count: number }[] };
}

const PAGE_SIZE = 20;

export default function ReviewsPage() {
  const { currentStore } = useSite();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Overall stats — always reflect ALL reviews on the site, independent of
  // the current filter/page, so the top cards never lie about totals.
  const [overallStats, setOverallStats] = useState({ totalCount: 0, averageRating: 0 });
  const [pendingCount, setPendingCount] = useState(0);

  const fetchOverallStats = useCallback(async () => {
    if (!currentStore) return;
    const [allRes, pendingRes] = await Promise.all([
      api.get<ReviewsResponse>(`/api/sites/${currentStore.id}/reviews?limit=1`),
      api.get<ReviewsResponse>(`/api/sites/${currentStore.id}/reviews?limit=1&isApproved=false`),
    ]);
    if (allRes.success && allRes.data) {
      setOverallStats({
        totalCount: allRes.data.stats?.totalCount ?? allRes.data.pagination?.total ?? 0,
        averageRating: allRes.data.stats?.averageRating ?? 0,
      });
    }
    if (pendingRes.success && pendingRes.data) {
      setPendingCount(pendingRes.data.pagination?.total ?? 0);
    }
  }, [currentStore]);

  const fetchReviews = useCallback(async (targetPage: number, targetFilter: "all" | "pending" | "approved", append: boolean) => {
    if (!currentStore) return;
    if (append) setLoadingMore(true); else setLoading(true);

    const params = new URLSearchParams({ page: String(targetPage), limit: String(PAGE_SIZE) });
    if (targetFilter === "pending") params.set("isApproved", "false");
    if (targetFilter === "approved") params.set("isApproved", "true");

    const res = await api.get<ReviewsResponse>(`/api/sites/${currentStore.id}/reviews?${params}`);
    if (res.success && res.data) {
      setReviews((prev) => (append ? [...prev, ...res.data!.reviews] : res.data!.reviews));
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [currentStore]);

  useEffect(() => {
    setPage(1);
    fetchReviews(1, filter, false);
    fetchOverallStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore, filter]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchReviews(next, filter, true);
  };

  const updateReview = async (id: string, data: Partial<Review>) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/reviews/${id}`, data);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r));
    fetchOverallStats();
  };

  const deleteReview = async (id: string) => {
    if (!currentStore || !confirm("Delete this review?")) return;
    await api.delete(`/api/sites/${currentStore.id}/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    fetchOverallStats();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Reviews</h1>
          <p className="text-sm text-surface-500 mt-1">Moderate customer reviews for your products</p>
        </div>
      </div>

      {/* Stats — computed server-side across ALL reviews, not just the loaded page */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <p className="text-xs font-semibold text-surface-500 uppercase">Total Reviews</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{overallStats.totalCount}</p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <p className="text-xs font-semibold text-surface-500 uppercase">Average Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-surface-900">{overallStats.averageRating.toFixed(1)}</p>
            <Star className="h-5 w-5 text-accent-400 fill-accent-400" />
          </div>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <p className="text-xs font-semibold text-surface-500 uppercase">Pending</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-surface-400" />
        {(["all", "pending", "approved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filter === f ? "bg-brand-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"}`}>
            {f === "all" ? "All" : f === "pending" ? "Pending" : "Approved"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">
            {filter === "pending" ? "No pending reviews" : filter === "approved" ? "No approved reviews" : "No reviews yet"}
          </h3>
          <p className="text-sm text-surface-500">Reviews will appear here when customers leave feedback.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className={`rounded-2xl border bg-white p-5 transition-colors ${review.isApproved ? "border-surface-200" : "border-accent-200 bg-accent-50/30"}`}>
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
                          {!review.isApproved && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">Pending</span>
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
                    {!review.isApproved && (
                      <button onClick={() => updateReview(review.id, { isApproved: true })}
                        className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    {review.isApproved && (
                      <button onClick={() => updateReview(review.id, { isApproved: false })}
                        className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700" title="Unapprove">
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => deleteReview(review.id)}
                      className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600" title="Delete">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button onClick={loadMore} disabled={loadingMore} className="btn-secondary text-sm py-2.5 px-6">
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load More Reviews"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
