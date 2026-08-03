import { describe, expect, it, vi, afterEach } from "vitest";
import crypto from "crypto";
import {
  verifyPaystackWebhook,
  verifyFlutterwaveWebhook,
  verifyMonnifyWebhook,
  verifyFlutterwaveTransactionByReference,
} from "@/lib/payments";

describe("verifyPaystackWebhook", () => {
  it("accepts a signature that matches the HMAC-SHA512 of the body", () => {
    const secret = "sk_test_123";
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } });
    const signature = crypto.createHmac("sha512", secret).update(body).digest("hex");

    expect(verifyPaystackWebhook(body, signature, secret)).toBe(true);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const body = JSON.stringify({ event: "charge.success" });
    const signature = crypto.createHmac("sha512", "wrong_secret").update(body).digest("hex");

    expect(verifyPaystackWebhook(body, signature, "sk_test_123")).toBe(false);
  });

  it("rejects a tampered body even if the original signature is reused", () => {
    const secret = "sk_test_123";
    const originalBody = JSON.stringify({ event: "charge.success", data: { amount: 1000 } });
    const signature = crypto.createHmac("sha512", secret).update(originalBody).digest("hex");
    const tamperedBody = JSON.stringify({ event: "charge.success", data: { amount: 999999 } });

    expect(verifyPaystackWebhook(tamperedBody, signature, secret)).toBe(false);
  });
});

describe("verifyMonnifyWebhook", () => {
  it("accepts a signature that matches the HMAC-SHA512 of the body", () => {
    const secret = "mnfy_secret";
    const body = JSON.stringify({ eventType: "SUCCESSFUL_TRANSACTION" });
    const signature = crypto.createHmac("sha512", secret).update(body).digest("hex");

    expect(verifyMonnifyWebhook(body, signature, secret)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const body = JSON.stringify({ eventType: "SUCCESSFUL_TRANSACTION" });
    expect(verifyMonnifyWebhook(body, "not-a-real-signature", "mnfy_secret")).toBe(false);
  });
});

describe("verifyFlutterwaveWebhook", () => {
  it("accepts when the verif-hash header matches the configured secret", () => {
    expect(verifyFlutterwaveWebhook("my-webhook-secret", "my-webhook-secret")).toBe(true);
  });

  it("rejects when the verif-hash header does not match", () => {
    expect(verifyFlutterwaveWebhook("wrong-value", "my-webhook-secret")).toBe(false);
  });
});

describe("verifyFlutterwaveTransactionByReference", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("calls Flutterwave's verify_by_reference endpoint with our tx_ref, not the numeric-id endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ status: "success", data: { status: "successful", id: 987654 } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await verifyFlutterwaveTransactionByReference("afro_abc123_999", "sk_test_flw");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    // Must hit verify_by_reference?tx_ref=..., NOT /transactions/{id}/verify —
    // the latter requires Flutterwave's own numeric transaction id, which we
    // don't have at this point in the flow (we only have our own reference).
    expect(url).toContain("/transactions/verify_by_reference");
    expect(url).toContain("tx_ref=afro_abc123_999");
    expect(url).not.toMatch(/\/transactions\/afro_abc123_999\/verify/);
    expect(result.data.status).toBe("successful");
  });
});
