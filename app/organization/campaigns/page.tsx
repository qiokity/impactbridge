import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationNav } from "@/app/organization/dashboard/page";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/badge";

export const dynamic = "force-dynamic";
type CampaignRow = { id: string; title: string; category: string; status: string; slug: string };
export default async function OrganizationCampaignsPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let campaigns: CampaignRow[] = [];
  try { campaigns = await db().campaign.findMany({ where: { organization: { memberships: { some: { userId: user.id } } } }, orderBy: { createdAt: "desc" } }); } catch { /* setup absent */ }
  return <section className="content"><div className="shell"><div className="card-footer"><h1>Campaigns</h1><Link className="button button-small" href="/organization/campaigns/new">New campaign</Link></div><div className="dashboard-grid"><OrganizationNav /><div className="card">{campaigns.map((campaign) => <div className="ledger-row" key={campaign.id}><span><strong>{campaign.title}</strong><br /><Badge>{campaign.category}</Badge></span><span>{campaign.status.replaceAll("_", " ")}</span><Link className="text-link" href={`/campaigns/${campaign.slug}`}>Preview →</Link></div>)}{!campaigns.length && <p>No campaigns created.</p>}</div></div></div></section>;
}
