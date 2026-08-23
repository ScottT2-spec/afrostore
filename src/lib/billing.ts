// ─── PLATFORM BILLING (Paystack Subscriptions) ─────────────

export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  STARTER: { monthly: 500000, yearly: 5000000 },     // kobo
  BUSINESS: { monthly: 1500000, yearly: 15000000 },
  GROWTH: { monthly: 3500000, yearly: 35000000 },
};

export const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["Subdomain", "5 products", "Basic analytics", "Platform branding"],
  STARTER: ["Custom domain", "50 products", "Payment gateways", "No branding"],
  BUSINESS: ["Unlimited products", "Advanced analytics", "Coupons", "Abandoned cart"],
  GROWTH: ["Everything in Business", "AI tools", "A/B testing", "Priority support"],
};

export const PLAN_DISPLAY_PRICES: Record<string, { monthly: string; yearly: string }> = {
  FREE: { monthly: "₦0", yearly: "₦0" },
  STARTER: { monthly: "₦5,000", yearly: "₦50,000" },
  BUSINESS: { monthly: "₦15,000", yearly: "₦150,000" },
  GROWTH: { monthly: "₦35,000", yearly: "₦350,000" },
};

// ─── STORE LIMITS ───────────────────────────────────────────
// How many stores a workspace on each plan may create. FREE uses the
// platform-wide admin setting (Settings > Platform, default 5) instead of
// a hardcoded number here, since that's already an existing admin-
// configurable knob — no separate one needed for the free tier.
// AGENCY/ENTERPRISE are effectively unlimited (agencies host many client
// stores by design).
export const PLAN_STORE_LIMITS: Record<string, number> = {
  STARTER: 1,
  BUSINESS: 3,
  GROWTH: 10,
  AGENCY: 100,
  ENTERPRISE: Infinity,
};

export function getStoreLimitForPlan(plan: string, platformFreeLimit: number): number {
  if (plan === "FREE") return platformFreeLimit;
  return PLAN_STORE_LIMITS[plan] ?? platformFreeLimit;
}

const PAYSTACK_BASE = "https://api.paystack.co";

export async function getOrCreatePaystackPlan(
  planName: string,
  amount: number,
  interval: string,
  secretKey: string
): Promise<{ plan_code: string }> {
  // List existing plans to check if it exists
  const listRes = await fetch(`${PAYSTACK_BASE}/plan`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const listData = await listRes.json();

  if (listData.status && listData.data) {
    const existing = listData.data.find(
      (p: { name: string; amount: number; interval: string }) =>
        p.name === planName && p.amount === amount && p.interval === interval
    );
    if (existing) return { plan_code: existing.plan_code };
  }

  // Create new plan
  const createRes = await fetch(`${PAYSTACK_BASE}/plan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: planName, amount, interval }),
  });
  const createData = await createRes.json();
  if (!createData.status) throw new Error(createData.message || "Failed to create Paystack plan");
  return { plan_code: createData.data.plan_code };
}

export async function getOrCreatePaystackCustomer(
  email: string,
  firstName: string,
  lastName: string,
  secretKey: string
): Promise<{ customer_code: string }> {
  // Try to fetch existing customer
  const fetchRes = await fetch(`${PAYSTACK_BASE}/customer/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const fetchData = await fetchRes.json();

  if (fetchData.status && fetchData.data?.customer_code) {
    return { customer_code: fetchData.data.customer_code };
  }

  // Create new customer
  const createRes = await fetch(`${PAYSTACK_BASE}/customer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
    }),
  });
  const createData = await createRes.json();
  if (!createData.status) throw new Error(createData.message || "Failed to create Paystack customer");
  return { customer_code: createData.data.customer_code };
}
