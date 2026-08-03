/**
 * E2E Tests — Payments
 *
 * Covers what the storefront "checkout" test previously didn't:
 *  - Payment gateway settings (save/validate/never-leak-secrets)
 *  - Checkout initialization validation (src/app/api/sites/[siteId]/checkout/route.ts)
 *  - Webhook signature verification for real (src/app/api/webhooks/*)
 *  - The actual order transition PENDING -> PAID -> CONFIRMED once a webhook
 *    confirms payment
 *
 * Webhooks fire once a PaymentTransaction row already exists (normally
 * created by the checkout route right before it calls out to the real
 * gateway). We can't call the real Paystack/Flutterwave/Monnify APIs from
 * a test run, so we seed that row directly via prisma — this is the same
 * row the checkout route itself would have written, just without the
 * network hop to the provider. Everything downstream (signature check,
 * processPaymentConfirmation, order/timeline updates) runs for real.
 */

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";
import {
  describe, it, beforeAll,
  POST,
  createTestUser, createTestStore, createTestProduct, createTestOrder,
  expectSuccess, expectError,
  type TestUser, type TestStore, type TestProduct,
} from "./setup";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function rawPost(path: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
}

export function paymentTests() {
  describe("Payment Gateways — Settings", () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it("saves publicKey/secretKey/webhookSecret but never returns secretKey or raw webhookSecret", async () => {
      const saveRes = await POST(`/api/sites/${store.id}/payment-gateways`, {
        provider: "PAYSTACK",
        publicKey: "pk_test_abc",
        secretKey: "sk_test_super_secret",
        webhookSecret: "whsec_super_secret",
      }, user.token);
      expectSuccess(saveRes, 201);
      const saved = saveRes.body.data as any;
      if ("secretKey" in saved) throw new Error("secretKey must never be returned by the API");
      if ("webhookSecret" in saved) throw new Error("raw webhookSecret must never be returned by the API");

      const { GET } = await import("./setup");
      const listRes = await GET(`/api/sites/${store.id}/payment-gateways`, user.token);
      expectSuccess(listRes);
      const gateways = listRes.body.data as any[];
      const paystack = gateways.find((g) => g.provider === "PAYSTACK");
      if (!paystack) throw new Error("Saved gateway not found in listing");
      if ("secretKey" in paystack) throw new Error("secretKey leaked in listing");
      if ("webhookSecret" in paystack) throw new Error("raw webhookSecret leaked in listing");
      if (paystack.hasWebhookSecret !== true) throw new Error("hasWebhookSecret should be true after saving one");
    });

    it("rejects Monnify setup without a contract code", async () => {
      const res = await POST(`/api/sites/${store.id}/payment-gateways`, {
        provider: "MONNIFY",
        publicKey: "MK_TEST_abc",
        secretKey: "monnify_secret",
        // config.contractCode intentionally omitted
      }, user.token);
      expectError(res, 422);
    });

    it("accepts Monnify setup once a contract code is supplied", async () => {
      const res = await POST(`/api/sites/${store.id}/payment-gateways`, {
        provider: "MONNIFY",
        publicKey: "MK_TEST_abc",
        secretKey: "monnify_secret",
        config: { contractCode: "1234567890" },
      }, user.token);
      expectSuccess(res, 201);
    });
  });

  describe("Checkout — Initialization validation", () => {
    let user: TestUser;
    let store: TestStore;
    let product: TestProduct;
    let orderId: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      product = await createTestProduct(user.token, store.id, {
        name: "Payment Flow Product",
        price: 20000,
        stock: 5,
        status: "ACTIVE",
      });
      const order = await createTestOrder(user.token, store.id, product.id, {
        paymentMethod: "PAYSTACK",
      });
      orderId = order.id;
    });

    it("rejects a checkout request missing orderId/provider", async () => {
      const res = await rawPost(`/api/sites/${store.id}/checkout`, {});
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    it("rejects checkout for an order that does not exist", async () => {
      const res = await rawPost(`/api/sites/${store.id}/checkout`, {
        orderId: "not-a-real-order-id",
        provider: "PAYSTACK",
        callbackUrl: `${BASE_URL}/checkout`,
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    });

    it("rejects checkout with an unconfigured/disabled gateway", async () => {
      // FLUTTERWAVE was never set up for this store
      const res = await rawPost(`/api/sites/${store.id}/checkout`, {
        orderId,
        provider: "FLUTTERWAVE",
        callbackUrl: `${BASE_URL}/checkout`,
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });
  });

  describe("Webhooks — signature verification and order transitions", () => {
    let user: TestUser;
    let store: TestStore;
    let product: TestProduct;
    const webhookSecret = `whsec_${Date.now()}`;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      product = await createTestProduct(user.token, store.id, {
        name: "Webhook Test Product",
        price: 15000,
        stock: 10,
        status: "ACTIVE",
      });

      const gwRes = await POST(`/api/sites/${store.id}/payment-gateways`, {
        provider: "PAYSTACK",
        publicKey: "pk_test_webhook",
        secretKey: "sk_test_webhook",
        webhookSecret,
      }, user.token);
      expectSuccess(gwRes, 201);
    });

    async function seedPendingTransaction() {
      const order = await createTestOrder(user.token, store.id, product.id, {
        paymentMethod: "PAYSTACK",
      });
      const gateway = await prisma.paymentGateway.findUnique({
        where: { siteId_provider: { siteId: store.id, provider: "PAYSTACK" } },
      });
      if (!gateway) throw new Error("Expected Paystack gateway to exist");

      const reference = `afro_${generateId()}_${Date.now()}`;
      await prisma.paymentTransaction.create({
        data: {
          gatewayId: gateway.id,
          orderId: order.id,
          reference,
          amount: order.total,
          currency: "NGN",
          status: "PENDING",
        },
      });
      return { order, reference };
    }

    it("rejects a webhook with an invalid signature and leaves the order untouched", async () => {
      const { order, reference } = await seedPendingTransaction();
      const payload = JSON.stringify({ event: "charge.success", data: { reference } });

      const res = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paystack-signature": "not-a-valid-signature" },
        body: payload,
      });
      if (res.status !== 401) throw new Error(`Expected 401 for bad signature, got ${res.status}`);

      const orderAfter = await prisma.order.findUnique({ where: { id: order.id } });
      if (orderAfter?.paymentStatus !== "PENDING") {
        throw new Error("Order paymentStatus should remain PENDING after a rejected webhook");
      }
    });

    it("confirms payment and transitions the order PENDING -> PAID/CONFIRMED on a valid webhook", async () => {
      const { order, reference } = await seedPendingTransaction();
      const payload = JSON.stringify({
        event: "charge.success",
        data: { reference, id: 55555, channel: "card", metadata: {} },
      });
      const signature = crypto.createHmac("sha512", webhookSecret).update(payload).digest("hex");

      const res = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paystack-signature": signature },
        body: payload,
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);

      const orderAfter = await prisma.order.findUnique({ where: { id: order.id } });
      if (orderAfter?.paymentStatus !== "PAID") throw new Error(`Expected paymentStatus PAID, got ${orderAfter?.paymentStatus}`);
      if (orderAfter?.status !== "CONFIRMED") throw new Error(`Expected status CONFIRMED, got ${orderAfter?.status}`);
      if (!orderAfter?.paidAt) throw new Error("Expected paidAt to be set");

      const transaction = await prisma.paymentTransaction.findUnique({ where: { reference } });
      if (transaction?.status !== "SUCCESS") throw new Error(`Expected transaction SUCCESS, got ${transaction?.status}`);

      const timeline = await prisma.orderTimeline.findMany({ where: { orderId: order.id }, orderBy: { createdAt: "asc" } });
      const confirmedEntry = timeline.find((t: { status: string }) => t.status === "CONFIRMED");
      if (!confirmedEntry) throw new Error("Expected a CONFIRMED timeline entry after payment confirmation");
    });

    it("is idempotent — replaying the same webhook does not double-process the transaction", async () => {
      const { order, reference } = await seedPendingTransaction();
      const payload = JSON.stringify({
        event: "charge.success",
        data: { reference, id: 66666, channel: "card", metadata: {} },
      });
      const signature = crypto.createHmac("sha512", webhookSecret).update(payload).digest("hex");

      const first = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paystack-signature": signature },
        body: payload,
      });
      const second = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paystack-signature": signature },
        body: payload,
      });
      if (first.status !== 200 || second.status !== 200) {
        throw new Error("Both webhook deliveries should return 200 (provider expects an ack even on replays)");
      }

      const timeline = await prisma.orderTimeline.findMany({ where: { orderId: order.id }, orderBy: { createdAt: "asc" } });
      const confirmedEntries = timeline.filter((t: { status: string }) => t.status === "CONFIRMED");
      if (confirmedEntries.length !== 1) {
        throw new Error(`Expected exactly 1 CONFIRMED timeline entry after a replayed webhook, got ${confirmedEntries.length}`);
      }
    });
  });
}
