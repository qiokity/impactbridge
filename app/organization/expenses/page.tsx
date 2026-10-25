import { redirect } from "next/navigation";
import { OrganizationNav } from "@/app/organization/dashboard/page";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitExpenseAction } from "@/lib/actions";

export const dynamic = "force-dynamic";
type CampaignOption = { id: string; title: string };
export default async function ExpensesPage() {
  const user = await getSessionUser(); if (!user) redirect("/sign-in"); let campaigns: CampaignOption[] = [];
  try { campaigns = await db().campaign.findMany({ where: { organization: { memberships: { some: { userId: user.id } } } }, select: { id: true, title: true } }); } catch { /* setup absent */ }
  return <section className="content"><div className="shell"><h1>Submit an expense</h1><div className="dashboard-grid"><OrganizationNav /><div className="form-card"><p>Receipts and invoices require the private upload adapter; do not place sensitive proof in public text fields.</p><form action={submitExpenseAction} className="form-grid"><div className="field form-wide"><label>Campaign</label><select name="campaignId" required>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></div><div className="field"><label>Category</label><input name="category" required /></div><div className="field"><label>Amount (₹)</label><input name="amountRupees" type="number" min="1" required /></div><div className="field"><label>Transaction date</label><input name="transactionDate" type="date" required /></div><div className="field"><label>Vendor/payee</label><input name="vendor" /></div><div className="field form-wide"><label>Description</label><textarea name="description" required /></div><div className="form-wide"><button className="button" disabled={!campaigns.length}>Submit for review</button></div></form></div></div></div></section>;
}
