import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { statusLabel } from "@coinpay/shared";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: request } = await supabase.from("customer_requests").select("*").eq("id", id).maybeSingle();
  if (!request) notFound();
  const { data: history, error: historyError } = await supabase.from("transaction_status_history").select("from_status,to_status,note,created_at").eq("request_id", id).eq("request_type", request.type).order("created_at", { ascending: true });
  if (historyError) throw new Error(historyError.message);
  return <main className="container-page py-8"><Link className="text-sm text-primary" href="/requests">← Your requests</Link><h1 className="mt-8 text-3xl font-bold capitalize">{request.type} request</h1><div className="card mt-6 space-y-5"><div><p className="text-sm text-muted">Status</p><p className="font-semibold text-primary">{statusLabel[request.status as keyof typeof statusLabel] ?? request.status}</p></div><div><p className="text-sm text-muted">Amount</p><p className="font-semibold">Rs {Number(request.requested_amount).toLocaleString("en-PK")}</p></div><div><p className="text-sm text-muted">Game</p><p className="font-semibold">{request.game_name_snapshot}</p></div><div><p className="text-sm text-muted">Game ID or Player ID</p><p className="font-semibold">{request.player_id}</p></div><div><p className="text-sm text-muted">Submitted</p><p className="font-semibold">{new Date(request.created_at).toLocaleString("en-PK")}</p></div></div><div className="mt-6"><h2 className="text-xl font-bold">Status history</h2><div className="mt-3 space-y-3">{history?.map((item) => <div className="card" key={`${item.created_at}-${item.to_status}`}><p className="font-semibold">{statusLabel[item.to_status as keyof typeof statusLabel] ?? item.to_status}</p><p className="text-sm text-muted">{item.note || "Status updated by CoinPay."}</p><p className="mt-1 text-xs text-muted">{new Date(item.created_at).toLocaleString("en-PK")}</p></div>)}</div></div><p className="mt-5 text-sm text-muted">CoinPay processes requests manually. A request is completed only after the real-world action is confirmed.</p></main>;
}
