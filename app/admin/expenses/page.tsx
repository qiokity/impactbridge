import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminExpensesPage() { const user = await getSessionUser(); if (!user) redirect("/sign-in"); redirect("/admin"); }
