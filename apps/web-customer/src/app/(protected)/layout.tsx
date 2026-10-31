import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCustomerSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = await getCustomerSettings();
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Account";
  return <div className="min-h-screen pb-24"><header className="sticky top-0 z-10 border-b border-black/5 bg-white/95 backdrop-blur"><div className="container-page flex items-center justify-between py-3"><Link className="flex items-center gap-2 font-bold text-brand-700" href="/dashboard"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-lg text-white">◈</span><span>CoinPay</span></Link><nav className="flex items-center gap-3 text-sm"><Link className="hidden rounded-full px-3 py-2 hover:bg-surface sm:block" href="/requests">Requests</Link><Link className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-surface" href="/profile" aria-label="Open profile"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-hero-mint text-xs font-bold text-hero-text">{displayName.slice(0, 1).toUpperCase()}</span><span className="hidden max-w-24 truncate sm:block">{displayName}</span></Link></nav></div></header>{children}<footer className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-white"><nav className="container-page flex justify-around py-3 text-xs"><Link href="/dashboard">Home</Link><Link href="/deposit/new">Deposit</Link>{settings.withdrawalsEnabled && <Link href="/withdraw/new">Withdraw</Link>}<Link href="/requests">Requests</Link><Link href="/support">Support</Link></nav></footer></div>;
}
