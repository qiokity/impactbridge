import { createHmac, timingSafeEqual } from "node:crypto";

function safelyMatches(expected: string, supplied: string) {
  return expected.length === supplied.length && timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export function createRazorpayPaymentSignature(orderId: string, paymentId: string, secret: string) {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string, secret?: string) {
  if (!secret) return false;
  return safelyMatches(createRazorpayPaymentSignature(orderId, paymentId, secret), signature);
}

export function createRazorpayWebhookSignature(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyRazorpayWebhook(body: string, signature: string, secret?: string) {
  if (!secret) return false;
  const expected = createRazorpayWebhookSignature(body, secret);
  return safelyMatches(expected, signature);
}
