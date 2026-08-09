"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft, Sparkles, Link2, Wallet, Users } from "lucide-react";

interface ProgramInfo {
  storeName: string;
  enabled: boolean;
  commissionType: "PERCENTAGE" | "FLAT";
  commissionValue: number;
}

export default function AffiliateSignupPage() {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; alreadyApplied: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/storefront/${slug}/referrals/signup`)
      .then((res) => res.json())
      .then((json) => { if (json.success) setProgram(json.data); })
      .catch(() => {});
  }, [slug]);

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setErrorMsg("Please fill in your name and email.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/storefront/${slug}/referrals/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.error || "Something went wrong. Please try again.");
      } else {
        setResult(json.data);
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const commissionLabel = program
    ? program.commissionType === "PERCENTAGE"
      ? `${program.commissionValue}%`
      : `₦${program.commissionValue.toLocaleString()}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1C32] via-[#152845] to-[#0a1525] relative overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#F5B731]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-[#3d6499]/30 blur-3xl" />

      <div className="relative max-w-md mx-auto px-4 py-10 sm:py-14">
        <Link href={`/store/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>

        {/* Hero */}
        <div className="text-center mt-8 mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5B731] to-[#e0a020] flex items-center justify-center mb-5 shadow-lg shadow-[#F5B731]/20">
            <Sparkles className="h-7 w-7 text-[#0F1C32]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
            Earn money referring{program?.storeName ? ` ${program.storeName}` : " this store"}
          </h1>
          {commissionLabel && (
            <p className="text-white/70 text-sm mt-3">
              Get <span className="text-[#F5B731] font-semibold">{commissionLabel} commission</span> on every sale you bring in
            </p>
          )}
        </div>

        {/* Benefits strip */}
        {!result && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: Link2, label: "Your own link" },
              { icon: Users, label: "Refer anyone" },
              { icon: Wallet, label: "Get paid" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm py-3 px-2 text-center">
                <Icon className="h-4 w-4 text-[#F5B731] mx-auto mb-1.5" />
                <p className="text-[11px] font-medium text-white/80">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-7 sm:p-8">
          {result ? (
            <div className="text-center py-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-surface-900 font-display">
                {result.alreadyApplied ? "You've already applied" : "Application received \u{1F389}"}
              </h2>
              <p className="text-sm text-surface-500 mt-2 leading-relaxed">
                {result.status === "APPROVED"
                  ? "You're approved! Check your email for your referral link and code."
                  : "We'll review your application and email you once you're approved — then you can start sharing your link and earning."}
              </p>
              <Link
                href={`/store/${slug}`}
                className="inline-flex items-center justify-center gap-2 mt-6 w-full rounded-xl bg-[#0F1C32] text-white py-2.5 text-sm font-semibold hover:bg-[#152845] transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <h3 className="text-base font-bold text-surface-900">Apply in 30 seconds</h3>
              <p className="text-xs text-surface-500 mt-1 mb-5">No fees, no minimums — just share and earn.</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3d6499] focus:ring-2 focus:ring-[#3d6499]/15 transition-shadow"
                />
                {errorMsg && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>
                )}
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#0F1C32] to-[#1B2B4B] text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#0F1C32]/20"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply to become an affiliate"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-white/40 mt-6">
          Applications are reviewed by the store before your link goes live.
        </p>
      </div>
    </div>
  );
}
