"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, hashPassword, requireUser } from "@/lib/auth";
import { canManageOrganization } from "@/lib/authorization";
import { enforceRateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";
import { campaignInput, communityReportInput, educationInput, emailSchema, emergencyInput, goodsInput, organizationInput, passwordSchema, safeText } from "@/lib/validation";
import { acceptGoodsClaim } from "@/lib/services/goods";
import { approveExpense } from "@/lib/services/financial";
import { createDonationAttempt } from "@/lib/services/financial";
import { createVolunteerApplication } from "@/lib/services/volunteers";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export async function signUpAction(formData: FormData) {
  enforceRateLimit(`signup:${value(formData, "email").toLowerCase()}`, 5, 60 * 60_000);
  const email = emailSchema.parse(value(formData, "email").toLowerCase());
  const password = passwordSchema.parse(value(formData, "password"));
  const name = safeText(120).parse(value(formData, "name"));
  const exists = await db().user.findUnique({ where: { email } });
  if (exists) redirect("/sign-up?error=An+account+already+exists+for+that+email.");
  const user = await db().user.create({ data: { email, name, passwordHash: await hashPassword(password), profile: { create: { publicName: name } }, preferences: { create: {} } } });
  await createSession(user);
  redirect("/dashboard?welcome=1");
}

export async function createCampaignAction(formData: FormData) {
  const user = await requireUser();
  const organizationId = safeText(64).parse(value(formData, "organizationId"));
  if (user.role !== "ADMIN" && !(await canManageOrganization(user.id, organizationId))) throw new Error("You cannot create a campaign for this organization.");
  const input = campaignInput.parse({ ...Object.fromEntries(formData), targetAmount: Number(value(formData, "targetAmountRupees")) * 100 });
  const slugRoot = slugify(input.title);
  const slug = `${slugRoot}-${randomUUID().slice(0, 8)}`;
  const campaign = await db().campaign.create({ data: { ...input, targetAmount: input.targetAmount, slug, organizationId, createdById: user.id, status: "PENDING_REVIEW", verificationStatus: "PENDING" } });
  await writeAudit({ actorId: user.id, action: "CAMPAIGN_SUBMITTED", entityType: "Campaign", entityId: campaign.id, after: { status: campaign.status } });
  redirect("/organization/campaigns?submitted=1");
}

export async function createOrganizationApplicationAction(formData: FormData) {
  const user = await requireUser();
  enforceRateLimit(`organization-application:${user.id}`, 2, 24 * 60 * 60_000);
  const input = organizationInput.parse(Object.fromEntries(formData));
  const slug = `${slugify(input.name)}-${randomUUID().slice(0, 8)}`;
  const organization = await db().$transaction(async (tx) => {
    const created = await tx.organization.create({
      data: {
        ownerId: user.id,
        name: input.name,
        slug,
        description: input.description,
        website: input.website || undefined,
        city: input.city,
        state: input.state,
        status: "PENDING",
      },
    });
    await tx.organizationMembership.create({ data: { userId: user.id, organizationId: created.id, role: "ORGANIZATION_REP" } });
    return created;
  });
  await writeAudit({ actorId: user.id, action: "ORGANIZATION_APPLICATION_SUBMITTED", entityType: "Organization", entityId: organization.id, after: { status: organization.status } });
  redirect("/organization/dashboard?submitted=1");
}

export async function updateOrganizationProfileAction(formData: FormData) {
  const user = await requireUser();
  const organizationId = safeText(64).parse(value(formData, "organizationId"));
  if (user.role !== "ADMIN" && !(await canManageOrganization(user.id, organizationId))) throw new Error("You cannot update this organization.");
  const input = organizationInput.parse(Object.fromEntries(formData));
  const organization = await db().organization.update({
    where: { id: organizationId },
    data: { name: input.name, description: input.description, website: input.website || null, city: input.city, state: input.state },
  });
  await writeAudit({ actorId: user.id, action: "ORGANIZATION_PROFILE_UPDATED", entityType: "Organization", entityId: organization.id });
  revalidatePath("/organization/profile");
  revalidatePath(`/organizations/${organization.slug}`);
}

export async function startDonationAction(formData: FormData) {
  const user = await requireUser();
  enforceRateLimit(`donation:${user.id}`, 8, 60 * 60_000);
  const campaignId = safeText(64).parse(value(formData, "campaignId"));
  const rupees = Number(value(formData, "amountRupees"));
  const amount = Math.round(rupees * 100);
  if (!Number.isSafeInteger(amount) || amount < 100 || amount > 10_000_000_00) throw new Error("Enter an amount between ₹1 and ₹1,00,00,000.");
  const result = await createDonationAttempt({ campaignId, userId: user.id, amount, isAnonymous: value(formData, "isAnonymous") === "on", idempotencyKey: randomUUID() });
  redirect(result.checkoutUrl);
}

export async function createGoodsListingAction(formData: FormData) {
  const user = await requireUser();
  const input = goodsInput.parse({ ...Object.fromEntries(formData), expiresAt: value(formData, "expiresAt") || undefined });
  if (input.category.toLowerCase().includes("food") && input.expiresAt && new Date(input.expiresAt) <= new Date()) throw new Error("Expired food cannot be listed.");
  const listing = await db().goodsListing.create({ data: { ...input, ownerId: user.id, status: "PENDING_REVIEW", expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined } });
  await writeAudit({ actorId: user.id, action: "GOODS_LISTING_SUBMITTED", entityType: "GoodsListing", entityId: listing.id, after: { status: listing.status } });
  redirect("/dashboard/goods?submitted=1");
}

export async function createGoodsClaimAction(formData: FormData) {
  const user = await requireUser();
  const listingId = safeText(64).parse(value(formData, "listingId"));
  const quantity = Number(value(formData, "quantity"));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10_000) throw new Error("Enter a valid quantity.");
  const listing = await db().goodsListing.findFirst({ where: { id: listingId, status: "AVAILABLE" } });
  if (!listing || listing.ownerId === user.id) throw new Error("This listing cannot be claimed.");
  await db().goodsClaim.create({ data: { listingId, claimantId: user.id, quantity, note: value(formData, "note").slice(0, 1000) || undefined } });
  redirect("/dashboard/goods?claim=sent");
}

