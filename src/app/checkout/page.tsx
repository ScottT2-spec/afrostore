"use client";
import { ArrowRight, ChevronLeft, Loader2, Plus } from "lucide-react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Receipt as ReceiptIcon,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  Trash2,
  Truck,
} from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { trackEvent } from "@/lib/storefront-analytics";
import { trackABTestConversion } from "@/hooks/useABTestVariant";
import { syncWishlistOnIdentify } from "@/hooks/useWishlist";
import { useAbandonedCartTracking } from "@/hooks/useAbandonedCartTracking";

/* ───────── Types ───────── */

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  inStock: boolean;
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
}

interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  freeAbove?: number;
  estimatedDays?: string;
}

/* ───────── Helpers ───────── */

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Palette swatches for products without a photo — derived from the page's own
// indigo / marigold / coral system instead of a generic rainbow set.
const SWATCHES = [
  "from-[#2F2A7A] to-[#4038A8]",
  "from-[#E8A33D] to-[#C97F1E]",
  "from-[#1F9D63] to-[#167A4C]",
  "from-[#E15241] to-[#B8392A]",
  "from-[#4C46B0] to-[#332D8C]",
  "from-[#D9891F] to-[#E8A33D]",
];

function getSwatch(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return SWATCHES[Math.abs(hash) % SWATCHES.length];
}

const paymentMethods = [
  { id: "PAYSTACK", name: "Card payment", desc: "Visa, Mastercard, Verve", icon: CreditCard, badges: ["VISA", "MASTERCARD", "VERVE"] as string[] },
  { id: "MONNIFY", name: "Bank transfer / USSD", desc: "Pay directly from your bank app", icon: Building2, badges: ["USSD", "BANK"] as string[] },
  { id: "FLUTTERWAVE", name: "Flutterwave", desc: "Cards, mobile money, bank transfer", icon: Smartphone, badges: ["MOMO", "CARD"] as string[] },
  { id: "COD", name: "Pay on delivery", desc: "Cash or transfer when it arrives", icon: Truck, badges: [] as string[] },
];

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara", "FCT (Abuja)",
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/* ───────── Shared chrome: fonts + design tokens ───────── */
/* "Adire" system — named after the indigo-resist-dyed cloth of Yorubaland:
   deep indigo + dye-pot marigold on undyed-cotton chalk, with a receipt/
   ledger motif (mono figures, stitched dividers, punch-hole edges) that
   reflects both "your money, precisely accounted for" and the running
   stitch you'd find on real adire and aso-oke fabric. */
