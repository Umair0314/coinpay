"use client";

import Image from "next/image";
import { useState } from "react";
import type { PaymentDestination } from "@coinpay/shared";

export default function PaymentDestinationSelector({ destinations }: { destinations: PaymentDestination[] }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = destinations.find((destination) => destination.id === selectedId);

  return <fieldset>
    <legend className="text-sm font-semibold">Payment destination</legend>
    <div className="mt-3 flex flex-wrap gap-5">
      {destinations.map((destination) => {
        const isJazzCash = destination.method.toLowerCase().includes("jazz");
        const icon = isJazzCash ? "/payment-methods/jazzcash.png" : "/payment-methods/easypaisa.jpeg";
        return <label className="group flex cursor-pointer flex-col items-center gap-2" key={destination.id}>
          <input className="peer sr-only" type="radio" name="paymentDestinationId" value={destination.id} checked={selectedId === destination.id} onChange={() => setSelectedId(destination.id)} required />
          <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-transparent bg-white p-3 shadow-sm transition group-hover:scale-105 group-hover:shadow-md peer-checked:border-primary peer-checked:bg-[var(--selected-tint)] peer-checked:ring-4 peer-checked:ring-[var(--selected-tint)]">
            <Image className="h-12 w-12 object-contain" src={icon} alt="" width={56} height={56} />
          </span>
          <span className="text-sm font-semibold">{destination.method}</span>
        </label>;
      })}
    </div>
    {selected && <div className="mt-5 rounded-card border border-primary/20 bg-[var(--selected-tint)] p-4 shadow-sm" aria-live="polite">
      <p className="text-sm font-semibold text-ink-strong">{selected.method} payment details</p>
      <p className="mt-2 text-sm text-muted">Send your payment to:</p>
      <p className="mt-1 text-lg font-bold tracking-wide text-ink">{selected.accountNumber}</p>
      <p className="text-sm text-muted">Account title: {selected.accountTitle}</p>
    </div>}
  </fieldset>;
}