export async function acceptGoodsClaimAction(formData: FormData) {
  const user = await requireUser();
  await acceptGoodsClaim(safeText(64).parse(value(formData, "claimId")), user.id);
  revalidatePath("/dashboard/goods");
}

export async function createCommunityReportAction(formData: FormData) {
  const user = await requireUser();
  enforceRateLimit(`report:${user.id}`, 5, 60 * 60_000);
  const input = communityReportInput.parse(Object.fromEntries(formData));
  const report = await db().communityReport.create({ data: { ...input, authorId: user.id, status: "SUBMITTED" } });
  await db().reportStatusHistory.create({ data: { reportId: report.id, status: "SUBMITTED", note: "Submitted for community moderation." } });
  redirect(`/community/reports/${report.id}?submitted=1`);
}

export async function createEducationRequestAction(formData: FormData) {
  const user = await requireUser();
  const input = educationInput.parse({ ...Object.fromEntries(formData), requestedAmount: value(formData, "requestedAmountRupees") ? Number(value(formData, "requestedAmountRupees")) * 100 : undefined });
  if (!input.guardianConsent) throw new Error("Guardian consent is required before submitting a student request.");
  const request = await db().educationRequest.create({ data: { ...input, requesterId: user.id, status: "PENDING_REVIEW" } });
  await db().notification.create({ data: { userId: user.id, type: "REQUEST_REVIEW", title: "Education request submitted", body: "Your private evidence and request are awaiting review.", link: `/requests/${request.id}` } });
  redirect(`/requests/${request.id}?submitted=1`);
}

export async function createEmergencyRequestAction(formData: FormData) {
  const user = await requireUser();
  enforceRateLimit(`emergency:${user.id}`, 3, 60 * 60_000);
  const input = emergencyInput.parse({ ...Object.fromEntries(formData), requestedAmount: value(formData, "requestedAmountRupees") ? Number(value(formData, "requestedAmountRupees")) * 100 : undefined });
  const request = await db().emergencyRequest.create({ data: { ...input, requesterId: user.id, status: "REPORTED" } });
  await db().notification.create({ data: { userId: user.id, type: "REQUEST_REVIEW", title: "Emergency report received", body: "It is private and unverified until a moderator completes review. This platform does not provide emergency services.", link: `/requests/${request.id}` } });
  redirect(`/requests/${request.id}?submitted=1`);
}

export async function applyForVolunteerAction(formData: FormData) {
  const user = await requireUser();
  const opportunityId = safeText(64).parse(value(formData, "opportunityId"));
  await createVolunteerApplication({ opportunityId, userId: user.id, message: value(formData, "message").slice(0, 2_000) || undefined });
  redirect("/dashboard/volunteering?applied=1");
}

