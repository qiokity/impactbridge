import Link from "next/link";
import { Badge } from "@/components/badge";
import { getExploreData } from "@/lib/content";

export default async function EducationPage() {
  const { items, isDemo } = await getExploreData("", "education");
  return <><section className="page-hero"><div className="shell"><p className="eyebrow">Education support</p><h1>Keep learning within reach</h1><p>Student and guardian requests are reviewed privately. Personal documents, school IDs, addresses, and financial details never appear on public pages.</p></div></section><section className="content"><div className="shell">{isDemo && <p className="notice">Development examples are fictional and do not represent real students or needs.</p>}<div className="card-footer"><h2>Eligible public requests</h2><Link className="button button-small" href="/requests/new?type=education">Request education support</Link></div>{items.length ? <div className="grid grid-3">{items.map((item) => <article className="card" key={item.id}><Badge>{item.category}</Badge><h3>{item.title}</h3><p>{item.description}</p><p className="helper-text">General location: {item.location}</p><Link className="text-link" href={item.href}>View request →</Link></article>)}</div> : <div className="empty"><h3>No public requests</h3><p>Approved requests will appear here only with suitable privacy controls.</p></div>}</div></section></>;
}
