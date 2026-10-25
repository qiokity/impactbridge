import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
type NotificationRow = { id: string; title: string; body: string; createdAt: Date; readAt: Date | null };
export default async function NotificationsPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let notifications: NotificationRow[] = [];
  try { notifications = await db().notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }); } catch { /* database unavailable */ }
  return <section className="content"><div className="shell"><h1>Notifications</h1><div className="dashboard-grid"><DashboardNav /><div className="card">{notifications.map((item) => <div className="ledger-row" key={item.id}><span><strong>{item.title}</strong><br />{item.body}</span><span>{formatDate(item.createdAt)}</span><span>{item.readAt ? "Read" : "Unread"}</span></div>)}{!notifications.length && <p>You have no notifications.</p>}</div></div></div></section>;
}
