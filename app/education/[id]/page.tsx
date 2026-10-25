import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";
export default async function EducationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (id.startsWith("demo-")) return <section className="content-narrow"><div className="form-card"><Badge tone="demo">Fictional request</Badge><h1>Learning materials support</h1><p>This is only a development example. It contains no student identity, documentation, or real fundraiser.</p><Link className="button" href="/education">Return to education</Link></div></section>;
  let request = null; try { request = await db().educationRequest.findFirst({ where: { id, status: { in: ["APPROVED", "FUNDING_ACTIVE", "IN_PROGRESS"] } } }); } catch { /* handled below */ }
  if (!request) notFound();
  return <section className="content-narrow"><Badge>{request.status.replaceAll("_", " ")}</Badge><h1>{request.title}</h1><p className="detail-copy">{request.needDescription}</p><div className="card"><h2>Support details</h2><p>Education level: {request.educationLevel}</p><p>General location: {request.generalLocation}</p>{request.requestedAmount && <p>Requested support: {formatINR(request.requestedAmount)}</p>}<p className="notice">Identity and supporting documents are restricted to authorized reviewers. Publication does not claim independent verification beyond the recorded review process.</p></div></section>;
}
