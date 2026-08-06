"use client";
import { ChevronRight, Loader2, Search } from "lucide-react";
import { CheckCircle2, Package, ShoppingBag, Truck, Undo2 } from "@/components/icons/FilledIcons";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderStatus {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  timeline: Array<{ status: string; date: string; description: string }>;
  shippingAddress?: { name: string; address: string; city: string };
}

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const statusSteps = ["pending", "processing", "shipped", "delivered"];

function getStepIndex(status: string): number {
  const s = status.toLowerCase();
  const idx = statusSteps.indexOf(s);
  return idx >= 0 ? idx : 0;
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "delivered": return CheckCircle2;
    case "shipped": case "in_transit": return Truck;
    default: return Package;
  }
}

/* ───────── Return request ───────── */

interface ReturnableItem { id: string; name: string; variantName: string | null; quantity: number; image: string | null }
interface ExistingReturn {
  id: string; status: string; reason: string;
  refundAmount: number | null; refundMethod: string | null;
  createdAt: string; resolvedAt: string | null;
}

const RETURN_REASONS = [
  "Item arrived damaged",
  "Wrong item received",
  "Item doesn't match description",
  "No longer needed",
  "Changed my mind",
  "Other",
];

const returnStatusCopy: Record<string, { label: string; color: string; bg: string }> = {
  REQUESTED: { label: "Return requested", color: "#2f2a7a", bg: "#edecf9" },
  APPROVED: { label: "Return approved", color: "#1f9d63", bg: "#e7f6ee" },
  REJECTED: { label: "Return declined", color: "#e15241", bg: "#fdeceb" },
  RECEIVED: { label: "Item received", color: "#c97f1e", bg: "#fbeed9" },
  REFUNDED: { label: "Refunded", color: "#1f9d63", bg: "#e7f6ee" },
  CLOSED: { label: "Closed", color: "#6b7280", bg: "#f3f4f6" },
};

