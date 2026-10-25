import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/badge";
import { approveExpenseAction, moderateAction } from "@/lib/actions";

const adminLinks = [["Overview", "/admin"], ["Organizations", "/admin/organizations"], ["Campaigns", "/admin/campaigns"], ["Requests", "/admin/requests"], ["Expenses", "/admin/expenses"], ["Moderation", "/admin/moderation"], ["Payments", "/admin/payments"], ["Audit logs", "/admin/audit-logs"]];
export function AdminNav() { return <nav className="dashboard-nav">{adminLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>; }

type PendingQueues = {
  campaigns: Array<{ id: string; title: string }>;
  education: Array<{ id: string; title: string }>;
  emergency: Array<{ id: string; title: string }>;
  goods: Array<{ id: string; title: string }>;
  expenses: Array<{ id: string; category: string; description: string; amount: number }>;
};
type QueueRow = { id: string; title: string; targetType: string; approve: string };

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); if (!["MODERATOR", "ADMIN"].includes(user.role)) redirect("/dashboard");
  let pending: PendingQueues = { campaigns: [], education: [], emergency: [], goods: [], expenses: [] };
  try { const client = db(); const [campaigns, education, emergency, goods, expenses] = await Promise.all([client.campaign.findMany({ where: { status: "PENDING_REVIEW" }, take: 10, orderBy: { createdAt: "asc" } }), client.educationRequest.findMany({ where: { status: "PENDING_REVIEW" }, take: 10, orderBy: { createdAt: "asc" } }), client.emergencyRequest.findMany({ where: { status: "REPORTED" }, take: 10, orderBy: [{ urgency: "desc" }, { createdAt: "asc" }] }), client.goodsListing.findMany({ where: { status: "PENDING_REVIEW" }, take: 10, orderBy: { createdAt: "asc" } }), client.expense.findMany({ where: { status: "PENDING" }, take: 10, orderBy: { createdAt: "asc" } })]); pending = { campaigns, education, emergency, goods, expenses }; } catch { /* database unavailable */ }
  const rows: QueueRow[] = [...pending.campaigns.map((item) => ({ ...item, targetType: "Campaign", approve: "ACTIVE" })), ...pending.education.map((item) => ({ ...item, targetType: "EducationRequest", approve: "APPROVED" })), ...pending.emergency.map((item) => ({ ...item, targetType: "EmergencyRequest", approve: "VERIFIED_FOR_PUBLICATION" })), ...pending.goods.map((item) => ({ ...item, targetType: "GoodsListing", approve: "AVAILABLE" }))];
  return <section className="content"><div className="shell"><p className="eyebrow">Moderation workspace</p><h1>Review queue</h1><div className="dashboard-grid"><AdminNav /><div className="grid"><div className="card"><h2>Pending content</h2>{rows.map((item) => <div className="ledger-row" key={`${item.targetType}-${item.id}`}><span><Badge>{item.targetType}</Badge><br /><strong>{item.title}</strong></span><span><form action={moderateAction}><input type="hidden" name="targetType" value={item.targetType} /><input type="hidden" name="targetId" value={item.id} /><input type="hidden" name="decision" value={item.approve} /><input type="hidden" name="reason" value="Approved after moderation review." /><button className="button button-small">Approve</button></form></span><span><form action={moderateAction}><input type="hidden" name="targetType" value={item.targetType} /><input type="hidden" name="targetId" value={item.id} /><input type="hidden" name="decision" value="REJECTED" /><input type="hidden" name="reason" value="Rejected after moderation review." /><button className="button button-small button-danger">Reject</button></form></span></div>)}{!rows.length && <p>No pending content found.</p>}</div><div className="card"><h2>Expense evidence review</h2>{pending.expenses.map((expense) => <div className="ledger-row" key={expense.id}><span><strong>{expense.category}</strong><br />{expense.description}</span><span>₹{expense.amount / 100}</span><form action={approveExpenseAction}><input type="hidden" name="expenseId" value={expense.id} /><input type="hidden" name="reason" value="Approved after evidence review." /><button className="button button-small">Approve expense</button></form></div>)}{!pending.expenses.length && <p>No pending expenses.</p>}</div></div></div></div></section>;
}
