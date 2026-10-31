"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => setEmail(new URLSearchParams(window.location.search).get("email") ?? ""), []);
  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const response = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: new FormData(event.currentTarget).get("code") }) });
    const result = await response.json(); setLoading(false); setMessage(result.message);
    if (response.ok) window.location.href = "/login?verified=1";
  }
  async function resend() {
    if (cooldown) return; setCooldown(60); const timer = window.setInterval(() => setCooldown((value) => { if (value <= 1) { window.clearInterval(timer); return 0; } return value - 1; }), 1000);
    const response = await fetch("/api/auth/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json(); setMessage(result.message);
  }
  return <main className="min-h-screen py-10"><div className="container-page"><Link href="/register" className="text-sm text-primary">← Register</Link><div className="mt-12"><h1 className="text-3xl font-bold">Verify your email</h1><p className="mt-2 text-muted">Enter the 6-digit code sent to <strong>{email}</strong>.</p><form className="card mt-8 space-y-4" onSubmit={verify}><label className="block text-sm font-semibold">Verification code<input className="field text-center text-2xl tracking-[0.4em]" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required /></label><button className="button-primary w-full" type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify email"}</button>{message && <p className="text-sm text-primary" role="status">{message}</p>}</form><button className="mt-4 w-full text-sm font-semibold text-primary disabled:text-muted" onClick={resend} disabled={cooldown > 0}>{cooldown ? `Resend code in ${cooldown}s` : "Resend code"}</button></div></div></main>;
}
