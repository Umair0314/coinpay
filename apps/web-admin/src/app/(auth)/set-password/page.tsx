import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SetPassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Open the invitation link again.");
  const { error } = await searchParams;

  return <main className="mx-auto min-h-screen max-w-md px-5 py-16">
    <div className="card">
      <h1 className="text-2xl font-bold">Set your password</h1>
      <p className="mt-2 text-sm text-gray-600">Choose a password for your CoinPay admin account.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form className="mt-5 space-y-4" action="/api/auth/set-password" method="post">
        <label className="block text-sm font-semibold">Password<input className="field" name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
        <label className="block text-sm font-semibold">Confirm password<input className="field" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" /></label>
        <button className="button-primary w-full" type="submit">Set password</button>
      </form>
    </div>
  </main>;
}
