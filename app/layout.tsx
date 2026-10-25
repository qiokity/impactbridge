import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "ImpactBridge | Every act of kindness, accounted for", template: "%s | ImpactBridge" },
  description: "A transparent, community-driven platform for charitable giving, requests, volunteering, and local action.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body><SiteHeader /><main>{children}</main><footer className="site-footer"><div className="shell footer-grid"><div><p className="brand">Impact<span>Bridge</span></p><p>Every act of kindness. Every impact accounted for.</p></div><div><p className="footer-label">Trust & policies</p><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/donation-policy">Donation & refunds</a><a href="/community-guidelines">Community guidelines</a></div><div><p className="footer-label">Important</p><p>Demo content is fictional. Verification does not guarantee outcomes. Legal templates require review before production.</p></div></div></footer></body></html>;
}
