import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { Badge } from "@/components/badge";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";
type DonationRow = { id: string; amount: number; status: string; isSimulated: boolean; confirmedAt: Date | null; createdAt: Date; campaign: { title: string } };
export default async function DonationsPage({ searchParams }: { searchParams: Promise<{ simulated?: string; error?: string }> }) {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); const query = await searchParams; let donations: DonationRow[] = [];
  try { donations = await db().donation.findMany({ where: { donorId: user.id }, include: { campaign: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 100 }); } catch { /* empty setup */ }
  return <section className="content"><div className="shell"><h1>Donation history</h1><div className="dashboard-grid"><DashboardNav /><div>{query.simulated && <p className="notice">A simulated development payment was recorded. It is not real money and is excluded from genuine fundraising totals.</p>}{query.error && <p className="error-box">{query.error}</p>}<div className="table-wrap"><table className="data-table"><thead><tr><th>Campaign</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{donations.map((donation) => <tr key={donation.id}><td>{donation.campaign.title}{donation.isSimulated && <><br /><Badge tone="demo">Simulated</Badge></>}</td><td>{formatINR(donation.amount)}</td><td>{donation.status}</td><td>{formatDate(donation.confirmedAt ?? donation.createdAt)}</td></tr>)}{!donations.length && <tr><td colSpan={4}>No donation records yet.</td></tr>}</tbody></table></div></div></div></div></section>;
}
