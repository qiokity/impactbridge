import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
type VolunteerApplicationRow = { id: string; status: string; opportunity: { title: string; generalLocation: string | null; startsAt: Date | null }; assignment: { confirmedMinutes: number } | null };
export default async function VolunteeringDashboardPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let applications: VolunteerApplicationRow[] = [];
  try { applications = await db().volunteerApplication.findMany({ where: { userId: user.id }, include: { opportunity: { select: { title: true, generalLocation: true, startsAt: true } }, assignment: true }, orderBy: { createdAt: "desc" } }); } catch { /* database not configured */ }
  return <section className="content"><div className="shell"><h1>Volunteer activity</h1><div className="dashboard-grid"><DashboardNav /><div className="card"><h2>Applications and assignments</h2>{applications.map((application) => <div className="ledger-row" key={application.id}><span><strong>{application.opportunity.title}</strong><br />{application.opportunity.generalLocation}</span><span>{application.status}</span><span>{application.assignment ? `${application.assignment.confirmedMinutes / 60} confirmed hours` : formatDate(application.opportunity.startsAt)}</span></div>)}{!applications.length && <p>No volunteer applications yet.</p>}</div></div></div></section>;
}
