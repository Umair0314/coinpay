import { requireAdmin } from "@/lib/admin";

export default async function Reports() {
  const { supabase } = await requireAdmin("reports.read");
  const [{ data: deposits }, { data: withdrawals }] = await Promise.all([supabase.from("deposit_requests").select("requested_amount,status"), supabase.from("withdrawal_requests").select("requested_amount,status")]);
  const sum = (rows: { requested_amount: number; status: string }[] | null) => (rows ?? []).reduce((total, row) => total + Number(row.requested_amount), 0);
  return <section><h1 className="text-3xl font-bold">Reports</h1><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="card"><p className="text-gray-500">Total deposit requests</p><p className="mt-2 text-3xl font-bold">Rs {sum(deposits)}</p></div><div className="card"><p className="text-gray-500">Total withdrawal requests</p><p className="mt-2 text-3xl font-bold">Rs {sum(withdrawals)}</p></div></div></section>;
}
