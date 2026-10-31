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
    window.location.href = `/verify?email=${encodeURIComponent(email)}`;
  }
  return <main className="min-h-screen py-10"><div className="container-page"><Link href="/" className="text-sm text-primary">← CoinPay</Link><div className="mt-12"><h1 className="text-3xl font-bold">Create your account</h1><p className="mt-2 text-muted">We will email a 6-digit verification code.</p>{message && <p className="mt-4 rounded-input bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}<form className="card mt-8 space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">Name<input className="field" name="name" required maxLength={100} /></label><label className="block text-sm font-semibold">Email<input className="field" name="email" type="email" required autoComplete="email" /></label><label className="block text-sm font-semibold">Password<input className="field" name="password" type="password" required minLength={8} autoComplete="new-password" /></label><button className="button-primary w-full" type="submit" disabled={loading}>{loading ? "Sending code..." : "Create account"}</button></form><p className="mt-6 text-center text-sm">Already registered? <Link className="font-semibold text-primary" href="/login">Log in</Link></p></div></div></main>;
}
