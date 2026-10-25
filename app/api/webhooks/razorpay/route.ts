import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordVerifiedProviderPayment, verifyRazorpayWebhook } from "@/lib/services/financial";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyRazorpayWebhook(rawBody, signature)) return new NextResponse("Invalid webhook signature", { status: 401 });
  try {
    const payload = JSON.parse(rawBody) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; notes?: { paymentAttemptId?: string } } } } };
    const eventId = request.headers.get("x-razorpay-event-id") ?? `${payload.event}:${payload.payload?.payment?.entity?.id}`;
    if (payload.event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      const attemptId = payment?.notes?.paymentAttemptId;
      if (!attemptId || !payment?.id) return new NextResponse("Missing payment reference", { status: 400 });
      await recordVerifiedProviderPayment({ attemptId, providerEventId: eventId, providerPaymentId: payment.id, payload });
    } else {
      await db().paymentEvent.upsert({ where: { providerEventId: eventId }, update: {}, create: { providerEventId: eventId, eventType: payload.event ?? "unknown", payload, processedAt: new Date() } });
    }
    return NextResponse.json({ received: true });
  } catch {
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}
