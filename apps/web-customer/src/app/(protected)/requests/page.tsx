import Link from "next/link";
import { getMyRequests } from "@/lib/data";
import { statusLabel } from "@coinpay/shared";

export default async function RequestsPage() {
  const requests = await getMyRequests();
  return <main className="container-page py-8"><h1 className="text-3xl font-bold">Your requests</h1><div className="mt-6 space-y-3">{requests.length ? requests.map((request) => <Link className="card flex items-center justify-between" href={`/requests/${request.id}`} key={request.id}><div><p className="font-semibold capitalize">{request.type}</p><p className="text-sm text-muted">{request.gameName} · {new Date(request.createdAt).toLocaleDateString("en-PK")}</p></div><div className="text-right"><p className="font-semibold">Rs {request.amountPkr.toLocaleString("en-PK")}</p><p className="text-sm text-primary">{statusLabel[request.status]}</p></div></Link>) : <div className="card text-center text-muted">No requests yet. Tap Deposit or Withdraw to start.</div>}</div></main>;
}