export async function submitExpenseAction(formData: FormData) {
  const user = await requireUser();
  const campaignId = safeText(64).parse(value(formData, "campaignId"));
  const campaign = await db().campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || (user.role !== "ADMIN" && !(await canManageOrganization(user.id, campaign.organizationId)))) throw new Error("You cannot submit an expense for this campaign.");
  const amount = Number(value(formData, "amountRupees")) * 100;
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Enter a valid amount.");
  await db().expense.create({ data: { campaignId, submittedById: user.id, category: safeText(80).parse(value(formData, "category")), description: safeText(4_000).parse(value(formData, "description")), vendor: value(formData, "vendor").slice(0, 200) || undefined, amount, transactionDate: new Date(value(formData, "transactionDate")), status: "PENDING" } });
  redirect("/organization/expenses?submitted=1");
}

export async function createVolunteerOpportunityAction(formData: FormData) {
  const user = await requireUser();
  const organizationId = safeText(64).parse(value(formData, "organizationId"));
  if (user.role !== "ADMIN" && !(await canManageOrganization(user.id, organizationId))) throw new Error("You cannot create opportunities for this organization.");
  const capacity = Number(value(formData, "capacity"));
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10_000) throw new Error("Enter a valid volunteer capacity.");
  const opportunity = await db().volunteerOpportunity.create({ data: { organizationId, title: safeText(140).parse(value(formData, "title")), description: safeText(8_000).parse(value(formData, "description")), requiredSkills: value(formData, "requiredSkills").split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 20), capacity, generalLocation: value(formData, "generalLocation").slice(0, 160) || undefined, isRemote: value(formData, "isRemote") === "on", safetyInstructions: value(formData, "safetyInstructions").slice(0, 4_000) || undefined, status: "PENDING" } });
  await writeAudit({ actorId: user.id, action: "VOLUNTEER_OPPORTUNITY_SUBMITTED", entityType: "VolunteerOpportunity", entityId: opportunity.id, after: { status: opportunity.status } });
  redirect("/organization/volunteers?submitted=1");
}

export async function approveExpenseAction(formData: FormData) {
  const user = await requireUser(["MODERATOR", "ADMIN"]);
  await approveExpense(safeText(64).parse(value(formData, "expenseId")), user.id, safeText(2_000).parse(value(formData, "reason")));
  revalidatePath("/admin/expenses");
}

export async function moderateAction(formData: FormData) {
  const user = await requireUser(["MODERATOR", "ADMIN"]);
  const targetType = value(formData, "targetType");
  const targetId = safeText(64).parse(value(formData, "targetId"));
  const decision = value(formData, "decision");
  const reason = safeText(2_000).parse(value(formData, "reason"));
  if (targetType === "Organization" && ["VERIFIED", "REJECTED"].includes(decision)) await db().organization.update({ where: { id: targetId }, data: { status: decision as "VERIFIED" | "REJECTED" } });
  else if (targetType === "Campaign" && ["ACTIVE", "REJECTED"].includes(decision)) await db().campaign.update({ where: { id: targetId }, data: { status: decision as "ACTIVE" | "REJECTED", verificationStatus: decision === "ACTIVE" ? "VERIFIED" : "REJECTED" } });
  else if (targetType === "EducationRequest" && ["APPROVED", "REJECTED", "NEEDS_CHANGES"].includes(decision)) await db().educationRequest.update({ where: { id: targetId }, data: { status: decision as "APPROVED" | "REJECTED" | "NEEDS_CHANGES" } });
  else if (targetType === "EmergencyRequest" && ["VERIFIED_FOR_PUBLICATION", "REJECTED"].includes(decision)) await db().emergencyRequest.update({ where: { id: targetId }, data: { status: decision as "VERIFIED_FOR_PUBLICATION" | "REJECTED", reviewerId: user.id } });
  else if (targetType === "GoodsListing" && ["AVAILABLE", "REJECTED"].includes(decision)) await db().goodsListing.update({ where: { id: targetId }, data: { status: decision as "AVAILABLE" | "REJECTED" } });
  else throw new Error("Invalid moderation decision.");
  await db().moderationAction.create({ data: { actorId: user.id, targetType, targetId, action: decision, reason } });
  await writeAudit({ actorId: user.id, action: `MODERATION_${decision}`, entityType: targetType, entityId: targetId, after: { decision, reason } });
  revalidatePath("/admin");
}
