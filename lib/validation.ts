import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254);
export const passwordSchema = z.string().min(12, "Use at least 12 characters.").max(128);
export const moneySchema = z.coerce.number().int().positive().max(10_000_000_00);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const safeText = (max: number) => z.string().trim().min(1).max(max);

export const campaignInput = z.object({
  title: safeText(140),
  description: safeText(8_000),
  category: safeText(80),
  targetAmount: moneySchema,
  intendedUse: z.string().trim().max(4_000).optional(),
});

export const organizationInput = z.object({
  name: safeText(160),
  description: safeText(8_000),
  website: z.string().trim().url().max(2_048).optional().or(z.literal("")),
  city: safeText(100),
  state: safeText(100),
});

export const goodsInput = z.object({
  title: safeText(140),
  description: safeText(4_000),
  category: safeText(80),
  condition: z.string().trim().max(80).optional(),
  quantity: z.coerce.number().int().positive().max(10_000),
  unit: safeText(32),
  pickupArea: safeText(120),
  expiresAt: z.string().datetime().optional(),
  storageNotes: z.string().trim().max(1_000).optional(),
});

export const communityReportInput = z.object({
  title: safeText(140),
  description: safeText(5_000),
  category: safeText(80),
  severity: z.coerce.number().int().min(1).max(5),
  approximateArea: safeText(160),
});

export const educationInput = z.object({
  title: safeText(140),
  needDescription: safeText(5_000),
  educationLevel: safeText(100),
  generalLocation: safeText(160),
  requestedAmount: z.coerce.number().int().positive().max(10_000_000_00).optional(),
  requestedItem: z.string().trim().max(300).optional(),
  guardianConsent: z.coerce.boolean(),
});

export const emergencyInput = z.object({
  title: safeText(140),
  needDescription: safeText(5_000),
  category: safeText(80),
  requestedAmount: z.coerce.number().int().positive().max(10_000_000_00).optional(),
  requestedGoods: z.string().trim().max(300).optional(),
  urgency: z.coerce.number().int().min(1).max(5),
  generalLocation: z.string().trim().max(160).optional(),
});
