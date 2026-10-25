import Link from "next/link";
import { signUpAction } from "@/lib/actions";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return <section className="content-narrow"><div className="form-card"><p className="eyebrow">Join responsibly</p><h1>Create your account</h1><p>Use a strong password. You control whether your name appears on public giving records.</p>{query.error && <p className="error-box">{query.error}</p>}<form action={signUpAction}><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required /></div><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={12} autoComplete="new-password" required /></div><label className="checkbox"><input type="checkbox" required />I agree to the <Link className="text-link" href="/terms">terms</Link> and understand that this is not an emergency service.</label><div className="form-actions"><button className="button">Create account</button></div></form><p>Already have an account? <Link className="text-link" href="/sign-in">Sign in</Link></p></div></section>;
}
