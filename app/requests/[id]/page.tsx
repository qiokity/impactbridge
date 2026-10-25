import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/badge";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canViewPrivateEvidence } from "@/lib/authorization";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";
export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); const id = (await params).id;
  let education = null; let emergency = null;
  try { [education, emergency] = await Promise.all([db().educationRequest.findUnique({ where: { id } }), db().emergencyRequest.findUnique({ where: { id } })]); } catch { /* handled below */ }
  const request = education ?? emergency; if (!request) notFound();
  const ownerId = education ? education.requesterId : emergency!.requesterId;
  if (!(await canViewPrivateEvidence(user, ownerId))) notFound();
  const kind = education ? "Education request" : "Emergency request";
  const body = education ? education.needDescription : emergency!.needDescription;
  const amount = education?.requestedAmount ?? emergency?.requestedAmount;
  const status = education?.status ?? emergency!.status;
  return <section className="content-narrow"><p className="eyebrow">Your private submission</p><Badge>{status.replaceAll("_", " ")}</Badge><h1>{request.title}</h1><p className="detail-copy">{body}</p><div className="card"><h2>{kind}</h2>{amount && <p>Requested support: {formatINR(amount)}</p>}<p>Private evidence is not displayed here until the secure upload provider is configured. Review decisions, when made, will be shown in your notifications and dashboard.</p></div></section>;
}
