import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { applyForVolunteerAction } from "@/lib/actions";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await getSessionUser();
  if (id.startsWith("demo-")) return <section className="content-narrow"><div className="form-card"><Badge tone="demo">Fictional opportunity</Badge><h1>Weekend reading mentor</h1><p>This is demonstration content only; no real event, organizer, or volunteer placement is implied.</p><Link className="button" href="/volunteer">Return to volunteering</Link></div></section>;
  let opportunity = null; try { opportunity = await db().volunteerOpportunity.findFirst({ where: { id, status: "APPROVED" }, include: { organization: { select: { name: true } }, applications: { where: { status: "ACCEPTED" }, select: { id: true } } } }); } catch { /* handled below */ }
  if (!opportunity) notFound();
  return <section className="content"><div className="shell detail-grid"><article className="card"><Badge>{opportunity.isRemote ? "Remote" : opportunity.generalLocation ?? "In person"}</Badge><h1>{opportunity.title}</h1><p className="detail-copy">{opportunity.description}</p><h3>Skills requested</h3><p>{opportunity.requiredSkills.join(", ") || "General support"}</p><h3>Safety instructions</h3><p>{opportunity.safetyInstructions ?? "The organizer will provide safety information before confirmation."}</p></article><aside className="form-card sticky-card"><h2>{opportunity.capacity - opportunity.applications.length} spaces currently open</h2><p className="helper-text">Organizer: {opportunity.organization.name}</p>{user ? <form action={applyForVolunteerAction}><input type="hidden" name="opportunityId" value={opportunity.id} /><div className="field"><label htmlFor="message">Why are you interested?</label><textarea id="message" name="message" maxLength={2000} required /></div><button className="button">Apply to volunteer</button></form> : <Link className="button" href={`/sign-in?next=/volunteer/opportunities/${id}`}>Sign in to apply</Link>}</aside></div></section>;
}
