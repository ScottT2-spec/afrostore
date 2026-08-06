"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CheckCircle2, AlertTriangle, Mail } from "@/components/icons/FilledIcons";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Verification failed");
        } else {
          setSuccess(true);
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendMessage("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResendMessage(data.error || "Something went wrong");
      } else {
        setResendMessage(data.message || "Verification email sent!");
      }
    } catch {
      setResendMessage("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-base">Verifying your email...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-2xl mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Email Verified!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your email has been verified successfully. You can now sign in to your account.
        </p>
        <Link
          href="/auth/login"
          className="inline-block rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-8 text-base transition-all duration-200 shadow-md shadow-slate-300/40"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {token ? "Verification Failed" : "Verify Your Email"}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          {error || "Enter your email to receive a new verification link."}
        </p>
      </div>

      {/* Resend verification form */}
      <form className="space-y-5" onSubmit={handleResend}>
        {resendMessage && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
            {resendMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full rounded-xl border-0 bg-gray-100 pl-12 pr-4 py-4 text-base text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={resendLoading}
          className="w-full rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 text-base transition-all duration-200 shadow-md shadow-slate-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resendLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            "Resend Verification Email"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-emerald-50/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-gray-200/60">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <img
                src="/prokip-logo.png"
                alt="Prokip"
                className="h-16 w-16 object-contain"
              />
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
