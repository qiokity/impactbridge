import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationNav } from "@/app/organization/dashboard/page";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/badge";

export const dynamic = "force-dynamic";
type VerificationMembershipRow = { id: string; organization: { name: string; status: string; verifications: Array<{ status: string }> } };
export default async function OrganizationVerificationPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let memberships: VerificationMembershipRow[] = [];
  try { memberships = await db().organizationMembership.findMany({ where: { userId: user.id }, include: { organization: { include: { verifications: { orderBy: { createdAt: "desc" }, take: 1 } } } } }); } catch { /* unavailable */ }
  return <section className="content"><div className="shell"><h1>Organization verification</h1><div className="dashboard-grid"><OrganizationNav /><div className="grid">{memberships.map((membership) => <div className="card" key={membership.id}><div className="card-footer"><h2>{membership.organization.name}</h2><Badge>{membership.organization.status}</Badge></div><p>Verification documents must be uploaded through private storage and reviewed by an authorized administrator. A private object-storage integration is required before submission is enabled.</p><p className="helper-text">Latest review: {membership.organization.verifications[0]?.status ?? "Not submitted"}</p></div>)}{!memberships.length && <p className="notice">No organization memberships available.</p>}<Link className="text-link" href="/about">Read the verification policy →</Link></div></div></div></section>;
}
