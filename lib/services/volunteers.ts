import "server-only";
import { db } from "@/lib/db";

export async function createVolunteerApplication(input: { opportunityId: string; userId: string; message?: string }) {
  return db().$transaction(async (tx) => {
    const opportunity = await tx.volunteerOpportunity.findFirst({ where: { id: input.opportunityId, status: "APPROVED" } });
    if (!opportunity) throw new Error("This opportunity is unavailable.");

    const existing = await tx.volunteerApplication.findUnique({ where: { opportunityId_userId: { opportunityId: input.opportunityId, userId: input.userId } } });
    if (existing) throw new Error("You have already applied to this opportunity.");

    const acceptedCount = await tx.volunteerApplication.count({ where: { opportunityId: input.opportunityId, status: "ACCEPTED" } });
    return tx.volunteerApplication.create({
      data: {
        opportunityId: input.opportunityId,
        userId: input.userId,
        message: input.message,
        status: acceptedCount >= opportunity.capacity ? "WAITLISTED" : "PENDING",
      },
    });
  }, { isolationLevel: "Serializable" });
}
