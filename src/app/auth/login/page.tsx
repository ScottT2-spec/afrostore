"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function EyeFilled({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
    </svg>
  );
}

function EyeOffFilled({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553c-1.068 3.21-3.78 5.72-7.136 6.748l-1.452-1.452a5.25 5.25 0 006.397-6.397l2.19-2.19c.052.078.1.156.148.236a1.762 1.762 0 010 1.113l-.147-.058zM15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243zM6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31 1.762 1.762 0 000 1.114 11.27 11.27 0 006.136 6.748l-1.452-1.452A5.25 5.25 0 016.75 12z" />
    </svg>
  );
}

function MailFilled({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

function LockFilled({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(email, password);
    if (result.success) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (data.success && (data.data?.role === "ADMIN" || data.data?.role === "SUPER_ADMIN")) {
            router.push("/admin");
            setSubmitting(false);
            return;
          }
        } catch {}
      }
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-emerald-50/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-gray-200/60">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/">
              <img src="/prokip-logo.png" alt="Prokip" className="h-16 w-16 object-contain" />
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Sign in to your dashboard
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <MailFilled className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-0 bg-gray-100 pl-12 pr-4 py-4 text-base text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <LockFilled className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-0 bg-gray-100 pl-12 pr-12 py-4 text-base text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOffFilled className="h-5 w-5" /> : <EyeFilled className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500 transition-colors cursor-pointer"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 text-base transition-all duration-200 shadow-md shadow-slate-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
