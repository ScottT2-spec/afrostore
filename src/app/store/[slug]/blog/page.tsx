"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Search, X } from "lucide-react";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  tags: string[];
  publishedAt?: string | null;
  createdAt: string;
}

interface BlogData {
  site: { id: string; name: string; slug: string };
  blogs: BlogPost[];
  categories: string[];
  pagination: { page: number; limit: number; total: number; pages: number; hasMore: boolean };
}

export default function StoreBlogListingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({ page: String(page), limit: "9" });
    if (category) params.set("category", category);
    if (search) params.set("search", search);

    fetch(`/api/storefront/${slug}/blogs?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load blog");
        }
      })
      .catch(() => { if (!cancelled) setError("Failed to load blog"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug, page, category, search]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{error}</p>
          <Link href={`/store/${slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
        </div>
      </div>
    );
  }

  const blogs = data?.blogs || [];
  const categories = data?.categories || [];
  const pagination = data?.pagination;
  const storeName = data?.site?.name || "Store";
  const isKidsTemplate = slug === "kids";

  if (isKidsTemplate) {
    const kidsCategories = ["All", ...categories];

    return (
      <div className="min-h-screen bg-[#fffef8] text-[#3b3344]" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
        <KidsFontLoader />
        <KidsHeader
          storeName={storeName}
          storeSlug={slug}
          templateSlug="kids"
          cartCount={0}
          wishlistCount={0}
        />

        <section className="bg-gradient-to-br from-[#fff7df] via-[#fffdf4] to-[#ffeef1] px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Kids Blog</p>
            <h1 className="mt-4 font-serif text-4xl text-[#3b3344] sm:text-5xl">Ideas, stories, and cheerful inspiration</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#6d6277]">
              Browse the latest Kids demo posts for styling tips, playful gift ideas, and practical guides for parents.
            </p>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              {kidsCategories.map((cat) => {
                const active = cat === "All" ? !category : category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat === "All" ? null : cat); setPage(1); }}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      active ? "bg-[#f5857c] text-white shadow-lg shadow-[#f5857c]/20" : "bg-white text-[#3b3344] hover:text-[#f5857c]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(searchInput);
                  setPage(1);
                }}
                className="flex w-full max-w-xl items-center gap-3 rounded-full border border-[#efe6da] bg-white px-5 py-3 shadow-[0_16px_40px_rgba(59,51,68,0.05)]"
              >
                <Search className="h-4 w-4 text-[#f5857c]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Kids articles..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#a69cad]"
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="text-[#a69cad] transition hover:text-[#f5857c]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
              <p className="text-sm text-[#6d6277]">
                {pagination?.total ? `${pagination.total} article${pagination.total === 1 ? "" : "s"} found` : "No posts yet"}
              </p>
            </div>

            {blogs.length === 0 ? (
              <div className="rounded-[32px] border border-[#efe6da] bg-white px-6 py-20 text-center shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
                <p className="text-lg font-semibold text-[#3b3344]">No blog posts found.</p>
                {(category || search) && (
                  <button
                    onClick={() => { setCategory(null); setSearch(""); setSearchInput(""); setPage(1); }}
                    className="mt-4 rounded-full bg-[#f5857c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ef7067]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {blogs.map((post) => (
                  <Link key={post.id} href={`/store/${slug}/blog/${post.slug}`} className="group overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_rgba(59,51,68,0.06)] transition-transform hover:-translate-y-1">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#fff7df]">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f5857c] to-[#f7b267] text-5xl font-bold text-white/60">
                          {post.title.charAt(0)}
                        </div>
                      )}
                      {post.category && (
                        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5857c]">
                          {post.category}
                        </span>
                      )}
                      {(post.publishedAt || post.createdAt) && (
                        <span className="absolute right-4 top-4 rounded-2xl bg-[#3b3344] px-3 py-2 text-center text-white">
                          <span className="block text-lg font-bold leading-none">{new Date(post.publishedAt || post.createdAt).getDate()}</span>
                          <span className="block text-[10px] uppercase tracking-[0.2em] opacity-80">
                            {new Date(post.publishedAt || post.createdAt).toLocaleString("en-US", { month: "short" })}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="font-serif text-2xl text-[#3b3344] transition group-hover:text-[#f5857c]">{post.title}</h2>
                      <div className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[#a69cad]">
                        {post.author && <span>By {post.author}</span>}
                        {post.author && (post.publishedAt || post.createdAt) && <span> · </span>}
                        {(post.publishedAt || post.createdAt) && <span>{formatDate(post.publishedAt || post.createdAt)}</span>}
                      </div>
                      {post.excerpt && <p className="mt-4 text-sm leading-7 text-[#6d6277]">{post.excerpt.length > 140 ? `${post.excerpt.slice(0, 140)}...` : post.excerpt}</p>}
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#f5857c]">
                        Continue reading <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-[#efe6da] bg-white px-5 py-2.5 text-sm font-semibold text-[#3b3344] transition disabled:cursor-default disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-[#6d6277]">Page {page} of {pagination.pages}</span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={!pagination.hasMore}
                  className="rounded-full border border-[#efe6da] bg-white px-5 py-2.5 text-sm font-semibold text-[#3b3344] transition disabled:cursor-default disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>

        <KidsFooterFull
          storeName={storeName}
          storeSlug={slug}
          templateSlug="kids"
          description="Bright kidswear stories, seasonal ideas, and playful product inspiration for the whole family."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
      <CosmeticsHeader
        storeName={storeName}
        storeSlug={slug}
        isLanding={false}
      />
      {/* Header */}
      <div style={{ background: "#f7f7f7", borderBottom: "1px solid #eee", padding: "40px 15px", textAlign: "center" }}>
        <Link
          href={`/store/${slug}`}
          style={{ fontSize: "12px", color: "#767676", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to {storeName}
        </Link>
        <h1 style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: "32px", color: "#242424", margin: "0 0 8px" }}>
          Latest News
        </h1>
        <p style={{ color: "#767676", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>
          Stay updated with the latest trends, tips, and store announcements.
        </p>
      </div>

      <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "40px 15px" }}>
        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "30px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => { setCategory(null); setPage(1); }}
              style={{
                padding: "6px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "0", border: "1px solid",
                borderColor: !category ? "#da3c3c" : "#ddd",
                background: !category ? "#da3c3c" : "#fff",
                color: !category ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                style={{
                  padding: "6px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "0", border: "1px solid",
                  borderColor: category === cat ? "#da3c3c" : "#ddd",
                  background: category === cat ? "#da3c3c" : "#fff",
                  color: category === cat ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #ddd", padding: "4px 10px" }}>
            <Search style={{ width: "14px", height: "14px", color: "#999" }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              placeholder="Search posts..."
              style={{ border: "none", outline: "none", fontSize: "13px", width: "150px", fontFamily: "inherit" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "0" }}>
                <X style={{ width: "14px", height: "14px", color: "#999" }} />
              </button>
            )}
          </div>
        </div>

        {/* Blog grid */}
        {blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#767676" }}>
            <p style={{ fontSize: "16px" }}>No blog posts found.</p>
            {(category || search) && (
              <button
                onClick={() => { setCategory(null); setSearch(""); setSearchInput(""); setPage(1); }}
                style={{ marginTop: "12px", background: "none", border: "none", color: "#da3c3c", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "25px" }}>
            {blogs.map((post) => (
              <Link
                key={post.id}
                href={`/store/${slug}/blog/${post.slug}`}
                style={{ textDecoration: "none", color: "inherit", display: "block", overflow: "hidden" }}
              >
                <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#f0f0f0" }}>
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "40px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {post.category && (
                    <span style={{
                      position: "absolute", top: "12px", left: "12px", background: "#f0f0f0", color: "#333",
                      fontSize: "11px", padding: "3px 10px", textTransform: "uppercase", fontWeight: 600,
                    }}>
                      {post.category}
                    </span>
                  )}
                  {/* Date badge */}
                  {(post.publishedAt || post.createdAt) && (() => {
                    const d = new Date(post.publishedAt || post.createdAt);
                    return (
                      <div style={{
                        position: "absolute", top: "12px", right: "12px", background: "#da3c3c", color: "#fff",
                        textAlign: "center", padding: "6px 10px", lineHeight: 1,
                      }}>
                        <span style={{ display: "block", fontSize: "18px", fontWeight: 700 }}>{d.getDate()}</span>
                        <span style={{ display: "block", fontSize: "10px", textTransform: "uppercase" }}>
                          {d.toLocaleString("en-US", { month: "short" })}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div style={{ padding: "18px 0" }}>
                  <h2 style={{
                    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "16px",
                    color: "#333", margin: "0 0 8px", lineHeight: 1.4,
                  }}>
                    {post.title}
                  </h2>
                  <div style={{ fontSize: "12px", color: "#767676", marginBottom: "8px" }}>
                    {post.author && <span>By <strong>{post.author}</strong></span>}
                    {post.author && (post.publishedAt || post.createdAt) && <span> · </span>}
                    {(post.publishedAt || post.createdAt) && <span>{formatDate(post.publishedAt || post.createdAt)}</span>}
                  </div>
                  {post.excerpt && (
                    <p style={{ fontSize: "13px", color: "#767676", lineHeight: 1.6, margin: 0 }}>
                      {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + "..." : post.excerpt}
                    </p>
                  )}
                  <span style={{
                    display: "inline-block", marginTop: "10px", fontSize: "13px", fontWeight: 600,
                    color: "#333", textDecoration: "none",
                  }}>
                    Continue reading →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px", alignItems: "center" }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              style={{
                padding: "8px 16px", fontSize: "13px", fontWeight: 600, border: "1px solid #ddd",
                background: "#fff", color: page <= 1 ? "#ccc" : "#333", cursor: page <= 1 ? "default" : "pointer",
              }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: "13px", color: "#767676", padding: "0 12px" }}>
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={!pagination.hasMore}
              style={{
                padding: "8px 16px", fontSize: "13px", fontWeight: 600, border: "1px solid #ddd",
                background: "#fff", color: !pagination.hasMore ? "#ccc" : "#333", cursor: !pagination.hasMore ? "default" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
      <CosmeticsFooter
        storeName={storeName}
        storeSlug={slug}
      />
    </div>
  );
}
