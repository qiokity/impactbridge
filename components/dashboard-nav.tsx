import Link from "next/link";

const links = [["Overview", "/dashboard"], ["Donations", "/dashboard/donations"], ["Goods", "/dashboard/goods"], ["Volunteering", "/dashboard/volunteering"], ["Requests", "/dashboard/requests"], ["Notifications", "/dashboard/notifications"], ["Settings", "/dashboard/settings"]];
export function DashboardNav() { return <nav className="dashboard-nav" aria-label="Dashboard navigation">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>; }
