import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { emailSchema, passwordSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const next = String(formData.get("next") ?? "/dashboard");
  try {
    enforceRateLimit(`signin:${email}`, 8, 15 * 60_000);
    const validEmail = emailSchema.parse(email);
    const password = passwordSchema.parse(String(formData.get("password") ?? ""));
    const user = await db().user.findUnique({ where: { email: validEmail } });
    if (!user?.passwordHash || user.isSuspended || !(await verifyPassword(password, user.passwordHash))) throw new Error("Invalid credentials");
    await createSession(user);
    return NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent("Unable to sign in with those credentials.")}`, request.url), 303);
  }
}
