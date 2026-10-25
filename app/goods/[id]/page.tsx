import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { createGoodsClaimAction } from "@/lib/actions";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { availableGoodsQuantity } from "@/lib/goods-inventory";

export const dynamic = "force-dynamic";
export default async function GoodsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await getSessionUser();
  if (id.startsWith("demo-")) return <section className="content-narrow"><div className="form-card"><Badge tone="demo">Fictional listing</Badge><h1>Development preview</h1><p>This sample listing has no real donor, goods, address, or contact details. Connect and seed the database to use the claim workflow.</p><Link className="button" href="/goods">Back to goods</Link></div></section>;
  let listing = null; try { listing = await db().goodsListing.findFirst({ where: { id, status: "AVAILABLE" }, include: { owner: { select: { name: true } } } }); } catch { /* handled below */ }
  if (!listing) notFound();
  const available = availableGoodsQuantity(listing.quantity, listing.reservedQuantity);
  return <section className="content"><div className="shell detail-grid"><article className="card"><div className="card-footer"><Badge>{listing.category}</Badge><Badge tone="success">Available</Badge></div><h1>{listing.title}</h1><p className="detail-copy">{listing.description}</p><h3>Collection information</h3><p>Approximate pickup area: {listing.pickupArea}. Exact contact details are only exchanged after the donor authorizes coordination.</p>{listing.category.toLowerCase().includes("food") && <p className="notice">Food should be safe, within expiry, stored hygienically, and compliant with local requirements. Do not claim unsafe or prohibited food.</p>}</article><aside className="form-card sticky-card"><h2>{available} {listing.unit} available</h2>{user ? <form action={createGoodsClaimAction}><input type="hidden" name="listingId" value={listing.id} /><div className="field"><label htmlFor="quantity">Quantity requested</label><input id="quantity" name="quantity" type="number" min="1" max={available} defaultValue="1" required /></div><div className="field"><label htmlFor="note">Note to donor (optional)</label><textarea id="note" name="note" maxLength={1000} /></div><button className="button">Request this item</button></form> : <Link className="button" href={`/sign-in?next=/goods/${listing.id}`}>Sign in to request</Link>}</aside></div></section>;
}
