import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { isValidLedgerAmount } from "@/lib/ledger";
import { verifyRazorpayPaymentSignature as verifyPaymentSignature, verifyRazorpayWebhook as verifyWebhook } from "@/lib/payments/signatures";

export function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_WEBHOOK_SECRET);
}

export async function createDonationAttempt(input: { campaignId: string; userId?: string; amount: number; isAnonymous: boolean; idempotencyKey: string }) {
  const campaign = await db().campaign.findFirst({ where: { id: input.campaignId, status: "ACTIVE", verificationStatus: "VERIFIED" }, select: { id: true, currency: true } });
  if (!campaign) throw new Error("This campaign is not currently eligible for donations.");

  const provider = isRazorpayConfigured() ? "razorpay" : "mock";
  const existing = await db().paymentAttempt.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  const attempt = existing ?? await db().paymentAttempt.create({
    data: { campaignId: campaign.id, userId: input.userId, amount: input.amount, currency: campaign.currency, provider, isSimulated: provider === "mock", isAnonymous: input.isAnonymous, idempotencyKey: input.idempotencyKey },
  });

  if (provider === "mock") return { attempt, checkoutUrl: `/donate/${campaign.id}?mock_attempt=${attempt.id}`, simulated: true };
  if (attempt.providerOrderId) return { attempt, checkoutUrl: `/donate/${campaign.id}?order=${attempt.providerOrderId}`, simulated: false };

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: input.amount, currency: campaign.currency, receipt: attempt.id, notes: { paymentAttemptId: attempt.id } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to create a payment order. No donation has been recorded.");
  const order = await response.json() as { id: string };
  const updated = await db().paymentAttempt.update({ where: { id: attempt.id }, data: { providerOrderId: order.id, status: "PENDING" } });
  return { attempt: updated, checkoutUrl: `/donate/${campaign.id}?order=${order.id}`, simulated: false };
}

export async function confirmMockPayment(attemptId: string, userId?: string) {
  return db().$transaction(async (tx) => {
    const attempt = await tx.paymentAttempt.findFirst({ where: { id: attemptId, provider: "mock", ...(userId ? { userId } : { userId: null }) } });
    if (!attempt) throw new Error("Payment attempt was not found.");
    if (attempt.status === "SUCCEEDED") return tx.donation.findUnique({ where: { paymentAttemptId: attempt.id } });
    const changed = await tx.paymentAttempt.updateMany({ where: { id: attempt.id, status: { in: ["CREATED", "PENDING"] } }, data: { status: "SUCCEEDED", providerPaymentId: `mock_${randomUUID()}` } });
    if (!changed.count) return tx.donation.findUnique({ where: { paymentAttemptId: attempt.id } });
    const donation = await tx.donation.create({
      data: {
        campaignId: attempt.campaignId, donorId: attempt.userId, paymentAttemptId: attempt.id, amount: attempt.amount, currency: attempt.currency,
        status: "CONFIRMED", isAnonymous: attempt.isAnonymous, isSimulated: true, confirmedAt: new Date(), receiptNumber: `SIM-${randomUUID()}`,
      },
    });
    if (!isValidLedgerAmount("DONATION_CONFIRMED", attempt.amount)) throw new Error("Invalid donation ledger amount.");
    await tx.financialLedgerEntry.create({ data: { campaignId: attempt.campaignId, donationId: donation.id, type: "DONATION_CONFIRMED", amount: attempt.amount, currency: attempt.currency, description: "Simulated development payment — excluded from genuine funds raised.", isSimulated: true } });
    if (attempt.userId) await tx.notification.create({ data: { userId: attempt.userId, type: "PAYMENT", title: "Simulated donation confirmed", body: "This local development payment is not a genuine transaction and is excluded from real fundraising totals.", link: "/dashboard/donations" } });
    return donation;
  });
}

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string) {
  return verifyPaymentSignature(orderId, paymentId, signature, env.RAZORPAY_KEY_SECRET);
}

export function verifyRazorpayWebhook(body: string, signature: string) {
  return verifyWebhook(body, signature, env.RAZORPAY_WEBHOOK_SECRET);
}

export async function recordVerifiedProviderPayment(input: { attemptId: string; providerEventId: string; providerPaymentId: string; payload: object }) {
  return db().$transaction(async (tx) => {
    const seen = await tx.paymentEvent.findUnique({ where: { providerEventId: input.providerEventId } });
    if (seen?.processedAt) return { duplicate: true };
    await tx.paymentEvent.upsert({ where: { providerEventId: input.providerEventId }, update: {}, create: { providerEventId: input.providerEventId, paymentAttemptId: input.attemptId, eventType: "payment.captured", payload: input.payload } });
    const attempt = await tx.paymentAttempt.findUnique({ where: { id: input.attemptId } });
    if (!attempt) throw new Error("Unknown payment attempt.");
    if (attempt.status === "SUCCEEDED") return { duplicate: true };
    await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "SUCCEEDED", providerPaymentId: input.providerPaymentId } });
    const donation = await tx.donation.create({ data: { campaignId: attempt.campaignId, donorId: attempt.userId, paymentAttemptId: attempt.id, amount: attempt.amount, currency: attempt.currency, status: "CONFIRMED", isAnonymous: attempt.isAnonymous, receiptNumber: `IB-${randomUUID()}`, confirmedAt: new Date() } });
    if (!isValidLedgerAmount("DONATION_CONFIRMED", attempt.amount)) throw new Error("Invalid donation ledger amount.");
    await tx.financialLedgerEntry.create({ data: { campaignId: attempt.campaignId, donationId: donation.id, type: "DONATION_CONFIRMED", amount: attempt.amount, currency: attempt.currency, description: "Confirmed provider payment" } });
    await tx.paymentEvent.update({ where: { providerEventId: input.providerEventId }, data: { processedAt: new Date() } });
    return { duplicate: false, donation };
  });
}

export async function approveExpense(expenseId: string, reviewerId: string, note: string) {
  return db().$transaction(async (tx) => {
    const expense = await tx.expense.findFirst({ where: { id: expenseId, status: "PENDING" } });
    if (!expense) throw new Error("Expense is no longer awaiting review.");
    const approved = await tx.expense.update({ where: { id: expenseId }, data: { status: "APPROVED", reviewedById: reviewerId, reviewerNote: note } });
    if (!isValidLedgerAmount("EXPENSE_APPROVED", -expense.amount)) throw new Error("Invalid expense ledger amount.");
    await tx.financialLedgerEntry.create({ data: { campaignId: expense.campaignId, expenseId: expense.id, type: "EXPENSE_APPROVED", amount: -expense.amount, currency: expense.currency, description: expense.description } });
    await tx.moderationAction.create({ data: { actorId: reviewerId, targetType: "Expense", targetId: expenseId, action: "APPROVED", reason: note } });
    return approved;
  });
}
