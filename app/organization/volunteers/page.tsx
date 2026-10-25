import { redirect } from "next/navigation";
import { OrganizationNav } from "@/app/organization/dashboard/page";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createVolunteerOpportunityAction } from "@/lib/actions";

export const dynamic = "force-dynamic";
type MembershipOption = { organizationId: string; organization: { name: string } };
export default async function OrganizationVolunteersPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let organizations: MembershipOption[] = [];
  try { organizations = await db().organizationMembership.findMany({ where: { userId: user.id }, include: { organization: true } }); } catch { /* unavailable */ }
  return <section className="content"><div className="shell"><h1>Volunteer opportunities</h1><div className="dashboard-grid"><OrganizationNav /><div className="form-card"><form action={createVolunteerOpportunityAction} className="form-grid"><div className="field form-wide"><label>Organization</label><select name="organizationId">{organizations.map((item) => <option value={item.organizationId} key={item.organizationId}>{item.organization.name}</option>)}</select></div><div className="field"><label>Title</label><input name="title" required /></div><div className="field"><label>Capacity</label><input name="capacity" type="number" min="1" defaultValue="1" required /></div><div className="field"><label>Skills (comma-separated)</label><input name="requiredSkills" placeholder="Teaching, translation" /></div><div className="field"><label>General location</label><input name="generalLocation" /></div><label className="checkbox"><input name="isRemote" type="checkbox" />Remote opportunity</label><div className="field form-wide"><label>Description</label><textarea name="description" required /></div><div className="field form-wide"><label>Safety instructions</label><textarea name="safetyInstructions" /></div><div className="form-wide"><button className="button" disabled={!organizations.length}>Submit for review</button></div></form></div></div></div></section>;
}
