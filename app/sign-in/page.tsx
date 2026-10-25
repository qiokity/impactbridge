import Link from "next/link";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const query = await searchParams;
  return <section className="content-narrow"><div className="form-card"><p className="eyebrow">Welcome back</p><h1>Sign in to ImpactBridge</h1>{query.error && <p className="error-box">{query.error}</p>}<form action="/api/auth/sign-in" method="post"><input type="hidden" name="next" value={query.next ?? "/dashboard"} /><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div><div className="form-actions"><button className="button">Sign in</button></div></form><p className="helper-text">Password reset and email verification require a configured transactional email provider.</p><p>New here? <Link className="text-link" href="/sign-up">Create an account</Link></p></div></section>;
}
