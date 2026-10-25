import { describe, expect, it } from "vitest";
import { createRazorpayPaymentSignature, createRazorpayWebhookSignature, verifyRazorpayPaymentSignature, verifyRazorpayWebhook } from "../lib/payments/signatures";

describe("Razorpay signature helpers", () => {
  it("accepts only the expected order/payment signature", () => {
    const signature = createRazorpayPaymentSignature("order_demo", "pay_demo", "test-secret");
    expect(verifyRazorpayPaymentSignature("order_demo", "pay_demo", signature, "test-secret")).toBe(true);
    expect(verifyRazorpayPaymentSignature("order_demo", "pay_other", signature, "test-secret")).toBe(false);
    expect(verifyRazorpayPaymentSignature("order_demo", "pay_demo", signature, undefined)).toBe(false);
  });

  it("rejects altered webhook payloads", () => {
    const body = '{"event":"payment.captured"}';
    const signature = createRazorpayWebhookSignature(body, "webhook-secret");
    expect(verifyRazorpayWebhook(body, signature, "webhook-secret")).toBe(true);
    expect(verifyRazorpayWebhook(`${body} `, signature, "webhook-secret")).toBe(false);
  });
});
