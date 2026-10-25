import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { confirmMockPayment } from "@/lib/services/financial";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", request.url), 303);
  try {
    enforceRateLimit(`mock-payment:${user.id}`, 10, 60 * 60_000);
    const formData = await request.formData();
    await confirmMockPayment(String(formData.get("attemptId") ?? ""), user.id);
    return NextResponse.redirect(new URL("/dashboard/donations?simulated=confirmed", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/dashboard/donations?error=Unable+to+confirm+the+simulated+payment", request.url), 303);
  }
}
