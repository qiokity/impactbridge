import { redirect } from "next/navigation";
import { OrganizationNav } from "@/app/organization/dashboard/page";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCampaignAction } from "@/lib/actions";

export const dynamic = "force-dynamic";
type MembershipOption = { organizationId: string; organization: { name: string } };
export default async function NewCampaignPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let organizations: MembershipOption[] = [];
  try { organizations = await db().organizationMembership.findMany({ where: { userId: user.id }, include: { organization: true } }); } catch { /* setup absent */ }
  return <section className="content"><div className="shell"><h1>Create a campaign</h1><div className="dashboard-grid"><OrganizationNav /><div className="form-card"><p className="notice">Campaigns require moderation and verification before public fundraising. Do not use this form to claim legal or tax eligibility.</p><form action={createCampaignAction} className="form-grid"><div className="field form-wide"><label>Organization</label><select name="organizationId" required>{organizations.map((item) => <option key={item.organizationId} value={item.organizationId}>{item.organization.name}</option>)}</select></div><div className="field"><label>Campaign title</label><input name="title" maxLength={140} required /></div><div className="field"><label>Category</label><input name="category" required /></div><div className="field"><label>Funding target (₹)</label><input name="targetAmountRupees" type="number" min="1" required /></div><div className="field form-wide"><label>Description</label><textarea name="description" required /></div><div className="field form-wide"><label>Intended use of funds</label><textarea name="intendedUse" /></div><div className="form-wide"><button className="button" disabled={!organizations.length}>Submit for review</button></div></form></div></div></div></section>;
}
