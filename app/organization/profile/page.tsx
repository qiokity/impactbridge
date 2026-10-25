import { redirect } from "next/navigation";
import { OrganizationNav } from "@/app/organization/dashboard/page";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrganizationApplicationAction, updateOrganizationProfileAction } from "@/lib/actions";
import { Badge } from "@/components/badge";

type OrganizationProfile = { id: string; name: string; description: string | null; website: string | null; city: string | null; state: string | null; status: string };
type Membership = { id: string; organization: OrganizationProfile };

export const dynamic = "force-dynamic";

export default async function OrganizationProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/organization/profile");

  let memberships: Membership[] = [];
  try {
    memberships = await db().organizationMembership.findMany({ where: { userId: user.id }, include: { organization: true }, orderBy: { createdAt: "desc" } });
  } catch { /* A missing local database is explained by the form below. */ }

  return <section className="content"><div className="shell"><h1>Organization profile and application</h1><div className="dashboard-grid"><OrganizationNav /><div className="grid">{memberships.map(({ id, organization }) => <article className="form-card" key={id}><div className="card-footer"><h2>{organization.name}</h2><Badge>{organization.status}</Badge></div><p className="helper-text">Editing a profile does not change its review status. Verification documents are only accepted after private storage is configured.</p><form action={updateOrganizationProfileAction} className="form-grid"><input type="hidden" name="organizationId" value={organization.id} /><div className="field"><label htmlFor={`name-${organization.id}`}>Name</label><input id={`name-${organization.id}`} name="name" defaultValue={organization.name} required /></div><div className="field"><label htmlFor={`website-${organization.id}`}>Website (optional)</label><input id={`website-${organization.id}`} name="website" type="url" defaultValue={organization.website ?? ""} /></div><div className="field"><label htmlFor={`city-${organization.id}`}>City</label><input id={`city-${organization.id}`} name="city" defaultValue={organization.city ?? ""} required /></div><div className="field"><label htmlFor={`state-${organization.id}`}>State</label><input id={`state-${organization.id}`} name="state" defaultValue={organization.state ?? ""} required /></div><div className="field form-wide"><label htmlFor={`description-${organization.id}`}>Public description</label><textarea id={`description-${organization.id}`} name="description" defaultValue={organization.description ?? ""} required /></div><div className="form-wide"><button className="button">Save profile</button></div></form></article>)}<article className="form-card"><p className="eyebrow">Apply to represent an organization</p><h2>Start a reviewable organization application</h2><p>Submitting creates a scoped representative membership and a pending organization record. It does not grant administrator or verification privileges.</p><form action={createOrganizationApplicationAction} className="form-grid"><div className="field"><label htmlFor="name">Organization name</label><input id="name" name="name" required /></div><div className="field"><label htmlFor="website">Website (optional)</label><input id="website" name="website" type="url" /></div><div className="field"><label htmlFor="city">City</label><input id="city" name="city" required /></div><div className="field"><label htmlFor="state">State</label><input id="state" name="state" required /></div><div className="field form-wide"><label htmlFor="description">Public description</label><textarea id="description" name="description" required /></div><div className="form-wide"><button className="button">Submit organization application</button></div></form></article></div></div></div></section>;
}
