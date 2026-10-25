import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";

export async function SiteHeader() {
  const user = await getSessionUser();
  return <header className="site-header">
    <div className="shell header-inner">
      <Link href="/" className="brand" aria-label="ImpactBridge home"><span className="brand-mark"><HeartHandshake size={20} /></span><span>Impact<span>Bridge</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/explore">Explore</Link><Link href="/goods">Give items</Link><Link href="/community">Community</Link><Link href="/volunteer">Volunteer</Link><Link href="/organizations">Organizations</Link><Link href="/emergency">Emergency help</Link>
      </nav>
      <div className="header-actions">
        {user ? <><Link className="text-link" href="/dashboard">Dashboard</Link><form action="/api/auth/sign-out" method="post"><button className="button button-small button-outline">Sign out</button></form></> : <><Link className="text-link" href="/sign-in">Sign in</Link><Link className="button button-small" href="/sign-up">Get started</Link></>}
      </div>
      <MobileNav />
    </div>
  </header>;
}
