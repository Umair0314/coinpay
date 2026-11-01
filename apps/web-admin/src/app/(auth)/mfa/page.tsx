import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((item) => item.status === "verified");
  if (!factor) return <main className="mx-auto max-w-md px-5 py-16"><div className="card"><h1 className="text-2xl font-bold">MFA setup required</h1><p className="mt-3 text-sm text-gray-600">This account has no verified authenticator yet.</p><a className="button-primary mt-6 inline-block" href="/mfa/setup">Set up authenticator</a></div></main>;
  const { error } = await searchParams;
  return <main className="mx-auto max-w-md px-5 py-16"><div className="card"><h1 className="text-2xl font-bold">Enter authenticator code</h1>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<form className="mt-5 space-y-4" action="/api/auth/mfa" method="post"><input type="hidden" name="factorId" value={factor.id} /><label className="block text-sm font-semibold">6-digit code<input className="field" name="code" inputMode="numeric" pattern="[0-9]{6}" required /></label><button className="button-primary w-full" type="submit">Verify and open dashboard</button></form></div></main>;
}
