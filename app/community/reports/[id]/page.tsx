import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function CommunityReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (id.startsWith("demo-")) return <section className="content-narrow"><div className="form-card"><Badge tone="demo">Fictional report</Badge><h1>Streetlight repair request</h1><p>This demonstration report was not sent to a government body and does not represent a public safety response.</p><Link className="button" href="/community">Return to community</Link></div></section>;
  let report = null; try { report = await db().communityReport.findFirst({ where: { id, status: { in: ["ACCEPTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"] } }, include: { history: { orderBy: { createdAt: "desc" } } } }); } catch { /* not found */ }
  if (!report) notFound();
  return <section className="content-narrow"><Badge>{report.status.replaceAll("_", " ")}</Badge><h1>{report.title}</h1><p>{report.description}</p><div className="card"><h2>Progress history</h2>{report.history.map((entry) => <div className="ledger-row" key={entry.id}><span>{entry.status.replaceAll("_", " ")}</span><span>{entry.createdAt.toLocaleDateString("en-IN")}</span><span>{entry.note}</span></div>)}</div></section>;
}
