"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Crown, Star, Zap, Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["Subdomain", "5 products", "Basic analytics", "Platform branding"],
  STARTER: ["Custom domain", "50 products", "Payment gateways", "No branding"],
  BUSINESS: ["Unlimited products", "Advanced analytics", "Coupons", "Abandoned cart"],
  GROWTH: ["Everything in Business", "AI tools", "A/B testing", "Priority support"],
};

const PLAN_PRICES: Record<string, { monthly: string; yearly: string }> = {
  FREE: { monthly: "₦0", yearly: "₦0" },
  STARTER: { monthly: "₦5,000", yearly: "₦50,000" },
  BUSINESS: { monthly: "₦15,000", yearly: "₦150,000" },
  GROWTH: { monthly: "₦35,000", yearly: "₦350,000" },
};

const PLAN_ORDER = ["FREE", "STARTER", "BUSINESS", "GROWTH"];

const PLAN_ICONS: Record<string, React.ElementType> = {
  FREE: Zap,
  STARTER: Star,
  BUSINESS: Crown,
  GROWTH: Crown,
};

interface BillingStatus {
  plan: string;
  planPeriod: string | null;
  planStartDate: string | null;
  planEndDate: string | null;
  isActive: boolean;
  hasSubscription: boolean;
  webhookConfigured: boolean;
}

interface Workspace {
  id: string;
  name: string;
  plan: string;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/agency", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.data?.workspaces?.length > 0) {
        const ws = data.data.workspaces[0];
        setWorkspace({ id: ws.id, name: ws.name, plan: ws.plan });
        return ws.id;
      }
    } catch {
      console.error("Failed to fetch workspace");
    }
    return null;
  }, []);

  const fetchBillingStatus = useCallback(async (wsId: string) => {
    try {
      const res = await fetch(`/api/billing/status?workspaceId=${wsId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setBillingStatus(data.data);
      }
    } catch {
      console.error("Failed to fetch billing status");
    }
  }, []);

  const verifyPayment = useCallback(async (wsId: string) => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) return;

    try {
      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reference, workspaceId: wsId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Payment verified! Your plan has been upgraded.");
        await fetchBillingStatus(wsId);
        await fetchWorkspace();
      }
    } catch {
      console.error("Failed to verify payment");
    }
  }, [searchParams, fetchBillingStatus, fetchWorkspace]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const wsId = await fetchWorkspace();
      if (!mounted || !wsId) {
        setLoading(false);
        return;
      }
      await fetchBillingStatus(wsId);

      // Handle callback from Paystack
      if (searchParams.get("status") === "success") {
        await verifyPayment(wsId);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchWorkspace, fetchBillingStatus, verifyPayment, searchParams]);

  const handleUpgrade = async (plan: string) => {
    if (!workspace) return;
    setUpgrading(plan);
    setError(null);

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          workspaceId: workspace.id,
          plan,
          period,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        setError(data.error || "Failed to initialize payment");
        setUpgrading(null);
      }
    } catch {
      setError("Failed to connect to payment service");
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!workspace || !confirm("Are you sure you want to cancel your subscription? Your plan will remain active until the end of the billing period.")) return;
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.data?.message || "Subscription cancelled successfully.");
        await fetchBillingStatus(workspace.id);
      } else {
        setError(data.error || "Failed to cancel subscription");
      }
    } catch {
      setError("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const currentPlan = billingStatus?.plan || workspace?.plan || "FREE";
  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);

  if (loading) {
    return (
      <>
        <DashboardHeader title="Billing" subtitle="Manage your subscription" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-surface-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading billing info...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Billing" subtitle="Manage your subscription" />
      <div className="p-6 space-y-6">
        {/* Messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}
        {billingStatus && !billingStatus.webhookConfigured && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
            Payment webhook isn&apos;t configured on this server, so subscription renewals may not be tracked automatically. Contact support if your plan status looks out of date.
          </div>
        )}

        {/* Current Plan Status */}
        {currentPlan !== "FREE" && billingStatus && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-surface-900">Current Plan</span>
                  <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {currentPlan}
                  </span>
                  {billingStatus.planPeriod && (
                    <span className="bg-surface-100 text-surface-600 text-xs px-2 py-0.5 rounded-full">
                      {billingStatus.planPeriod}
                    </span>
                  )}
                </div>
                <div className="text-sm text-surface-500 space-y-1">
                  {billingStatus.planStartDate && (
                    <p>Started: {new Date(billingStatus.planStartDate).toLocaleDateString()}</p>
                  )}
                  {billingStatus.planEndDate && (
                    <p>Renews: {new Date(billingStatus.planEndDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              {billingStatus.hasSubscription && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Period Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${period === "monthly" ? "text-surface-900" : "text-surface-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setPeriod(period === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${period === "yearly" ? "bg-brand-600" : "bg-surface-300"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${period === "yearly" ? "translate-x-6" : ""}`}
            />
          </button>
          <span className={`text-sm font-medium ${period === "yearly" ? "text-surface-900" : "text-surface-400"}`}>
            Yearly
          </span>
          {period === "yearly" && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_ORDER.map((plan, index) => {
            const isActive = currentPlan === plan;
            const isDowngrade = index < currentPlanIndex;
            const Icon = PLAN_ICONS[plan];
            const isPopular = plan === "STARTER";
            const price = PLAN_PRICES[plan][period];
            const isUpgrading = upgrading === plan;

            return (
              <div
                key={plan}
                className={`rounded-2xl border bg-white p-6 relative ${
                  isActive ? "border-brand-600 shadow-lg" : "border-surface-200"
                } ${isPopular ? "ring-2 ring-brand-600" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <Icon className="h-8 w-8 text-brand-600 mb-3" />
                <h3 className="text-lg font-bold text-surface-900">
                  {plan.charAt(0) + plan.slice(1).toLowerCase()}
                </h3>
                <div className="flex items-baseline gap-1 mt-1 mb-4">
                  <span className="text-2xl font-extrabold text-surface-900">{price}</span>
                  <span className="text-xs text-surface-500">
                    /{period === "monthly" ? "month" : "year"}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {PLAN_FEATURES[plan]?.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-surface-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full text-sm py-2.5 rounded-xl font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700 cursor-default"
                      : isDowngrade || plan === "FREE"
                      ? "bg-surface-100 text-surface-400 cursor-not-allowed"
                      : "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800"
                  }`}
                  disabled={isActive || isDowngrade || plan === "FREE" || isUpgrading}
                  onClick={() => {
                    if (!isActive && !isDowngrade && plan !== "FREE") {
                      handleUpgrade(plan);
                    }
                  }}
                >
                  {isUpgrading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </span>
                  ) : isActive ? (
                    "Current Plan"
                  ) : isDowngrade ? (
                    "Downgrade"
                  ) : plan === "FREE" ? (
                    "Free"
                  ) : (
                    "Upgrade"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
