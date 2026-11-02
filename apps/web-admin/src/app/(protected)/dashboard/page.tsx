import { requireAdmin } from "@/lib/admin";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string }> }) {
  const { supabase } = await requireAdmin("deposits.read");
  const [{ count: users }, { count: pendingDeposits }, { count: completedDeposits }, { count: pendingWithdrawals }, { data: deposits }, { data: withdrawals }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("deposit_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("deposit_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("deposit_requests").select("id,customer_id,game_name_snapshot,requested_amount,status,created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("withdrawal_requests").select("id,customer_id,game_name_snapshot,requested_amount,status,created_at").order("created_at", { ascending: false }).limit(8)
  ]);
  const { error, updated } = await searchParams;
  const activity = [...(deposits ?? []).map((row) => ({ ...row, type: "deposit" })), ...(withdrawals ?? []).map((row) => ({ ...row, type: "withdrawal" }))].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  return <section><header className="mb-6 flex items-start justify-between"><div><p className="text-sm text-gray-500">Operations</p><h1 className="text-3xl font-bold">Overview</h1></div></header>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{updated && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">Request updated.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Users", users ?? 0], ["Pending deposits", pendingDeposits ?? 0], ["Completed deposits", completedDeposits ?? 0], ["Pending withdrawals", pendingWithdrawals ?? 0]].map(([label, value]) => <div className="card" key={label}><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
    <div className="card mt-6 overflow-x-auto"><h2 className="mb-4 text-xl font-bold">Recent activity</h2><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-3">Type</th><th className="p-3">Game</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Submitted</th><th className="p-3">Action</th></tr></thead><tbody>{activity.map((row) => <tr className="border-b last:border-0" key={`${row.type}-${row.id}`}><td className="p-3 capitalize">{row.type}</td><td className="p-3">{row.game_name_snapshot}</td><td className="p-3">Rs {row.requested_amount}</td><td className="p-3 capitalize">{row.status.replaceAll("_", " ")}</td><td className="p-3">{new Date(row.created_at).toLocaleString()}</td><td className="p-3"><form action="/api/requests/status" method="post" className="flex flex-wrap gap-2"><input type="hidden" name="requestId" value={row.id}/><input type="hidden" name="requestType" value={row.type}/><select className="rounded border p-1" name="status" defaultValue=""><option value="" disabled>Change</option><option value="processing">Processing</option><option value="completed">Complete</option><option value="rejected">Reject</option></select><input className="rounded border p-1" name="note" placeholder="Reason (optional)"/><button className="button-outline px-2 py-1 text-xs" type="submit">Save</button></form></td></tr>)}</tbody></table></div>
  </section>;
}
