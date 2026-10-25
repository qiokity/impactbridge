import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuthSecret } from "@/lib/env";

const COOKIE_NAME = "impactbridge_session";
const SESSION_DAYS = 14;

type SessionPayload = { sid: string; sub: string; role: string };

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

async function issueToken(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(requireAuthSecret());
}

export async function createSession(user: { id: string; role: string }) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const rawToken = randomBytes(32).toString("base64url");
  const session = await db().session.create({
    data: { userId: user.id, tokenHash: digest(rawToken), expiresAt },
  });
  const token = await issueToken({ sid: session.id, sub: user.id, role: user.role }, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${token}.${rawToken}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;
  const divider = value.lastIndexOf(".");
  if (divider < 1) return null;
  try {
    const token = value.slice(0, divider);
    const rawToken = value.slice(divider + 1);
    const { payload } = await jwtVerify(token, requireAuthSecret());
    const sessionId = typeof payload.sid === "string" ? payload.sid : "";
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    if (!sessionId || !userId) return null;
    const session = await db().session.findFirst({
      where: { id: sessionId, userId, tokenHash: digest(rawToken), expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!session || session.user.isSuspended) return null;
    return session.user;
  } catch {
    return null;
  }
}

export async function requireUser(roles?: string[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Authentication required.");
  if (roles && !roles.includes(user.role)) throw new Error("You are not authorized for this action.");
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (value) {
    const divider = value.lastIndexOf(".");
    if (divider > 0) {
      try {
        const { payload } = await jwtVerify(value.slice(0, divider), requireAuthSecret());
        if (typeof payload.sid === "string") await db().session.deleteMany({ where: { id: payload.sid } });
      } catch { /* Expired or invalid sessions are simply cleared. */ }
    }
  }
  cookieStore.delete(COOKIE_NAME);
}
