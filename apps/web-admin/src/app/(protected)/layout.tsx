import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const links = [["/dashboard", "Overview"], ["/deposits", "Deposits"], ["/withdrawals", "Withdrawals"], ["/customers", "Customers"], ["/games", "Games & rates"], ["/payment-methods", "Payment methods"], ["/staff", "Staff"], ["/reports", "Reports"], ["/audit-logs", "Audit logs"], ["/settings", "Settings"]];
  return <div className="min-h-screen md:flex"><aside className="w-full bg-[var(--brand-900)] p-5 text-white md:min-h-screen md:w-64"><div className="mb-8 text-xl font-bold">CoinPay Admin</div><nav className="grid gap-1">{links.map(([href, label]) => <Link className="rounded-lg px-3 py-2 text-sm hover:bg-white/10" href={href} key={href}>{label}</Link>)}</nav><form className="mt-8" action="/api/auth/logout" method="post"><button className="w-full rounded-lg border border-white/30 px-3 py-2 text-sm" type="submit">Log out</button></form></aside><main className="min-w-0 flex-1 p-5 md:p-8">{children}</main></div>;
}
