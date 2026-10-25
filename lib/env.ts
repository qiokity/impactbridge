import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  APP_URL: process.env.APP_URL,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
});

export function requireDatabaseUrl() {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required for this operation.");
  return env.DATABASE_URL;
}

export function requireAuthSecret() {
  if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET must be set to use authentication.");
  return new TextEncoder().encode(env.AUTH_SECRET);
}
