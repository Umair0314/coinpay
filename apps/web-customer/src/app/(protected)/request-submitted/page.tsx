import Link from "next/link";

export default async function RequestSubmittedPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  const { id, type } = await searchParams;
  const requestType = type === "withdrawal" ? "withdrawal" : "deposit";
  const title = requestType === "withdrawal" ? "Withdrawal request submitted" : "Deposit request submitted";
  const description = requestType === "withdrawal"
    ? "Your withdrawal request has been received. Our team will review the game details and confirm the payout manually."
    : "Your deposit request has been received. Our team will review your payment proof and confirm the coin top-up manually.";

  return <main className="container-page flex min-h-[70vh] items-center justify-center py-10">
    <section className="card w-full max-w-lg text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-primary" aria-hidden="true">✓</div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">Request received</p>
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-4 leading-7 text-muted">{description}</p>
      <p className="mt-4 text-sm text-muted">You can follow the status from your request history. CoinPay only marks a request completed after the real-world action is confirmed.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {id && <Link className="button-primary" href={`/requests/${id}`}>View request status</Link>}
        <Link className="button-outline" href="/dashboard">Back to home</Link>
      </div>
    </section>
  </main>;
}
