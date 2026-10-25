import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in");
  return <section className="content"><div className="shell"><h1>Settings and privacy</h1><div className="dashboard-grid"><DashboardNav /><div className="card"><h2>Your privacy controls</h2><p>Email: {user.email}</p><p>Public donor-name preference, notification preferences, account deletion requests, and secure password reset are database-backed extension points. The email delivery adapter must be configured before verification or reset emails are enabled.</p><p className="notice">Do not upload identity or supporting documents until a private object-storage provider is configured. Local development storage is unsuitable for sensitive production evidence.</p></div></div></div></section>;
}