function ReturnRequestSection({ slug, orderNumber, currency }: { slug: string; orderNumber: string; currency: string }) {
  const [stage, setStage] = useState<"closed" | "email" | "form" | "success">("closed");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [items, setItems] = useState<ReturnableItem[]>([]);
  const [existing, setExisting] = useState<ExistingReturn | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const checkEligibility = async () => {
    if (!email.trim()) return;
    setChecking(true);
    setCheckError("");
    try {
      const res = await fetch(`/api/storefront/${slug}/orders/${encodeURIComponent(orderNumber)}/returns?email=${encodeURIComponent(email.trim())}`);
      const json = await res.json();
      if (!json.success) {
        setCheckError(json.error || "Couldn't verify that email against this order.");
        setChecking(false);
        return;
      }
      if (json.data.existingReturn) {
        setExisting(json.data.existingReturn);
        setStage("form");
      } else {
        setItems(json.data.items || []);
        setSelected(Object.fromEntries((json.data.items || []).map((i: ReturnableItem) => [i.id, i.quantity])));
        setExisting(null);
        setStage("form");
      }
    } catch {
      setCheckError("Something went wrong. Please try again.");
    }
    setChecking(false);
  };

  const toggleItem = (id: string, maxQty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = maxQty;
      return next;
    });
  };

  const submitReturn = async () => {
    const chosen = Object.entries(selected).map(([id, quantity]) => ({ id, quantity }));
    if (chosen.length === 0) { setSubmitError("Select at least one item to return."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/storefront/${slug}/orders/${encodeURIComponent(orderNumber)}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), reason, notes: notes.trim() || undefined, items: chosen }),
      });
      const json = await res.json();
      if (!json.success) {
        setSubmitError(json.error || "Failed to submit return request.");
        setSubmitting(false);
        return;
      }
      setStage("success");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (stage === "closed") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Need to return something?</h3>
          <p className="text-xs text-gray-500 mt-0.5">Request a return or refund for this order.</p>
        </div>
        <button
          onClick={() => setStage("email")}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: "#2f2a7a" }}
        >
          <Undo2 className="h-4 w-4" /> Request a Return
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Request a Return</h3>
      <p className="text-xs text-gray-500 mb-5">We just need to confirm this order is yours.</p>

      {stage === "email" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email used on this order</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkEligibility()}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: checkError ? "#e15241" : undefined }}
              autoFocus
            />
            {checkError && <p className="mt-1.5 text-xs" style={{ color: "#e15241" }}>{checkError}</p>}
          </div>
          <button
            onClick={checkEligibility}
            disabled={checking || !email.trim()}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#2f2a7a" }}
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue
          </button>
        </div>
      )}

      {stage === "form" && existing && (
        <div className="rounded-xl p-4" style={{ background: returnStatusCopy[existing.status]?.bg || "#f3f4f6" }}>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ color: returnStatusCopy[existing.status]?.color, background: "white" }}
          >
            {returnStatusCopy[existing.status]?.label || existing.status}
          </span>
          <p className="text-sm text-gray-700 mt-3">{existing.reason}</p>
          {existing.refundAmount !== null && (
            <p className="text-sm font-semibold text-gray-900 mt-2">
              Refund: {formatCurrency(existing.refundAmount, currency)}{existing.refundMethod ? ` · ${existing.refundMethod}` : ""}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">Requested {new Date(existing.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      {stage === "form" && !existing && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Which items?</label>
            <div className="space-y-2">
              {items.map((item) => (
                <label key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={item.id in selected}
                    onChange={() => toggleItem(item.id, item.quantity)}
                    className="h-4 w-4"
                    style={{ accentColor: "#2f2a7a" }}
                  />
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                  </div>
                  {item.id in selected && item.quantity > 1 && (
                    <select
                      value={selected[item.id]}
                      onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border border-gray-200 rounded-md px-2 py-1"
                    >
                      {Array.from({ length: item.quantity }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
            >
              {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Anything else? (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any details that will help the store process your return faster."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"
            />
          </div>

          {submitError && <p className="text-xs" style={{ color: "#e15241" }}>{submitError}</p>}

          <button
            onClick={submitReturn}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#2f2a7a" }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
            Submit Return Request
          </button>
        </div>
      )}

      {stage === "success" && (
        <div className="text-center py-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#e7f6ee" }}>
            <CheckCircle2 className="h-6 w-6" style={{ color: "#1f9d63" }} />
          </div>
          <h4 className="font-semibold text-gray-900">Return requested</h4>
          <p className="text-sm text-gray-500 mt-1">The store will review your request and get back to you.</p>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [searchInput, setSearchInput] = useState(initialOrder);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const trackOrder = async (num?: string) => {
    const query = num || searchInput.trim();
    if (!query) return;
    setOrderNumber(query);
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`/api/storefront/${slug}/orders/${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
      } else {
        setOrder(null);
        setError(json.error || "Order not found");
      }
    } catch {
      setOrder(null);
      setError("Failed to look up order. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialOrder) trackOrder(initialOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <ShoppingBag className="h-5 w-5" /> Store
          </Link>
          <Link href={`/store/${slug}/shop`} className="text-sm text-gray-500 hover:text-gray-900">Shop →</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={`/store/${slug}`} className="hover:text-gray-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Order Tracking</span>
        </nav>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Your Order</h1>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <p className="text-sm text-gray-600 mb-4">Enter your order number to track your delivery status.</p>
          <form onSubmit={(e) => { e.preventDefault(); trackOrder(); }} className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="e.g. ORD-12345"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" /></div>
        )}

        {!loading && error && searched && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-2">Order not found</h2>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        )}

        {!loading && order && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Order #{order.orderNumber}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="font-semibold text-gray-900">{formatCurrency(order.total, order.currency)}</div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between mb-2">
                {statusSteps.map((step, i) => {
                  const active = i <= currentStep;
                  const Icon = i === currentStep ? getStatusIcon(order.status) : (i < currentStep ? CheckCircle2 : Package);

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs mt-2 capitalize ${active ? "text-gray-900 font-medium" : "text-gray-400"}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center mt-1 mx-5">
                {statusSteps.slice(0, -1).map((_, i) => (
                  <div key={i} className={`flex-1 h-1 rounded ${i < currentStep ? "bg-gray-900" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="h-5 w-5 text-gray-300 m-auto mt-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity, order.currency)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  {order.timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-gray-900" : "bg-gray-300"}`} />
                        {i < order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-medium text-gray-900 capitalize">{event.status}</div>
                        <div className="text-xs text-gray-500">{event.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(event.date).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ReturnRequestSection slug={slug} orderNumber={order.orderNumber} currency={order.currency} />
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Enter your order number above to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
