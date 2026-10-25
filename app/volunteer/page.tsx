import Link from "next/link";
import { UsersRound } from "lucide-react";
import { Badge } from "@/components/badge";
import { getExploreData } from "@/lib/content";

export default async function VolunteerPage() {
  const { items, isDemo } = await getExploreData("", "volunteer");
  return <><section className="page-hero"><div className="shell"><p className="eyebrow">Offer your time and skills</p><h1>Volunteer where your experience matters</h1><p>Applications, placements, and completed hours are tracked separately. No one is represented as credentialed or confirmed without the relevant review.</p></div></section><section className="content"><div className="shell">{isDemo && <p className="notice">Examples are fictional development content. They do not represent real organizations or events.</p>}<div className="grid grid-3">{items.map((item) => <article className="card" key={item.id}><div className="card-footer"><Badge>{item.category}</Badge>{item.isDemo && <Badge tone="demo">Demo</Badge>}</div><h3>{item.title}</h3><p>{item.description}</p><p className="helper-text">{item.location ?? "Location to be confirmed"}</p><Link className="text-link" href={item.href}>View opportunity →</Link></article>)}</div>{!items.length && <div className="empty"><UsersRound size={28} /><h3>No public opportunities</h3><p>Approved opportunities will appear here.</p></div>}</div></section></>;
}
