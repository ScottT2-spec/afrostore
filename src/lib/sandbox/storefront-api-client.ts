/**
 * Generates src/lib/storefront-api.ts — the ONE place a generated project
 * talks to the real backend. Every function here calls an endpoint that
 * genuinely exists and was verified against its actual route handler and
 * validator, not guessed at. This exists because without it, "add to
 * cart" / "checkout" / "leave a review" etc. in an AI-generated site had
 * no correct way to reach the real backend at all — the agent would
 * either invent fake local-only behavior or hallucinate wrong endpoint
 * shapes, and a merchant would never see a real order, review, or
 * subscriber show up anywhere in their dashboard no matter how good the
 * generated UI looked.
 *
 * Two identifiers, not one — see config.ts: most endpoints resolve by
 * STORE_SLUG (/api/storefront/:slug/...), but orders and checkout
 * specifically resolve only by STORE_ID (/api/sites/:siteId/...). Each
 * function below already uses the correct one; nothing calling this file
 * needs to know or care about that inconsistency.
 *
 * Auth note: customer login/register/wishlist use an httpOnly session
 * cookie (see auth() functions below) — every fetch here sends
 * credentials: "include" for exactly that reason. Omit it and the
 * customer session silently won't work.
 */
export function getStorefrontApiClient(): string {
  return `import { STORE_SLUG, STORE_ID } from "./config";

const STOREFRONT_BASE = \`/api/storefront/\${STORE_SLUG}\`;
const SITE_BASE = \`/api/sites/\${STORE_ID}\`;

export class StorefrontApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "StorefrontApiError";
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new StorefrontApiError(json?.error || \`Request to \${url} failed (\${res.status})\`, res.status);
  }
  return json.data as T;
}

// ─── Products ────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  stock: number;
  trackInventory: boolean;
  isFeatured: boolean;
  tags: string[];
}

export interface ProductListResult {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function getProducts(opts?: { category?: string; sort?: "newest" | "price-asc" | "price-desc" | "name"; page?: number; limit?: number }): Promise<ProductListResult> {
  const params = new URLSearchParams();
  if (opts?.category) params.set("category", opts.category);
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return request(\`\${STOREFRONT_BASE}/products\${qs ? \`?\${qs}\` : ""}\`);
}

export function getProduct(productSlug: string): Promise<Product & { variants?: unknown[] }> {
  return request(\`\${STOREFRONT_BASE}/products/\${productSlug}\`);
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
}

export function getCategories(): Promise<Category[]> {
  return request(\`\${STOREFRONT_BASE}/categories\`);
}

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  freeAbove: number | null;
  estimatedDays: string | null;
}

export function getDeliveryZones(): Promise<{ zones: DeliveryZone[] }> {
  return request(\`\${STOREFRONT_BASE}/delivery-zones\`);
}

// ─── Reviews ─────────────────────────────────────────────────
export interface Review {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
}

export function getProductReviews(productSlug: string, opts?: { page?: number; limit?: number; sort?: "newest" | "highest" | "lowest" }): Promise<{ reviews: Review[]; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.sort) params.set("sort", opts.sort);
  const qs = params.toString();
  return request(\`\${STOREFRONT_BASE}/products/\${productSlug}/reviews\${qs ? \`?\${qs}\` : ""}\`);
}

export function submitProductReview(productSlug: string, review: { name: string; email: string; rating: number; title?: string; body?: string }): Promise<Review> {
  return request(\`\${STOREFRONT_BASE}/products/\${productSlug}/reviews\`, { method: "POST", body: JSON.stringify(review) });
}

// ─── Cart (pricing/validation only — NOT a stored cart; hold cart
//     state yourself, e.g. React state or localStorage, and call this
//     to get live, accurate prices/stock/tax before checkout) ────
export interface CartPriceResult {
  items: Array<{ productId: string; variantId?: string; quantity: number; unitPrice: number; lineTotal: number; inStock: boolean }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

export function validateCart(items: Array<{ productId: string; variantId?: string; quantity: number }>): Promise<CartPriceResult> {
  return request(\`\${STOREFRONT_BASE}/cart\`, { method: "POST", body: JSON.stringify({ items }) });
}

// ─── Checkout — real 3-step flow, in order ──────────────────────
// 1. createOrder()      — creates the order (guest checkout, no login required)
// 2. initiateCheckout() — takes the order ID, returns a payment URL to send the customer to
// 3. verifyPayment()    — after the customer returns from the payment page, confirm it went through
export interface CreateOrderInput {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  items: Array<{ productId: string; variantId?: string; quantity: number }>;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country?: string;
    postalCode?: string;
    deliveryInstructions?: string;
  };
  deliveryZoneId?: string;
  paymentMethod: string;
  couponCode?: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return request(\`\${SITE_BASE}/orders\`, { method: "POST", body: JSON.stringify(input) });
}

export function lookupOrdersByEmail(email: string): Promise<Order[]> {
  return request(\`\${STOREFRONT_BASE}/orders?email=\${encodeURIComponent(email)}\`);
}

export function initiateCheckout(orderId: string, provider: string, callbackUrl: string): Promise<{ paymentUrl: string; reference: string }> {
  return request(\`\${SITE_BASE}/checkout\`, { method: "POST", body: JSON.stringify({ orderId, provider, callbackUrl }) });
}

// Which provider(s) the merchant has actually enabled — initiateCheckout
// requires an exact match and 400s otherwise, so call this first rather
// than guessing a provider name.
export function getAvailablePaymentMethods(): Promise<{ providers: Array<"PAYSTACK" | "FLUTTERWAVE" | "MONNIFY"> }> {
  return request(\`\${STOREFRONT_BASE}/payment-methods\`);
}

export function verifyPayment(reference: string): Promise<{ status: string; order: Order }> {
  return request(\`\${SITE_BASE}/checkout/verify\`, { method: "POST", body: JSON.stringify({ reference }) });
}

// ─── Coupons ─────────────────────────────────────────────────
export function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message?: string }> {
  return request(\`\${STOREFRONT_BASE}/coupons/validate?code=\${encodeURIComponent(code)}&subtotal=\${subtotal}\`);
}

// ─── Newsletter ──────────────────────────────────────────────
export function subscribeNewsletter(email: string): Promise<{ subscribed: boolean }> {
  return request(\`\${STOREFRONT_BASE}/newsletter\`, { method: "POST", body: JSON.stringify({ email }) });
}

// ─── Contact form ────────────────────────────────────────────
export function submitContactForm(input: { name: string; email: string; subject?: string; message: string }): Promise<{ sent: boolean }> {
  return request(\`\${STOREFRONT_BASE}/contact\`, { method: "POST", body: JSON.stringify(input) });
}

// ─── Loyalty ─────────────────────────────────────────────────
export function lookupLoyalty(email: string): Promise<{ points: number; tier: string } | null> {
  return request(\`\${STOREFRONT_BASE}/loyalty/lookup?email=\${encodeURIComponent(email)}\`);
}

export function joinLoyalty(email: string): Promise<{ points: number; tier: string }> {
  return request(\`\${STOREFRONT_BASE}/loyalty/join\`, { method: "POST", body: JSON.stringify({ email }) });
}

// ─── Customer account (session cookie — see request()'s
//     credentials: "include" above) ─────────────────────────
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
}

export function registerCustomer(input: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<Customer> {
  return request(\`\${STOREFRONT_BASE}/auth/register\`, { method: "POST", body: JSON.stringify(input) });
}

export function loginCustomer(email: string, password: string): Promise<Customer> {
  return request(\`\${STOREFRONT_BASE}/auth/login\`, { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    return await request<Customer>(\`\${STOREFRONT_BASE}/auth/me\`);
  } catch {
    return null; // not logged in — expected, not an error condition to surface to the user
  }
}

export function logoutCustomer(): Promise<void> {
  return request(\`\${STOREFRONT_BASE}/auth/me\`, { method: "DELETE" });
}

// ─── Wishlist (requires a logged-in customer — get customerId from
//     getCurrentCustomer() first) ───────────────────────────────
export function getWishlist(customerId: string): Promise<{ productIds: string[] }> {
  return request(\`\${STOREFRONT_BASE}/wishlists?customerId=\${customerId}\`);
}

export function addToWishlist(customerId: string, productId: string): Promise<void> {
  return request(\`\${STOREFRONT_BASE}/wishlists\`, { method: "POST", body: JSON.stringify({ customerId, productId }) });
}

export function removeFromWishlist(customerId: string, productId: string): Promise<void> {
  return request(\`\${STOREFRONT_BASE}/wishlists?customerId=\${customerId}&productId=\${productId}\`, { method: "DELETE" });
}
`;
}

