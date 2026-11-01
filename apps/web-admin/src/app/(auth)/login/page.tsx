import Link from "next/link";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="mx-auto min-h-screen max-w-md px-5 py-16">
    <div className="mb-8 rounded-2xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-900)] p-6 text-white"><p className="text-sm">CoinPay</p><h1 className="mt-2 text-3xl font-bold">Admin dashboard</h1><p className="mt-2 text-sm text-white/80">Authorized staff only. MFA is required.</p></div>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form className="card space-y-4" action="/api/auth/login" method="post">
      <label className="block text-sm font-semibold">Email<input className="field" name="email" type="email" required autoComplete="email" /></label>
      <label className="block text-sm font-semibold">Password<input className="field" name="password" type="password" required autoComplete="current-password" /></label>
      <button className="button-primary w-full" type="submit">Continue</button>
    </form>
    <p className="mt-5 text-center text-sm text-gray-600"><Link href="https://web-customer-sepia.vercel.app/" className="text-[var(--primary)]">Return to customer site</Link></p>
  </main>;
}
