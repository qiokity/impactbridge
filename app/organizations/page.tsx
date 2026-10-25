import Link from "next/link";
import { Badge } from "@/components/badge";
import { db } from "@/lib/db";

type OrganizationRow = { id: string; name: string; slug: string; description: string | null; city: string | null; state: string | null; isDemo: boolean; _count: { campaigns: number } };

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  let organizations: OrganizationRow[] = [];
  try {
    organizations = await db().organization.findMany({ where: { status: "VERIFIED" }, select: { id: true, name: true, slug: true, description: true, city: true, state: true, isDemo: true, _count: { select: { campaigns: { where: { status: "ACTIVE", verificationStatus: "VERIFIED" } } } } }, orderBy: { createdAt: "desc" }, take: 48 });
  } catch { /* Empty state explains local database setup. */ }

  return <><section className="page-hero"><div className="shell"><p className="eyebrow">Participating organizations</p><h1>Find organizations and their reviewed public work</h1><p>A verification status records a platform workflow decision. It is not a guarantee of legal status, outcomes, or independent due diligence.</p></div></section><section className="content"><div className="shell">{organizations.length ? <div className="grid grid-3">{organizations.map((organization) => <article className="card" key={organization.id}><div className="card-footer"><Badge>Organization</Badge>{organization.isDemo && <Badge tone="demo">Demo</Badge>}</div><h2>{organization.name}</h2><p>{organization.description ?? "No public description yet."}</p><p className="helper-text">{[organization.city, organization.state].filter(Boolean).join(", ") || "Location not published"} · {organization._count.campaigns} public campaign records</p><Link className="text-link" href={`/organizations/${organization.slug}`}>View organization →</Link></article>)}</div> : <div className="empty"><h2>No public organizations yet</h2><p>Verified organizations will appear here after a database is configured and review is completed.</p></div>}</div></section></>;
}