export const STOREFRONT_API_DESCRIPTION = `- src/lib/storefront-api.ts: the ONLY way to talk to the real backend — every commerce/account feature (products, cart pricing, checkout, orders, delivery zones, reviews, wishlist, newsletter, coupons, loyalty, contact form, customer login) goes through the typed functions in this file. NEVER invent your own fetch() calls to guessed endpoints, and never fake cart/checkout/reviews/etc. with only local state — that means the merchant would never see a real order, review, or subscriber anywhere in their dashboard no matter how correct the UI looks. If a request seems related to any of these features, import and call the matching function from this file.
  Checkout is a real 3-step flow — get this exactly right, it's real money:
    1. createOrder() with the cart items + customer + delivery details.
    2. Call getAvailablePaymentMethods() FIRST — initiateCheckout() requires an exact provider match ("PAYSTACK" | "FLUTTERWAVE" | "MONNIFY") and fails with "not configured for this store" for any provider the merchant hasn't set up. Never hardcode/guess a provider. If none are configured, tell the customer payment isn't available yet rather than attempting checkout — that's a real, expected state for a new store, not a bug to work around.
    3. initiateCheckout(order.id, provider, callbackUrl) — callbackUrl must be a full URL to a route IN THIS PROJECT that you build (e.g. "/checkout/complete"), registered in App.tsx like any other page. This is where the customer lands after paying.
    4. Redirect with window.location.href = result.paymentUrl — a full page navigation, NOT react-router's navigate(). The customer is leaving this app entirely for the payment provider's own hosted page; a client-side route change won't take them there.
    5. Build that /checkout/complete route: on mount, read the "reference" query param from the URL (the payment provider appends it when redirecting back), call verifyPayment(reference), and show success or failure based on the result. This page is not optional — without it, a customer who actually pays has nowhere to land and no confirmation, even though their order was really created.
  Cart is NOT stored server-side — hold cart items yourself (React state/localStorage) and call validateCart() for live pricing before checkout.
  Wishlist requires a logged-in customer — call getCurrentCustomer() first to get their id.`;
