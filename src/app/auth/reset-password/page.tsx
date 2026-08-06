"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
} from "@/components/icons/FilledIcons";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          This password reset link is invalid or incomplete. Please request a new
          one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-2xl mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Password Reset
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your password has been reset successfully. You can now sign in with
          your new password.
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
    <>
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Set New Password
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          Choose a strong password (min. 8 characters)
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
              className="w-full rounded-xl border-0 bg-gray-100 pl-12 pr-12 py-4 text-base text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border-0 bg-gray-100 pl-12 pr-4 py-4 text-base text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Password strength indicator */}
        {password.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => {
                const strength =
                  (password.length >= 8 ? 1 : 0) +
                  (password.length >= 12 ? 1 : 0) +
                  (/[A-Z]/.test(password) && /[a-z]/.test(password) ? 1 : 0) +
                  (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)
                    ? 1
                    : 0);
                const colors = [
                  "bg-red-400",
                  "bg-amber-400",
                  "bg-emerald-400",
                  "bg-emerald-500",
                ];
                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= strength
                        ? colors[Math.min(strength - 1, 3)]
                        : "bg-gray-200"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-400">
              {password.length < 8
                ? "Too short"
                : password.length < 12
                  ? "Good"
                  : "Strong"}
              {password !== confirmPassword &&
                confirmPassword.length > 0 &&
                " · Passwords don't match"}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading || password.length < 8 || password !== confirmPassword
          }
          className="w-full rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 text-base transition-all duration-200 shadow-md shadow-slate-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-emerald-50/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-gray-200/60">
          {/* Logo */}
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
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
