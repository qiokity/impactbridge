import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let organization = null;
  try {
    organization = await db().organization.findFirst({ where: { slug, status: "VERIFIED" }, include: { campaigns: { where: { status: "ACTIVE", verificationStatus: "VERIFIED" }, select: { id: true, slug: true, title: true, description: true, category: true, isDemo: true }, take: 24, orderBy: { createdAt: "desc" } } } });
  } catch { /* The local setup is represented as not found. */ }
  if (!organization) notFound();

  return <><section className="page-hero"><div className="shell"><div className="card-footer"><Badge>Organization</Badge>{organization.isDemo && <Badge tone="demo">Fictional demonstration</Badge>}</div><h1>{organization.name}</h1><p>{organization.description ?? "No public description has been provided."}</p><p className="helper-text">{[organization.city, organization.state].filter(Boolean).join(", ") || "Location not published"}</p></div></section><section className="content"><div className="shell"><h2>Public campaigns</h2>{organization.campaigns.length ? <div className="grid grid-3">{organization.campaigns.map((campaign) => <article className="card" key={campaign.id}><div className="card-footer"><Badge>{campaign.category}</Badge>{campaign.isDemo && <Badge tone="demo">Demo</Badge>}</div><h3>{campaign.title}</h3><p>{campaign.description}</p><Link className="text-link" href={`/campaigns/${campaign.slug}`}>View campaign →</Link></article>)}</div> : <div className="empty"><p>No public campaigns are currently active for this organization.</p></div>}</div></section></>;
}
