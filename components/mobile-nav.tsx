"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  ["Explore", "/explore"], ["Donate", "/explore?type=campaigns"], ["Give items", "/goods"], ["Community", "/community"], ["Education", "/education"], ["Volunteer", "/volunteer"], ["Organizations", "/organizations"], ["Emergency help", "/emergency"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-nav">
    <button className="icon-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    {open && <div className="nav-drawer">
      {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
    </div>}
  </div>;
}
