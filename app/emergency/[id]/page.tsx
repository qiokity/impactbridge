import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";
export default async function EmergencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (id.startsWith("demo-")) return <section className="content-narrow"><div className="form-card"><Badge tone="demo">Fictional emergency report</Badge><h1>Monsoon supply assessment</h1><p>This development-only example is not a real incident and does not request money or emergency response.</p><Link className="button" href="/emergency">Return to emergency help</Link></div></section>;
  let request = null; try { request = await db().emergencyRequest.findFirst({ where: { id, status: { in: ["VERIFIED_FOR_PUBLICATION", "FUNDING_ACTIVE", "ASSISTANCE_IN_PROGRESS"] } } }); } catch { /* handled below */ }
  if (!request) notFound();
  return <section className="content-narrow"><Badge tone="warning">{request.status.replaceAll("_", " ")}</Badge><h1>{request.title}</h1><p className="detail-copy">{request.needDescription}</p><div className="card"><p>General location: {request.generalLocation ?? "Withheld for safety"}</p>{request.requestedAmount && <p>Requested support: {formatINR(request.requestedAmount)}</p>}<p className="notice">Supporting evidence is private. Publication means the recorded moderation process allowed a public summary; it does not guarantee assistance or emergency response.</p></div></section>;
}
