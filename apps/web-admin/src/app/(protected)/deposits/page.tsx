import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function Deposits() {
  const { supabase } = await requireAdmin("deposits.read");
  const { data } = await supabase.from("deposit_requests").select("id,customer_id,game_name_snapshot,player_id,requested_amount,calculated_coins,transaction_id,status,created_at").order("created_at", { ascending: false }).limit(100);
  return <section><h1 className="text-3xl font-bold">Deposits</h1><p className="mt-1 text-gray-500">Review payment proofs and confirm manual coin top-ups.</p><div className="card mt-6 overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead><tr className="border-b text-gray-500">{["Game","Player ID","Amount","Coins","TID","Status","Submitted","Details"].map((x) => <th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{(data ?? []).map((row) => <tr className="border-b last:border-0" key={row.id}><td className="p-3">{row.game_name_snapshot}</td><td className="p-3">{row.player_id}</td><td className="p-3">Rs {row.requested_amount}</td><td className="p-3">{row.calculated_coins}</td><td className="p-3">{row.transaction_id || "—"}</td><td className="p-3 capitalize">{row.status.replaceAll("_", " ")}</td><td className="p-3">{new Date(row.created_at).toLocaleString()}</td><td className="p-3"><Link className="text-[var(--primary)] underline" href={`/deposits/${row.id}`}>Open</Link></td></tr>)}</tbody></table></div></section>;
}
