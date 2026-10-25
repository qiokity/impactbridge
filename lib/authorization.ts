import "server-only";
import { db } from "@/lib/db";
import { isOrganizationManagerMembership } from "@/lib/roles";

export { isOrganizationManagerMembership } from "@/lib/roles";

export async function canManageOrganization(userId: string, organizationId: string) {
  const membership = await db().organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
    select: { role: true },
  });
  return isOrganizationManagerMembership(membership?.role);
}

export async function canViewPrivateEvidence(user: { id: string; role: string }, ownerId: string) {
  return user.id === ownerId || ["MODERATOR", "ADMIN"].includes(user.role);
}
