import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { Badge } from "@/components/badge";
import { getExploreData } from "@/lib/content";

export default async function EmergencyPage() {
  const { items, isDemo } = await getExploreData("", "emergency");
  return <><section className="page-hero"><div className="shell"><p className="eyebrow">Emergency assistance</p><h1>Report urgent needs for careful review</h1><p>Reports can be received quickly, but urgency never bypasses verification. This platform does not provide medical, police, rescue, or guaranteed emergency services.</p></div></section><section className="content"><div className="shell">{isDemo && <p className="notice">These are fictional examples and have not been verified or funded.</p>}<div className="card-footer"><h2>Verified public assistance</h2><Link className="button button-small" href="/requests/new?type=emergency">Report an urgent need</Link></div>{items.length ? <div className="grid grid-3">{items.map((item) => <article className="card" key={item.id}><div className="card-footer"><Badge tone="warning">{item.status.replaceAll("_", " ")}</Badge>{item.isDemo && <Badge tone="demo">Demo</Badge>}</div><h3>{item.title}</h3><p>{item.description}</p><p className="helper-text">General area: {item.location}</p><Link className="text-link" href={item.href}>View public update →</Link></article>)}</div> : <div className="empty"><HeartPulse size={28} /><h3>No public emergency requests</h3><p>Only requests explicitly approved for publication appear here.</p></div>}</div></section></>;
}
