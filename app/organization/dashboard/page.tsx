import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/badge";

const orgLinks = [["Overview", "/organization/dashboard"], ["Campaigns", "/organization/campaigns"], ["Expenses", "/organization/expenses"], ["Goods", "/organization/goods"], ["Volunteers", "/organization/volunteers"], ["Verification", "/organization/verification"]];
export function OrganizationNav() { return <nav className="dashboard-nav">{orgLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>; }

export const dynamic = "force-dynamic";
type OrganizationMembershipRow = { id: string; organization: { name: string; status: string; description: string | null; campaigns: unknown[] } };
export default async function OrganizationDashboardPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in");
  let organizations: OrganizationMembershipRow[] = []; try { organizations = await db().organizationMembership.findMany({ where: { userId: user.id }, include: { organization: { include: { campaigns: true } } } }); } catch { /* setup pending */ }
  return <section className="content"><div className="shell"><p className="eyebrow">Organization workspace</p><h1>Manage accountable projects</h1><div className="dashboard-grid"><OrganizationNav /><div>{organizations.map((membership) => <article className="card" key={membership.id}><div className="card-footer"><h2>{membership.organization.name}</h2><Badge>{membership.organization.status}</Badge></div><p>{membership.organization.description ?? "Organization profile needs more information."}</p><p>{membership.organization.campaigns.length} campaign records</p></article>)}{!organizations.length && <div className="notice">No organization membership was found. You can apply to register an organization; approval is required before public verification or fundraising.</div>}<Link className="button" href="/organization/profile">Organization profile and application</Link></div></div></div></section>;
}
