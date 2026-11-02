import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import RevealPassword from "./reveal-password";

export default async function WithdrawalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin("withdrawals.read");
  const [{ data: request }, { data: history }] = await Promise.all([
    supabase.from("withdrawal_requests").select("id,customer_id,game_name_snapshot,player_id,requested_amount,rate_used,calculated_payout,payout_method,account_number,account_title,whatsapp_number,withdraw_password_encrypted,status,created_at").eq("id", id).maybeSingle(),
    supabase.from("transaction_status_history").select("from_status,to_status,note,created_at").eq("request_id", id).eq("request_type", "withdrawal").order("created_at", { ascending: true })
  ]);
  if (!request) notFound();
  return <section><Link className="text-sm text-[var(--primary)]" href="/withdrawals">← Withdrawals</Link><h1 className="mt-4 text-3xl font-bold">Withdrawal request</h1><div className="card mt-6 space-y-3"><p><b>Game:</b> {request.game_name_snapshot}</p><p><b>Player ID:</b> {request.player_id}</p><p><b>Amount:</b> Rs {request.requested_amount}</p><p><b>Expected payout:</b> Rs {request.calculated_payout}</p><p><b>Rate:</b> {request.rate_used}</p><p><b>Payout method:</b> {request.payout_method}</p><p><b>Account:</b> {request.account_number} · {request.account_title}</p><p><b>Status:</b> {request.status.replaceAll("_", " ")}</p><p><b>Submitted:</b> {new Date(request.created_at).toLocaleString()}</p><RevealPassword requestId={request.id} available={Boolean(request.withdraw_password_encrypted)} /></div><div className="card mt-5"><h2 className="text-xl font-bold">Status history</h2><div className="mt-3 space-y-3">{(history ?? []).map((item) => <div className="border-b pb-3 last:border-0" key={`${item.created_at}-${item.to_status}`}><p className="font-semibold">{item.to_status.replaceAll("_", " ")}</p><p className="text-sm text-gray-500">{item.note || "—"} · {new Date(item.created_at).toLocaleString()}</p></div>)}</div></div></section>;
}
