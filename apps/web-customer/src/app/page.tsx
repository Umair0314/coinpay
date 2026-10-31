import Link from "next/link";

export default function WelcomePage() {
  return <main className="min-h-screen bg-gradient-to-b from-brand-700 to-brand-900 text-white">
    <div className="container-page flex min-h-screen flex-col justify-between py-10">
      <div>
        <div className="mb-16 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-[var(--logo-glyph)]" aria-label="CoinPay logo">◈</div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">CoinPay</p>
        <h1 className="max-w-md text-4xl font-bold leading-tight">Fast PKR deposits &amp; withdrawals for your game coins.</h1>
        <p className="mt-5 max-w-md text-white/75">Create an account to submit requests, upload payment proof, and follow each request until it is confirmed by our team.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link className="button-primary bg-white text-brand-900" href="/register">Get started</Link><Link className="button-outline border-white/60 text-white" href="/login">Log in</Link></div>
      </div>
      <div className="space-y-3">
        <a className="block rounded-card bg-[var(--whatsapp)] px-5 py-4 text-center font-semibold text-white" href="#" aria-label="Join WhatsApp channel">Join WhatsApp channel</a>
        <p className="text-center text-sm text-white/60">Support links are configured by the CoinPay team.</p>
      </div>
    </div>
  </main>;
}
