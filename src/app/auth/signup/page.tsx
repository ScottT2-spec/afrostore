"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signup({
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined,
    });

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Signup failed");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-brand-500/20 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent-500/15 blur-[100px]" />
        </div>
        <div className="relative flex flex-col justify-center px-16">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <img src="/prokip-logo.png" alt="Prokip" className="h-10 w-10 object-contain brightness-0 invert" />
            <span className="font-display text-2xl font-bold text-white">
              Afro<span className="text-brand-300">Store</span>
            </span>
          </Link>

          <h1 className="font-display text-4xl font-extrabold text-white leading-tight mb-4">
            Start Selling to
            <br />
            <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
              All of Africa
            </span>
          </h1>

          <p className="text-brand-200/70 text-lg leading-relaxed mb-10 max-w-md">
            Join 5,000+ businesses already using AfroStore to launch, sell, and grow online.
          </p>

          <div className="space-y-4">
            {[
              "Launch your store in under 5 minutes",
              "Accept Monnify, Paystack & Flutterwave",
              "AI generates your entire store",
              "Free forever plan available",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-400" />
                <span className="text-brand-200/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
                <img src="/prokip-logo.png" alt="Prokip" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-display text-xl font-bold text-surface-900">
                Afro<span className="text-brand-600">Store</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-surface-900">
              Create your account
            </h2>
            <p className="text-surface-500 mt-1.5">
              Get your store online in minutes
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                    placeholder="Amara"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                  placeholder="Okafor"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  placeholder="amara@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  placeholder="+234 812 345 6789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-white pl-10 pr-10 py-3 text-sm text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-6"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
