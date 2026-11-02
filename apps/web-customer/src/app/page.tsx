import Link from "next/link";
import { getCustomerSettings } from "@/lib/data";

export default async function WelcomePage() {
  const settings = await getCustomerSettings();
  const supportHref = settings.supportWhatsappNumber ? `https://wa.me/${settings.supportWhatsappNumber}` : "/support";

  return <main className="min-h-screen bg-gradient-to-b from-brand-700 to-brand-900 text-white">
    <div className="container-page flex min-h-screen flex-col justify-between gap-12 py-8 sm:py-12">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl text-[var(--logo-glyph)] shadow-xl shadow-black/10" aria-label="CoinPay logo">◈</div>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/80">Game payments</span>
        </div>
        <p className="mb-4 mt-16 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Welcome to CoinPay</p>
        <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">Simple deposits and withdrawals for your game coins.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/75">Create an account to submit requests, upload payment proof, and follow each request until it is confirmed by our team.</p>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 border-y border-white/15 py-4 sm:gap-4">
          <div className="min-w-0"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-deposit-tint text-primary"><svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v14m0 0 5-5m-5 5-5-5M5 21h14" /></svg></span><p className="mt-2 text-xs font-semibold text-white/85 sm:text-sm">Deposit coins</p></div>
          <div className="min-w-0 border-x border-white/15 px-2 sm:px-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-mint text-hero-text"><svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 7v10m3-7c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2" /></svg></span><p className="mt-2 text-xs font-semibold text-white/85 sm:text-sm">Pay</p></div>
          <div className="min-w-0"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-withdraw-tint text-[var(--withdraw-accent)]"><svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21V7m0 0 5 5m-5-5-5 5M5 3h14" /></svg></span><p className="mt-2 text-xs font-semibold text-white/85 sm:text-sm">Withdraw</p></div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"><Link className="button-primary w-full bg-white text-brand-900 shadow-lg shadow-black/10 hover:bg-white/90 sm:w-auto" href="/register">Create account</Link><Link className="button-outline w-full border-white/60 text-white hover:bg-white/10 sm:w-auto" href="/login">Log in</Link></div>
      </div>
      <div className="rounded-card border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
        <a className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-3 text-center font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl" href={supportHref} target={settings.supportWhatsappNumber ? "_blank" : undefined} rel={settings.supportWhatsappNumber ? "noreferrer" : undefined} aria-label="Contact support on WhatsApp"><svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a9.9 9.9 0 0 0-8.6 14.8L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.9 12l-.3.5.8 2.8-2.8-.7-.5.3A8 8 0 1 1 12 4Zm-4.1 3.8c.2-.2.5-.2.8-.2l1.5.7c.3.1.4.3.5.6l.4 1.1c.1.3 0 .6-.2.8l-.6.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.6c.2-.2.5-.3.8-.2l1.1.4c.3.1.5.3.6.5l.7 1.5c.1.3 0 .6-.2.8l-.5.5c-.5.5-1.2.7-1.9.5-3.1-.9-5.7-3.5-6.6-6.6-.2-.7 0-1.4.5-1.9l.5-.5Z" /></svg>Contact support on WhatsApp</a>
        <p className="mt-3 text-center text-xs text-white/60">Need help before you start? Our team can guide you.</p>
      </div>
    </div>
  </main>;
}
