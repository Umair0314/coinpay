"use client";

import Image from "next/image";
import { useState } from "react";
import type { PaymentDestination } from "@coinpay/shared";

export default function PaymentDestinationSelector({ destinations }: { destinations: PaymentDestination[] }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = destinations.find((destination) => destination.id === selectedId);

  return <fieldset>
    <legend className="text-sm font-semibold">Payment destination</legend>
    <div className="mt-4 flex flex-wrap justify-center gap-6">
      {destinations.map((destination) => {
        const isJazzCash = destination.method.toLowerCase().includes("jazz");
        const icon = isJazzCash ? "/payment-methods/jazzcash.png" : "/payment-methods/easypaisa.jpeg";
        return <label className="group flex cursor-pointer flex-col items-center gap-2" key={destination.id}>
          <input className="peer sr-only" type="radio" name="paymentDestinationId" value={destination.id} checked={selectedId === destination.id} onChange={() => setSelectedId(destination.id)} required />
          <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-white p-3 shadow-md transition group-hover:scale-105 group-hover:shadow-lg peer-checked:border-primary peer-checked:bg-[var(--selected-tint)] peer-checked:ring-4 peer-checked:ring-[var(--selected-tint)]">
            <Image className="h-12 w-12 object-contain" src={icon} alt="" width={56} height={56} />
          </span>
          <span className="text-base font-bold text-ink">{destination.method}</span>
        </label>;
      })}
    </div>
    {selected && <div className="mx-auto mt-6 max-w-md rounded-card border-2 border-primary/30 bg-[var(--selected-tint)] p-5 text-center shadow-md" aria-live="polite">
      <p className="text-base font-bold text-ink-strong">{selected.method} payment details</p>
      <p className="mt-3 text-sm font-semibold text-ink">Send your payment to:</p>
      <p className="mt-1 text-2xl font-extrabold tracking-wider text-ink-strong">{selected.accountNumber}</p>
      <p className="mt-2 text-base font-semibold text-ink">Account title: {selected.accountTitle}</p>
    </div>}
  </fieldset>;
}
