import Link from "next/link";
import { Box } from "lucide-react";
import { Badge } from "@/components/badge";
import { getExploreData } from "@/lib/content";

export default async function GoodsPage() {
  const { items, isDemo } = await getExploreData("", "goods");
  return <><section className="page-hero"><div className="shell"><p className="eyebrow">Useful things, shared safely</p><h1>Give items a second chance to help</h1><p>Offer goods for moderated, direct coordination. Addresses and phone numbers remain private until it is appropriate to share them.</p></div></section><section className="content"><div className="shell">{isDemo && <p className="notice">These are fictional development listings, not offers of real goods.</p>}<div className="card-footer"><h2>Available listings</h2><Link className="button button-small" href="/dashboard/goods">Offer an item</Link></div>{items.length ? <div className="grid grid-3">{items.map((item) => <article className="card" key={item.id}><div className="card-footer"><Badge>{item.category}</Badge>{item.isDemo && <Badge tone="demo">Demo</Badge>}</div><h3>{item.title}</h3><p>{item.description}</p><p className="helper-text">Pickup area: {item.location ?? "Shared after approval"}</p><Link className="text-link" href={item.href}>View listing →</Link></article>)}</div> : <div className="empty"><Box size={28} /><h3>No available listings</h3><p>Approved offers will appear here.</p></div>}</div></section></>;
}
