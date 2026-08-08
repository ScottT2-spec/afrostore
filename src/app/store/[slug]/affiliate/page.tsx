"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AffiliateSignupPage() {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; alreadyApplied: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href={`/store/${slug}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to store</Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8 mt-4">
          {result ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h1 className="text-lg font-bold text-gray-900">
                {result.alreadyApplied ? "You've already applied" : "Application received"}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                {result.status === "APPROVED"
                  ? "You're approved! Check your email for your referral link and code."
                  : "The store will review your application. You'll be notified once you're approved and can start sharing your referral link."}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold text-gray-900">Become an affiliate</h1>
              <p className="text-sm text-gray-500 mt-1 mb-6">Earn a commission for every sale you refer.</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                />
                {errorMsg && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>
                )}
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply to become an affiliate"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
