"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ShoppingBag, User } from "@/components/icons/FilledIcons";
import { syncWishlistOnIdentify } from "@/hooks/useWishlist";

export default function CustomerRegisterPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || `/store/${slug}/my-account`;
  const [siteId, setSiteId] = useState("");

  useEffect(() => {
    fetch(`/api/storefront/${slug}`)
      .then((res) => res.json())
      .then((json) => { if (json?.data?.store?.id) setSiteId(json.data.store.id); })
      .catch(() => {});
  }, [slug]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/storefront/${slug}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: phone || undefined,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Store token for client-side use
      localStorage.setItem(`afrostore_customer_token_${slug}`, json.data.token);
      localStorage.setItem(
        `afrostore_customer_${slug}`,
        JSON.stringify({
          id: json.data.id,
          name: `${json.data.firstName} ${json.data.lastName}`,
          email: json.data.email,
          phone: json.data.phone || "",
        })
      );
      if (siteId) syncWishlistOnIdentify(siteId, slug, json.data.id);

      router.push(redirect);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1C32] via-[#152845] to-[#0a1525] relative overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#F5B731]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-[#3d6499]/30 blur-3xl" />

      <div className="relative max-w-md mx-auto px-4 py-10 sm:py-14">
        <Link href={`/store/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
          <ShoppingBag className="h-4 w-4" /> Back to store
        </Link>

        {/* Hero */}
        <div className="text-center mt-8 mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5B731] to-[#e0a020] flex items-center justify-center mb-5 shadow-lg shadow-[#F5B731]/20">
            <User className="h-7 w-7 text-[#0F1C32]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">Create an account</h1>
          <p className="text-white/70 text-sm mt-3">Sign up to track orders, save your wishlist, and more</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
                placeholder="First name"
              />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
                placeholder="Last name"
              />
            </div>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
              placeholder="Email address"
            />

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
              placeholder="Phone (optional)"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
              placeholder="Password (at least 6 characters)"
            />

            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
              placeholder="Confirm password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#0F1C32] to-[#1B2B4B] text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#0F1C32]/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/60 mt-6">
          Already have an account?{" "}
          <Link
            href={`/store/${slug}/login${redirect !== `/store/${slug}/my-account` ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-white font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
