import Link from "next/link";

export default function ForgotPasswordPage() {
  return <main className="min-h-screen py-10"><div className="container-page"><Link href="/login" className="text-sm text-primary">← Log in</Link><div className="mt-12"><h1 className="text-3xl font-bold">Reset your password</h1><p className="mt-2 text-muted">Enter your email and we will send a reset link.</p><form className="card mt-8 space-y-4" action="/api/auth/forgot-password" method="post"><label className="block text-sm font-semibold">Email<input className="field" name="email" type="email" required /></label><button className="button-primary w-full" type="submit">Send reset link</button></form></div></div></main>;
}
