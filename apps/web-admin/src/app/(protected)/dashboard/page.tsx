import { requireAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; updated?: string; type?: string; status?: string; search?: string }> }) {
  const { supabase } = await requireAdmin("deposits.read");
  const filters = await searchParams;
  const { data: currentRole } = await supabase.from("user_roles").select("roles(name)").eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "").maybeSingle();
  const isSuperAdmin = (currentRole?.roles as { name?: string } | null)?.name === "super_admin";
  const requestType = filters.type === "withdrawal" ? "withdrawal" : filters.type === "deposit" ? "deposit" : "all";
  const status = filters.status || "pending";
  const search = filters.search?.trim() || "";
  let depositQuery = supabase.from("deposit_requests").select("id,customer_id,game_name_snapshot,player_id,requested_amount,status,created_at");
  let withdrawalQuery = supabase.from("withdrawal_requests").select("id,customer_id,game_name_snapshot,player_id,requested_amount,status,created_at,withdraw_password_encrypted");
  if (status !== "all") {
    depositQuery = depositQuery.eq("status", status);
    withdrawalQuery = withdrawalQuery.eq("status", status);
  }
  if (search) {
    depositQuery = depositQuery.or(`game_name_snapshot.ilike.%${search}%,player_id.ilike.%${search}%`);
    withdrawalQuery = withdrawalQuery.or(`game_name_snapshot.ilike.%${search}%,player_id.ilike.%${search}%`);
  }
  const [{ count: users }, { count: pendingDeposits }, { count: completedDeposits }, { count: pendingWithdrawals }, { count: completedWithdrawals }, { data: deposits }, { data: withdrawals }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("deposit_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("deposit_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
    requestType === "withdrawal" ? Promise.resolve({ data: [] }) : depositQuery.order("created_at", { ascending: false }).limit(8),
    requestType === "deposit" ? Promise.resolve({ data: [] }) : withdrawalQuery.order("created_at", { ascending: false }).limit(8)
  ]);
  const activity = [...(deposits ?? []).map((row) => ({ ...row, type: "deposit" as const, withdraw_password_encrypted: null })), ...(withdrawals ?? []).map((row) => ({ ...row, type: "withdrawal" as const }))].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  return <section><header className="mb-6 flex items-start justify-between"><div><p className="text-sm text-gray-500">Operations</p><h1 className="text-3xl font-bold">Overview</h1></div></header>
    {filters.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{filters.error}</p>}{(filters.updated || filters.saved) && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{filters.saved || "Request updated."}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Users", users ?? 0], ["Pending deposits", pendingDeposits ?? 0], ["Completed deposits", completedDeposits ?? 0], ["Pending withdrawals", pendingWithdrawals ?? 0], ["Completed withdrawals", completedWithdrawals ?? 0]].map(([label, value]) => <div className="card" key={label}><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
    <div className="card mt-6"><form className="flex flex-wrap items-end gap-3" method="get"><label className="text-sm">Type<select className="mt-1 block rounded border p-2" name="type" defaultValue={requestType}><option value="all">All</option><option value="deposit">Deposits</option><option value="withdrawal">Withdrawals</option></select></label><label className="text-sm">Status<select className="mt-1 block rounded border p-2" name="status" defaultValue={status}><option value="pending">Pending</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="rejected">Rejected</option><option value="all">All statuses</option></select></label><label className="text-sm">Search<input className="mt-1 block rounded border p-2" name="search" defaultValue={search} placeholder="Game or player ID"/></label><button className="button-outline px-4 py-2" type="submit">Filter</button><Link className="px-2 py-2 text-sm underline" href="/dashboard">Clear</Link></form></div>
    <div className="card mt-6"><h2 className="mb-4 text-xl font-bold">Recent activity</h2><div className="space-y-4">{activity.map((row) => <article className="rounded-xl border p-4" key={`${row.type}-${row.id}`}><div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-gray-500">Type</p><p className="font-semibold capitalize">{row.type}</p></div><div><p className="text-xs text-gray-500">Game</p><p>{row.game_name_snapshot}</p></div><div><p className="text-xs text-gray-500">Game ID or Player ID</p><p className="font-mono text-xs">{row.player_id || "—"}</p></div><div><p className="text-xs text-gray-500">Withdraw Password</p><p>{row.type === "withdrawal" ? (row.withdraw_password_encrypted ? "Available — open request" : "Not available") : "—"}</p></div><div><p className="text-xs text-gray-500">Amount</p><p>Rs {row.requested_amount}</p></div><div><p className="text-xs text-gray-500">Status</p><p className="capitalize">{row.status.replaceAll("_", " ")}</p></div><div><p className="text-xs text-gray-500">Submitted</p><p>{new Date(row.created_at).toLocaleString()}</p></div><div><p className="text-xs text-gray-500">Request</p><Link className="text-[var(--primary)] underline" href={`/${row.type === "deposit" ? "deposits" : "withdrawals"}/${row.id}`}>Open request</Link></div></div><div className="mt-4 flex flex-wrap gap-2 border-t pt-3"><form action="/api/requests/status" method="post" className="flex flex-wrap gap-2"><input type="hidden" name="requestId" value={row.id}/><input type="hidden" name="requestType" value={row.type}/><select className="rounded border p-2" name="status" defaultValue=""><option value="" disabled>Change status</option><option value="processing">Processing</option><option value="completed">Complete</option><option value="rejected">Reject</option></select><input className="min-w-0 flex-1 rounded border p-2" name="note" placeholder="Reason (optional)"/><button className="button-outline px-3 py-2 text-xs" type="submit">Save</button></form>{isSuperAdmin && <form action="/api/admin/requests" method="post"><input type="hidden" name="requestId" value={row.id}/><input type="hidden" name="requestType" value={row.type}/><button className="rounded-lg border border-red-600 px-3 py-2 text-xs text-red-700" type="submit">Delete request</button></form>}</div></article>)}</div></div>
  </section>;
}
