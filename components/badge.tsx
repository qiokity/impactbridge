export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "demo" | "warning" | "success" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
