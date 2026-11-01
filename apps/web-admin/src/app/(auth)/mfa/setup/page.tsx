"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function MfaSetupPage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function enroll() {
      const supabase = createClient();
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const existing = factors?.totp.find((factor: { id: string; status: string }) => factor.status === "unverified");
      if (existing) {
        if (active) setFactorId(existing.id);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "CoinPay Admin" });
      if (!active) return;
      if (error || !data) setMessage(error?.message ?? "Could not start MFA setup.");
      else {
        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
      }
      setLoading(false);
    }
    void enroll();
    return () => { active = false; };
  }, []);

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setMessage(challengeError?.message ?? "Could not start MFA verification.");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (error) setMessage("The code is invalid or expired.");
    else router.push("/dashboard");
  }

  if (loading) return <main className="mx-auto max-w-md px-5 py-16"><div className="card">Preparing MFA setup…</div></main>;
  return <main className="mx-auto max-w-md px-5 py-16">
    <div className="card">
      <h1 className="text-2xl font-bold">Set up authenticator</h1>
      <p className="mt-3 text-sm text-gray-600">Scan this QR code with Google Authenticator, Authy, or another TOTP app.</p>
      {qrCode && <img className="mx-auto my-6 h-56 w-56" src={qrCode} alt="Authenticator setup QR code" />}
      {secret && <p className="break-all rounded bg-gray-100 p-3 text-center font-mono text-xs">Manual key: {secret}</p>}
      {message && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}
      <form className="mt-5 space-y-4" onSubmit={verify}>
        <label className="block text-sm font-semibold">6-digit code<input className="field" name="code" value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" required /></label>
        <button className="button-primary w-full" type="submit">Verify authenticator</button>
      </form>
    </div>
  </main>;
}
