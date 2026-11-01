import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default async function DepositDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin("deposits.read");
  const [{ data: request }, { data: history }, { data: attachment }] = await Promise.all([
    supabase.from("deposit_requests").select("id,customer_id,game_name_snapshot,player_id,requested_amount,rate_used,calculated_coins,transaction_id,status,created_at,payment_destination_id").eq("id", id).maybeSingle(),
    supabase.from("transaction_status_history").select("from_status,to_status,note,created_at").eq("request_id", id).eq("request_type", "deposit").order("created_at", { ascending: true }),
    supabase.from("transaction_attachments").select("storage_path,mime_type").eq("request_id", id).eq("request_type", "deposit").maybeSingle()
  ]);
  if (!request) notFound();
  const signed = attachment ? await supabase.storage.from("payment-proofs").createSignedUrl(attachment.storage_path, 300) : { data: null };
  return <section><Link className="text-sm text-[var(--primary)]" href="/deposits">← Deposits</Link><h1 className="mt-4 text-3xl font-bold">Deposit request</h1><div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="card space-y-3"><p><b>Game:</b> {request.game_name_snapshot}</p><p><b>Player ID:</b> {request.player_id}</p><p><b>Amount:</b> Rs {request.requested_amount}</p><p><b>Coins:</b> {request.calculated_coins}</p><p><b>Rate:</b> {request.rate_used}</p><p><b>Transaction ID:</b> {request.transaction_id || "—"}</p><p><b>Status:</b> {request.status.replaceAll("_", " ")}</p><p><b>Submitted:</b> {new Date(request.created_at).toLocaleString()}</p></div><div className="card">{signed.data?.signedUrl ? <a href={signed.data.signedUrl} target="_blank" rel="noreferrer"><img className="max-h-[420px] w-full rounded-lg object-contain" src={signed.data.signedUrl} alt="Payment proof" /></a> : <p className="text-gray-500">No payment proof is available.</p>}</div></div><div className="card mt-5"><h2 className="text-xl font-bold">Status history</h2><div className="mt-3 space-y-3">{(history ?? []).map((item) => <div className="border-b pb-3 last:border-0" key={`${item.created_at}-${item.to_status}`}><p className="font-semibold">{item.to_status.replaceAll("_", " ")}</p><p className="text-sm text-gray-500">{item.note || "—"} · {new Date(item.created_at).toLocaleString()}</p></div>)}</div></div></section>;
}
