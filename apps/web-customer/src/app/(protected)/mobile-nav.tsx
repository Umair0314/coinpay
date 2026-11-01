"use client";

import Link from "next/link";
import { useState } from "react";

type MobileNavProps = {
  withdrawalsEnabled: boolean;
};

export default function MobileNav({ withdrawalsEnabled }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const links = withdrawalsEnabled
    ? [["/dashboard", "Home"], ["/deposit/new", "Deposit"], ["/withdraw/new", "Withdraw"], ["/requests", "Requests"], ["/support", "Support"]] as const
    : [["/dashboard", "Home"], ["/deposit/new", "Deposit"], ["/requests", "Requests"], ["/support", "Support"]] as const;

  return <div className="md:hidden">
    <button
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl"
      type="button"
      aria-expanded={open}
      aria-controls="mobile-navigation"
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      onClick={() => setOpen((value) => !value)}
    >
      <span aria-hidden="true">{open ? "×" : "☰"}</span>
    </button>
    {open && <nav id="mobile-navigation" className="absolute inset-x-0 top-full border-t border-white/10 bg-brand-900 p-3 shadow-lg">
      <div className="mx-auto grid max-w-2xl gap-1">
        {links.map(([href, label]) => <Link className="rounded-xl px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10" href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
      </div>
    </nav>}
  </div>;
}
