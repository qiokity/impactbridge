import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/badge";

export const dynamic = "force-dynamic";
type RequestRow = { id: string; title: string; status: string; kind: "Education" | "Emergency" };
export default async function RequestsDashboardPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let education: Array<{ id: string; title: string; status: string }> = []; let emergency: Array<{ id: string; title: string; status: string }> = [];
  try { [education, emergency] = await Promise.all([db().educationRequest.findMany({ where: { requesterId: user.id }, orderBy: { createdAt: "desc" } }), db().emergencyRequest.findMany({ where: { requesterId: user.id }, orderBy: { createdAt: "desc" } })]); } catch { /* database unavailable */ }
  const rows: RequestRow[] = [...education.map((request) => ({ ...request, kind: "Education" as const })), ...emergency.map((request) => ({ ...request, kind: "Emergency" as const }))];
  return <section className="content"><div className="shell"><div className="card-footer"><h1>Your requests</h1><Link className="button button-small" href="/requests/new">New request</Link></div><div className="dashboard-grid"><DashboardNav /><div className="card">{rows.map((request) => <div className="ledger-row" key={`${request.kind}-${request.id}`}><span><strong>{request.title}</strong><br /><Badge>{request.kind}</Badge></span><span>{request.status.replaceAll("_", " ")}</span><Link className="text-link" href={`/requests/${request.id}`}>Open →</Link></div>)}{!rows.length && <p>No requests submitted yet.</p>}</div></div></div></section>;
}
