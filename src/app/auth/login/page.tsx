"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-surface-900">
              Afro<span className="text-brand-600">Store</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-surface-900">
            Welcome back
          </h1>
          <p className="text-surface-500 mt-1">
            Log in to manage your stores
          </p>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-surface-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="btn-primary w-full mt-2"
            >
              Log In
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-surface-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="btn-secondary text-sm py-2.5">
                Google
              </button>
              <button className="btn-secondary text-sm py-2.5">
                Apple
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-surface-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
