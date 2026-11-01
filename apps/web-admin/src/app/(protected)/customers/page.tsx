import { requireAdmin } from "@/lib/admin";

export default async function Customers() {
  const { supabase } = await requireAdmin("users.read");
  const { data } = await supabase.from("profiles").select("id,full_name,phone,created_at").order("created_at", { ascending: false }).limit(100);
  return <section><h1 className="text-3xl font-bold">Customers</h1><div className="card mt-6 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-3">Name</th><th className="p-3">User ID</th><th className="p-3">Phone</th><th className="p-3">Joined</th></tr></thead><tbody>{(data ?? []).map((row) => <tr className="border-b last:border-0" key={row.id}><td className="p-3">{row.full_name || "—"}</td><td className="p-3 font-mono text-xs">{row.id}</td><td className="p-3">{row.phone || "—"}</td><td className="p-3">{new Date(row.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>;
}
