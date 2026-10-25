import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { Badge } from "@/components/badge";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in");
  let counts: { donations: number; requests: number; applications: number; notifications: number } | null = null;
  try { const client = db(); const [donations, requests, applications, notifications] = await Promise.all([client.donation.count({ where: { donorId: user.id } }), client.educationRequest.count({ where: { requesterId: user.id } }), client.volunteerApplication.count({ where: { userId: user.id } }), client.notification.count({ where: { userId: user.id, readAt: null } })]); counts = { donations, requests, applications, notifications }; } catch { /* setup message */ }
  return <section className="content"><div className="shell"><p className="eyebrow">Your dashboard</p><h1>Welcome, {user.name ?? "supporter"}</h1><div className="dashboard-grid"><DashboardNav /><div>{!counts ? <div className="notice">Database setup is incomplete, so personal records cannot be loaded yet. Follow the README migration steps.</div> : <><div className="kpi-grid"><div className="kpi"><strong>{counts.donations}</strong><span>donations</span></div><div className="kpi"><strong>{counts.requests}</strong><span>education requests</span></div><div className="kpi"><strong>{counts.applications}</strong><span>volunteer applications</span></div></div><div className="section"><div className="card"><div className="card-footer"><h2>Account role</h2><Badge>{user.role.replaceAll("_", " ")}</Badge></div><p>Role-based screens are authorized on the server. Your browser never decides what data or actions are permitted.</p>{counts.notifications > 0 && <Link className="text-link" href="/dashboard/notifications">{counts.notifications} unread notifications →</Link>}</div></div></>}</div></div></div></section>;
}
