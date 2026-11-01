"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) { setMessage(result.message); return; }
    window.location.href = `/login?registered=1`;
  }
  return <main className="min-h-screen py-10"><div className="container-page"><Link href="/" className="text-sm text-primary">← CoinPay</Link><div className="mt-12"><h1 className="text-3xl font-bold">Create your account</h1><p className="mt-2 text-muted">Create an account with your email and password.</p>{message && <p className="mt-4 rounded-input bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}<a className="button-outline mt-8 w-full gap-2" href="/api/auth/google"><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.4 3.1-7.5Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.4V7.6H2.9a10 10 0 0 0 0 8.8l3.3-2.7Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2a10 10 0 0 0-9.1 5.6l3.3 2.7C7 7.8 9.3 6 12 6Z"/>  </svg>Register with Google</a><div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-black/10" />OR<span className="h-px flex-1 bg-black/10" /></div><form className="card space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">Name<input className="field" name="name" required maxLength={100} /></label><label className="block text-sm font-semibold">Email<input className="field" name="email" type="email" required autoComplete="email" /></label><label className="block text-sm font-semibold">Password<input className="field" name="password" type="password" required minLength={8} autoComplete="new-password" /></label><button className="button-primary w-full" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button></form><p className="mt-6 text-center text-sm">Already registered? <Link className="font-semibold text-primary" href="/login">Log in</Link></p></div></div></main>;
}