function CheckoutChrome() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
      />
      <style>{`
        :root {
          --co-ink: #14132f;
          --co-indigo: #2f2a7a;
          --co-indigo-deep: #1e1a57;
          --co-indigo-soft: #edecf9;
          --co-indigo-ring: rgba(47,42,122,0.14);
          --co-marigold: #e8a33d;
          --co-marigold-deep: #c97f1e;
          --co-marigold-soft: #fbeed9;
          --co-chalk: #f5f4f9;
          --co-paper: #ffffff;
          --co-coral: #e15241;
          --co-coral-soft: #fdeceb;
          --co-coral-ring: rgba(225,82,65,0.14);
          --co-green: #1f9d63;
          --co-green-soft: #e7f6ee;
          --co-line: #e4e2ed;
        }
        .co-font-display { font-family: 'Fraunces', Georgia, serif; }
        .co-font-mono { font-family: 'Space Mono', ui-monospace, SFMono-Regular, monospace; font-variant-numeric: tabular-nums; }
        .co-font-body { font-family: 'Inter', system-ui, sans-serif; }
        .co-scallop {
          -webkit-mask-image: radial-gradient(circle at 9px 6px, transparent 5px, #000 5.5px);
          mask-image: radial-gradient(circle at 9px 6px, transparent 5px, #000 5.5px);
          -webkit-mask-size: 18px 12px;
          mask-size: 18px 12px;
          -webkit-mask-repeat: repeat-x;
          mask-repeat: repeat-x;
        }
        .co-stitch {
          height: 1px;
          background-image: repeating-linear-gradient(to right, var(--co-line) 0 6px, transparent 6px 12px);
        }
        .co-barcode {
          background-image: repeating-linear-gradient(to right,
            var(--co-ink) 0 2px, transparent 2px 5px,
            var(--co-ink) 5px 6px, transparent 6px 9px,
            var(--co-ink) 9px 12px, transparent 12px 14px,
            var(--co-ink) 14px 15px, transparent 15px 19px);
          opacity: 0.14;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
}

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[var(--co-coral)]">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  );
}

const fieldBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--co-ink)] placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-4";
const fieldOk = "border-[var(--co-line)] focus:border-[var(--co-indigo)] focus:ring-[var(--co-indigo-ring)]";
const fieldErr = "border-[var(--co-coral)] focus:border-[var(--co-coral)] focus:ring-[var(--co-coral-ring)]";
function fieldClass(hasError: boolean) {
  return `${fieldBase} ${hasError ? fieldErr : fieldOk}`;
}

/* ───────── Component ───────── */

export default function CheckoutPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const cardMotion = (i: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
        };

  // Load cart + store info from localStorage (set by storefront)
  const [activeSlug] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("prokip_cart_active_slug") || "";
  });
  const cartKey = activeSlug ? `prokip_cart_${activeSlug}` : "prokip_cart";
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });
  const [siteId, setStoreId] = useState("");
  const [storeSlug, setStoreSlug] = useState(activeSlug);
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Debounce email/phone before reporting them to abandoned-cart tracking -
  // no need to hit the API on every keystroke, just once typing settles.
  const [debouncedContact, setDebouncedContact] = useState({ email: "", phone: "" });
  useEffect(() => {
    const t = setTimeout(() => setDebouncedContact({ email, phone }), 1200);
    return () => clearTimeout(t);
  }, [email, phone]);
  useAbandonedCartTracking(storeSlug, siteId, debouncedContact);

  // Look up the customer's loyalty balance once their email settles (same
  // debounce as abandoned-cart tracking) — guest checkout has no session,
  // so email is the only identity we have at this point.
  useEffect(() => {
    if (!storeSlug || !emailValid) { setLoyaltyEnabled(false); setAvailablePoints(0); return; }
    fetch(`/api/storefront/${storeSlug}/loyalty/lookup?email=${encodeURIComponent(debouncedContact.email)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setLoyaltyEnabled(!!json.data.enabled);
          setIsLoyaltyMember(!!json.data.isMember);
          setAvailablePoints(json.data.availablePoints || 0);
          setRedemptionRate(json.data.redemptionRate || 0);
          setMinRedeemPoints(json.data.minRedeemPoints || 0);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContact.email, storeSlug]);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAYSTACK");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);

  // Loyalty points redemption
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [isLoyaltyMember, setIsLoyaltyMember] = useState(false);
  const [joinLoyalty, setJoinLoyalty] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [redemptionRate, setRedemptionRate] = useState(0);
  const [minRedeemPoints, setMinRedeemPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [redeemChecked, setRedeemChecked] = useState(false);

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const firstNameValid = firstName.trim().length > 0;
  const lastNameValid = lastName.trim().length > 0;
  const addressValid = address.trim().length > 0;
  const cityValid = city.trim().length > 0;
  const stateValid = state.trim().length > 0;

  const contactComplete = firstNameValid && lastNameValid && emailValid && phoneValid;
  const deliveryComplete = addressValid && cityValid && stateValid;
  const currentStepIndex = !contactComplete ? 0 : !deliveryComplete ? 1 : 2;
  const STEPS = [
    { label: "Details", complete: contactComplete },
    { label: "Delivery", complete: deliveryComplete },
    { label: "Payment", complete: false },
  ];

  // Status
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setStoreId(localStorage.getItem("prokip_siteId") || "");
      setStoreSlug(localStorage.getItem("prokip_storeSlug") || "");
      setStoreName(localStorage.getItem("prokip_storeName") || "");
      setCurrency(localStorage.getItem("prokip_currency") || "NGN");
      const dz = localStorage.getItem("prokip_deliveryZones");
      if (dz) {
        const zones = JSON.parse(dz);
        setDeliveryZones(zones);
        if (zones.length > 0) setSelectedZone(zones[0].id);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Cart helpers
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0);
      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  };

  const subtotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const zone = deliveryZones.find((z) => z.id === selectedZone);
  const zoneFreeAbove = zone?.freeAbove ? Number(zone.freeAbove) : null;
  const baseDeliveryFee = zone ? (zoneFreeAbove && subtotal >= zoneFreeAbove ? 0 : Number(zone.fee)) : 0;
  const deliveryFee = couponApplied && couponFreeShipping ? 0 : baseDeliveryFee;
  const appliedDiscount = couponApplied ? Math.min(couponDiscount, subtotal) : 0;
  const loyaltyDiscount = redeemChecked && redeemPoints > 0 ? Math.round(redeemPoints * redemptionRate * 100) / 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - appliedDiscount - loyaltyDiscount);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    if (!storeSlug) { setCouponError("Store information missing. Go back to the store and try again."); return; }

    setCouponValidating(true);
    setCouponError("");
    setCouponApplied(false);
    try {
      const res = await fetch(`/api/storefront/${storeSlug}/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
      const json = await res.json();
      if (!json.success) {
        setCouponError(json.error || "This discount code isn't valid");
        setCouponDiscount(0);
        setCouponFreeShipping(false);
        return;
      }
      setCouponDiscount(json.data.discountAmount || 0);
      setCouponFreeShipping(!!json.data.freeShipping);
      setCouponApplied(true);
    } catch {
      setCouponError("Couldn't validate this code right now. Please try again.");
    } finally {
      setCouponValidating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!siteId) { setOrderError("Store information missing. Go back to the store and try again."); return; }
    if (!firstName || !lastName || !email || !phone) {
      setTouched((t) => ({ ...t, firstName: true, lastName: true, email: true, phone: true }));
      setOrderError("Please fill in all contact information.");
      return;
    }
    if (!address || !city || !state) {
      setTouched((t) => ({ ...t, address: true, city: true, state: true }));
      setOrderError("Please fill in your delivery address.");
      return;
    }
    if (cart.length === 0) { setOrderError("Your cart is empty."); return; }

    setPlacing(true);
    setOrderError("");

    try {
      // 1. Create the order
      const orderRes = await fetch(`/api/sites/${siteId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || undefined,
            quantity: i.quantity,
          })),
          firstName,
          lastName,
          email,
          phone,
          deliveryAddress: { line1: address, city, state, country: "Nigeria", deliveryInstructions },
          deliveryZoneId: selectedZone || undefined,
          paymentMethod: paymentMethod === "COD" ? "PAY_ON_DELIVERY" : paymentMethod,
          couponCode: couponCode.trim() || undefined,
          redeemPoints: redeemChecked && redeemPoints > 0 ? redeemPoints : undefined,
          joinLoyalty: !isLoyaltyMember && joinLoyalty ? true : undefined,
          note: deliveryInstructions || undefined,
        }),
      });

      const orderJson = await orderRes.json();

      if (!orderJson.success) {
        setOrderError(orderJson.error || "Failed to place order. Please try again.");
        setPlacing(false);
        return;
      }

      const order = orderJson.data;
      if (order?.customer?.id && siteId) {
        syncWishlistOnIdentify(siteId, storeSlug, order.customer.id);
      }

      // Attribute this order to an affiliate referral, if the customer
      // arrived via a tracked ?ref= link earlier in this browser session.
      const refId = getCookie("afro_ref_id");
      const refCode = getCookie("afro_ref_code");
      if (refId || refCode) {
        fetch(`/api/sites/${siteId}/referrals/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralId: refId || undefined, affiliateCode: refCode || undefined, orderId: order.id }),
        }).catch(() => { /* non-critical - never block checkout over referral attribution */ });
      }

      // 2. If pay on delivery, we're done
      if (paymentMethod === "COD") {
        // Clear cart
        localStorage.removeItem(cartKey);
        setCart([]);
        setOrderSuccess({ orderNumber: order.orderNumber, orderId: order.id });
        if (storeSlug) trackEvent(storeSlug, "purchase", { orderId: order.id, metadata: { value: total, currency } });
        trackABTestConversion(storeSlug);
        setPlacing(false);
        return;
      }

      // 3. Initialize payment
      const payRes = await fetch(`/api/sites/${siteId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          provider: paymentMethod,
          callbackUrl: `${window.location.origin}/checkout?status=pending&order=${order.orderNumber}`,
        }),
      });

      const payJson = await payRes.json();

      if (payJson.success && payJson.data?.paymentUrl) {
        const ref = payJson.data.reference;
        // Clear cart
        localStorage.removeItem(cartKey);
        setCart([]);
        // Store reference for verification on return
        if (ref) sessionStorage.setItem("afro_pay_ref", ref);
        // Redirect to payment page
        window.location.href = payJson.data.paymentUrl;
        return;
      }

      // Payment init failed but order was created — show partial success
      localStorage.removeItem(cartKey);
      setCart([]);
      setOrderSuccess({ orderNumber: order.orderNumber, orderId: order.id });
      trackABTestConversion(storeSlug);
      const reason = typeof payJson.error === "string" ? payJson.error : null;
      setOrderError(
        reason
          ? `Order placed, but payment could not be started: ${reason}. Please contact the store to complete payment.`
          : "Order placed but payment initialization failed. Please contact the store to complete payment."
      );
      setPlacing(false);
    } catch (err) {
      setOrderError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  // Check for payment return — verify server-side
  const [verifying, setVerifying] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderNum = params.get("order");
    if (!status || !orderNum) return;

    const ref = params.get("ref") || sessionStorage.getItem("afro_pay_ref");
    localStorage.removeItem(cartKey);
    setCart([]);
    sessionStorage.removeItem("afro_pay_ref");

    if (ref && siteId) {
      // Verify payment server-side
      setVerifying(true);
      fetch(`/api/sites/${siteId}/checkout/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.data?.status === "SUCCESS") {
            setOrderSuccess({ orderNumber: orderNum, orderId: json.data.orderId || "" });
            if (storeSlug) trackEvent(storeSlug, "purchase", { orderId: json.data.orderId, metadata: { value: json.data.amount, currency } });
            trackABTestConversion(storeSlug);
          } else if (json.success && json.data?.status === "PENDING") {
            // Webhook may still be processing
            setOrderSuccess({ orderNumber: orderNum, orderId: "" });
            setOrderError("Payment is being processed. You'll receive confirmation shortly.");
          } else {
            setOrderSuccess({ orderNumber: orderNum, orderId: "" });
            setOrderError("We couldn't confirm your payment yet. If you were charged, please contact the store.");
          }
        })
        .catch(() => {
          // Fallback — show order but flag uncertainty
          setOrderSuccess({ orderNumber: orderNum, orderId: "" });
        })
        .finally(() => setVerifying(false));
    } else {
      // No reference available — fallback to old behavior
      setOrderSuccess({ orderNumber: orderNum, orderId: "" });
    }
  }, [siteId]);

  /* ── Verifying Payment ── */
  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--co-chalk)] p-4 co-font-body">
        <CheckoutChrome />
        <div className="w-full max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--co-indigo), var(--co-indigo-deep)), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)",
              backgroundSize: "auto, 14px 14px",
            }}
          >
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="co-font-display mb-2 text-2xl font-bold text-[var(--co-ink)]">Verifying your payment…</h1>
          <p className="text-surface-500">Hang tight — this only takes a moment.</p>
        </div>
      </div>
    );
  }

  /* ── Order Success ── */
  if (orderSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--co-chalk)] p-4 co-font-body">
        <CheckoutChrome />
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--co-green), #167a4c), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)",
              backgroundSize: "auto, 14px 14px",
            }}
          >
            <CheckCircle2 className="h-9 w-9 text-white" />
          </div>
          <h1 className="co-font-display mb-2 text-3xl font-bold text-[var(--co-ink)]">Order placed</h1>
          <p className="mb-1 text-surface-500">
            Order <span className="co-font-mono font-bold text-[var(--co-ink)]">{orderSuccess.orderNumber}</span> is confirmed.
          </p>
          {paymentMethod === "COD" ? (
            <p className="mb-6 text-sm text-surface-400">You&apos;ll pay when it&apos;s delivered to your door.</p>
          ) : (
            <div className="mb-6" />
          )}
          {orderError && (
            <div className="mb-6 rounded-xl border border-[var(--co-marigold)] bg-[var(--co-marigold-soft)] px-4 py-3 text-sm text-[var(--co-marigold-deep)]">
              {orderError}
            </div>
          )}
          <div className="flex justify-center gap-3">
            {storeSlug && (
              <Link
                href={`/store/${storeSlug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--co-indigo)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--co-indigo-deep)] hover:shadow-xl active:translate-y-0"
              >
                <ShoppingBag className="h-4 w-4" /> Continue shopping
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Empty Cart ── */
  if (cart.length === 0 && !placing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--co-chalk)] p-4 co-font-body">
        <CheckoutChrome />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--co-line)] bg-white">
            <ShoppingCart className="h-9 w-9 text-surface-300" />
          </div>
          <h1 className="co-font-display mb-2 text-2xl font-bold text-[var(--co-ink)]">Your bag is empty</h1>
          <p className="mb-6 text-surface-500">Find something you&apos;ll love, then come back to check out.</p>
          {storeSlug ? (
            <Link
              href={`/store/${storeSlug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--co-indigo)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--co-indigo-deep)] hover:shadow-xl active:translate-y-0"
            >
              <ArrowRight className="h-4 w-4 rotate-180" /> Back to store
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--co-indigo)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--co-indigo-deep)] hover:shadow-xl active:translate-y-0"
            >
              <ArrowRight className="h-4 w-4 rotate-180" /> Go home
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--co-chalk)] co-font-body">
      <CheckoutChrome />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--co-line)] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {storeSlug ? (
              <Link href={`/store/${storeSlug}`} className="text-surface-400 transition-colors hover:text-[var(--co-indigo)]" aria-label="Back to store">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <button onClick={() => router.back()} className="text-surface-400 transition-colors hover:text-[var(--co-indigo)]" aria-label="Go back">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--co-indigo)]">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="co-font-display text-lg font-bold text-[var(--co-ink)]">Checkout</span>
            </div>
          </div>

          {/* Desktop stepper */}
          <div className="hidden items-center gap-2 sm:flex">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
                  style={
                    s.complete
                      ? { background: "var(--co-green)", color: "#fff" }
                      : i === currentStepIndex
                      ? { background: "var(--co-indigo)", color: "#fff" }
                      : { background: "var(--co-line)", color: "var(--co-ink)" }
                  }
                >
                  {s.complete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`text-xs font-semibold ${i === currentStepIndex ? "text-[var(--co-ink)]" : "text-surface-400"}`}>{s.label}</span>
                {i < STEPS.length - 1 && <div className="h-px w-6 bg-[var(--co-line)]" />}
              </div>
            ))}
          </div>

          <div className="hidden items-center gap-1.5 text-xs text-surface-400 lg:flex">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="flex items-center gap-1 px-4 pb-3 sm:hidden">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className="h-1 flex-1 rounded-full"
              style={{ background: s.complete || i === currentStepIndex ? "var(--co-indigo)" : "var(--co-line)" }}
            />
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:pb-10">
        {orderError && !orderSuccess && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-[var(--co-coral)] bg-[var(--co-coral-soft)] px-4 py-3 text-sm text-[var(--co-coral)]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Order Receipt — shown first on mobile, right column on desktop */}
          <div className="order-first lg:order-2 lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="co-scallop h-3 bg-white" />
              <div className="border-x border-[var(--co-line)] bg-white px-6 py-6">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--co-indigo)]">
                  <ReceiptIcon className="h-3.5 w-3.5" /> Order receipt
                </div>
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="co-font-display text-lg font-bold text-[var(--co-ink)]">{storeName || "Your order"}</h3>
                  <span className="co-font-mono text-[11px] text-surface-400">
                    {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>

                <div className="co-stitch mb-4" />

                <div className="mb-4 space-y-4">
                  {cart.map((item) => {
                    const hasImage = item.product.images?.length > 0 && item.product.images[0]?.url;
                    return (
                      <div key={item.productId} className="flex gap-3">
                        <div className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ${!hasImage ? `bg-gradient-to-br ${getSwatch(item.productId)}` : ""}`}>
                          {hasImage ? (
                            <img src={item.product.images[0].url} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : null}
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--co-ink)] text-[10px] font-bold text-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-[var(--co-ink)]">{item.product.name}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            <button onClick={() => updateQty(item.productId, -1)} aria-label={`Reduce ${item.product.name} quantity`} className="flex h-6 w-6 items-center justify-center rounded border border-[var(--co-line)] text-surface-500 hover:bg-surface-50">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-[var(--co-ink)]">{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, 1)} aria-label={`Increase ${item.product.name} quantity`} className="flex h-6 w-6 items-center justify-center rounded border border-[var(--co-line)] text-surface-500 hover:bg-surface-50">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button onClick={() => removeItem(item.productId)} aria-label={`Remove ${item.product.name}`} className="ml-auto p-1 text-surface-400 hover:text-[var(--co-coral)]">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="co-font-mono flex-shrink-0 text-sm font-bold text-[var(--co-ink)]">
                          {formatCurrency(Number(item.product.price) * item.quantity, currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="co-stitch mb-4" />

                <div className="mb-4 flex gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--co-line)] bg-[var(--co-chalk)] px-3 py-2">
                    <Tag className="h-4 w-4 text-surface-400" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setCouponError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                      className="co-font-mono flex-1 bg-transparent text-sm uppercase tracking-wide focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={couponValidating || !couponCode.trim()}
                    className="rounded-xl border border-[var(--co-line)] bg-white px-4 text-sm font-semibold text-[var(--co-ink)] transition-colors hover:border-[var(--co-indigo)] hover:text-[var(--co-indigo)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {couponValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponApplied && couponCode && (
                  <p className="-mt-3 mb-4 flex items-center gap-1 text-xs text-[var(--co-green)]">
                    <Check className="h-3 w-3" />
                    {couponFreeShipping ? "Free shipping applied" : `Discount applied: -${formatCurrency(couponDiscount, currency)}`}
                  </p>
                )}
                {couponError && (
                  <p className="-mt-3 mb-4 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" /> {couponError}
                  </p>
                )}

                {loyaltyEnabled && !isLoyaltyMember && (
                  <div className="mb-4 rounded-xl border border-[var(--co-line)] bg-[var(--co-chalk)] p-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={joinLoyalty}
                        onChange={(e) => setJoinLoyalty(e.target.checked)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--co-ink)]">Join our rewards program</p>
                        <p className="text-xs text-surface-500">Start earning points on this order — free to join.</p>
                      </div>
                    </label>
                  </div>
                )}

                {loyaltyEnabled && isLoyaltyMember && availablePoints >= minRedeemPoints && minRedeemPoints > 0 && (
                  <div className="mb-4 rounded-xl border border-[var(--co-line)] bg-[var(--co-chalk)] p-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redeemChecked}
                        onChange={(e) => {
                          setRedeemChecked(e.target.checked);
                          if (e.target.checked && redeemPoints === 0) setRedeemPoints(Math.min(availablePoints, minRedeemPoints));
                        }}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--co-ink)]">
                          Use your points — {availablePoints.toLocaleString()} available
                        </p>
                        <p className="text-xs text-surface-500">Worth up to {formatCurrency(availablePoints * redemptionRate, currency)}</p>
                      </div>
                    </label>
                    {redeemChecked && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="range"
                          min={minRedeemPoints}
                          max={availablePoints}
                          step={1}
                          value={Math.min(redeemPoints, availablePoints)}
                          onChange={(e) => setRedeemPoints(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="co-font-mono text-xs font-semibold text-[var(--co-ink)] w-28 text-right">
                          {redeemPoints.toLocaleString()} pts = -{formatCurrency(loyaltyDiscount, currency)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 border-b border-dashed border-[var(--co-line)] pb-4">
                  <div className="flex justify-between text-sm text-surface-500">
                    <span>Subtotal · {cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                    <span className="co-font-mono">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {couponApplied && appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-[var(--co-green)]">
                      <span>Discount ({couponCode})</span>
                      <span className="co-font-mono">-{formatCurrency(appliedDiscount, currency)}</span>
                    </div>
                  )}
                  {redeemChecked && loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-sm text-[var(--co-green)]">
                      <span>Points redeemed ({redeemPoints.toLocaleString()} pts)</span>
                      <span className="co-font-mono">-{formatCurrency(loyaltyDiscount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-surface-500">
                    <span>Delivery</span>
                    <span className="co-font-mono">
                      {deliveryFee === 0 ? <span className="font-semibold text-[var(--co-green)]">Free</span> : formatCurrency(deliveryFee, currency)}
                    </span>
                  </div>
                </div>

                <div className="mb-6 mt-4 flex items-baseline justify-between">
                  <span className="co-font-display text-base font-bold text-[var(--co-ink)]">Total</span>
                  <span className="co-font-mono text-2xl font-bold text-[var(--co-ink)]">{formatCurrency(total, currency)}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="hidden w-full items-center justify-center gap-2 rounded-xl bg-[var(--co-indigo)] py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--co-indigo-deep)] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
                >
                  {placing ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>
                  ) : paymentMethod === "COD" ? (
                    <><CheckCircle2 className="h-5 w-5" /> Place order — <span className="co-font-mono">{formatCurrency(total, currency)}</span></>
                  ) : (
                    <><Lock className="h-5 w-5" /> Pay <span className="co-font-mono">{formatCurrency(total, currency)}</span></>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-400">
                  <Shield className="h-3.5 w-3.5" /> 256-bit encrypted · PCI-DSS compliant
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--co-line)] pt-4">
                  {[
                    { icon: CheckCircle2, text: "Verified store" },
                    { icon: Truck, text: "Tracked delivery" },
                    { icon: MessageCircle, text: "WhatsApp updates" },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.text} className="flex flex-col items-center gap-1 text-center">
                        <Icon className="h-4 w-4 text-[var(--co-indigo)]" />
                        <span className="text-[10px] text-surface-500">{t.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="co-barcode h-5 bg-white" />
              <div className="co-scallop h-3 rotate-180 bg-white" />
            </div>
          </div>

          {/* Form */}
          <div className="order-2 space-y-6 lg:order-1 lg:col-span-3">
            {/* Contact Info */}
            <motion.div {...cardMotion(0)} className="rounded-2xl border border-[var(--co-line)] bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={contactComplete ? { background: "var(--co-green)", color: "#fff" } : { background: "var(--co-indigo-soft)", color: "var(--co-indigo)" }}
                >
                  {contactComplete ? <Check className="h-3.5 w-3.5" /> : "1"}
                </span>
                <div>
                  <h3 className="co-font-display text-base font-bold text-[var(--co-ink)]">Contact details</h3>
                  <p className="text-xs text-surface-400">We&apos;ll send your receipt and delivery updates here.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">First name *</label>
                    <input type="text" className={fieldClass(!!touched.firstName && !firstNameValid)} placeholder="Chioma" value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={() => markTouched("firstName")} required />
                    <FieldError show={!!touched.firstName && !firstNameValid} message="Enter your first name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Last name *</label>
                    <input type="text" className={fieldClass(!!touched.lastName && !lastNameValid)} placeholder="Eze" value={lastName} onChange={(e) => setLastName(e.target.value)} onBlur={() => markTouched("lastName")} required />
                    <FieldError show={!!touched.lastName && !lastNameValid} message="Enter your last name" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Email *</label>
                  <input type="email" className={fieldClass(!!touched.email && !emailValid)} placeholder="chioma@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => markTouched("email")} required />
                  <FieldError show={!!touched.email && !emailValid} message="Enter a valid email address" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Phone (WhatsApp) *</label>
                  <input type="tel" className={fieldClass(!!touched.phone && !phoneValid)} placeholder="+234 812 345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => markTouched("phone")} required />
                  <FieldError show={!!touched.phone && !phoneValid} message="Enter a valid phone number" />
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div {...cardMotion(1)} className="rounded-2xl border border-[var(--co-line)] bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={deliveryComplete ? { background: "var(--co-green)", color: "#fff" } : { background: "var(--co-indigo-soft)", color: "var(--co-indigo)" }}
                >
                  {deliveryComplete ? <Check className="h-3.5 w-3.5" /> : "2"}
                </span>
                <div>
                  <h3 className="co-font-display flex items-center gap-1.5 text-base font-bold text-[var(--co-ink)]">
                    <MapPin className="h-4 w-4 text-[var(--co-indigo)]" /> Delivery address
                  </h3>
                  <p className="text-xs text-surface-400">Where should we send your order?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Address *</label>
                  <input type="text" className={fieldClass(!!touched.address && !addressValid)} placeholder="12 Admiralty Way" value={address} onChange={(e) => setAddress(e.target.value)} onBlur={() => markTouched("address")} required />
                  <FieldError show={!!touched.address && !addressValid} message="Enter your delivery address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">City *</label>
                    <input type="text" className={fieldClass(!!touched.city && !cityValid)} placeholder="Lekki Phase 1" value={city} onChange={(e) => setCity(e.target.value)} onBlur={() => markTouched("city")} required />
                    <FieldError show={!!touched.city && !cityValid} message="Enter your city" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">State *</label>
                    <select className={fieldClass(!!touched.state && !stateValid)} value={state} onChange={(e) => setState(e.target.value)} onBlur={() => markTouched("state")} required>
                      <option value="" disabled>Select state</option>
                      {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <FieldError show={!!touched.state && !stateValid} message="Select your state" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Delivery instructions (optional)</label>
                  <textarea className={fieldClass(false)} placeholder="Gate code, landmark, etc." rows={2} value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} />
                </div>
              </div>
            </motion.div>

            {/* Delivery Zone */}
            {deliveryZones.length > 0 && (
              <motion.div {...cardMotion(2)} className="rounded-2xl border border-[var(--co-line)] bg-white p-6">
                <h3 className="co-font-display mb-4 flex items-center gap-2 text-base font-bold text-[var(--co-ink)]">
                  <Truck className="h-5 w-5 text-[var(--co-indigo)]" /> Delivery option
                </h3>
                <div className="space-y-2">
                  {deliveryZones.map((dz) => {
                    const dzFreeAbove = dz.freeAbove ? Number(dz.freeAbove) : null;
                    const dzFee = dzFreeAbove && subtotal >= dzFreeAbove ? 0 : Number(dz.fee);
                    const active = selectedZone === dz.id;
                    return (
                      <label key={dz.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${active ? "border-[var(--co-indigo)] bg-[var(--co-indigo-soft)]" : "border-[var(--co-line)] hover:border-surface-300"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="delivery" checked={active} onChange={() => setSelectedZone(dz.id)} className="h-4 w-4 accent-[var(--co-indigo)]" />
                          <div>
                            <span className="text-sm font-semibold text-[var(--co-ink)]">{dz.name}</span>
                            {dz.estimatedDays && <p className="text-xs text-surface-500">{dz.estimatedDays}</p>}
                            {dz.areas.length > 0 && <p className="text-[10px] text-surface-400">{dz.areas.slice(0, 3).join(", ")}{dz.areas.length > 3 ? "…" : ""}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="co-font-mono text-sm font-bold text-[var(--co-ink)]">
                            {dzFee === 0 ? <span className="text-[var(--co-green)]">Free</span> : formatCurrency(dzFee, currency)}
                          </span>
                          {dzFreeAbove && dzFee > 0 && (
                            <p className="text-[10px] text-surface-400">Free above {formatCurrency(dzFreeAbove, currency)}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Payment Method */}
            <motion.div {...cardMotion(3)} className="rounded-2xl border border-[var(--co-line)] bg-white p-6">
              <h3 className="co-font-display mb-4 flex items-center gap-2 text-base font-bold text-[var(--co-ink)]">
                <CreditCard className="h-5 w-5 text-[var(--co-indigo)]" /> Payment method
              </h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;
                  return (
                    <label key={method.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${active ? "border-[var(--co-indigo)] bg-[var(--co-indigo-soft)]" : "border-[var(--co-line)] hover:border-surface-300"}`}>
                      <input type="radio" name="payment" checked={active} onChange={() => setPaymentMethod(method.id)} className="mt-1 h-4 w-4 accent-[var(--co-indigo)]" />
                      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-surface-500" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-[var(--co-ink)]">{method.name}</span>
                        <p className="text-xs text-surface-500">{method.desc}</p>
                        {method.badges.length > 0 && (
                          <div className="mt-1.5 flex gap-1">
                            {method.badges.map((b) => (
                              <span key={b} className="co-font-mono rounded bg-[var(--co-indigo-soft)] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[var(--co-indigo)]">{b}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile sticky pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--co-line)] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex-1">
            <p className="text-[11px] text-surface-400">Total · {cart.reduce((s, i) => s + i.quantity, 0)} items</p>
            <p className="co-font-mono text-lg font-bold text-[var(--co-ink)]">{formatCurrency(total, currency)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--co-indigo)] py-3.5 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : paymentMethod === "COD" ? (
              <><CheckCircle2 className="h-4 w-4" /> Place order</>
            ) : (
              <><Lock className="h-4 w-4" /> Pay now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
