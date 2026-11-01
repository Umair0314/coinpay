import { requireAdmin } from "@/lib/admin";

export default async function AuditLogs() {
  const { supabase } = await requireAdmin("audit_logs.read");
  const { data } = await supabase.from("audit_logs").select("id,actor_id,action,entity_type,entity_id,created_at").order("created_at", { ascending: false }).limit(200);
  return <section><h1 className="text-3xl font-bold">Audit logs</h1><div className="card mt-6 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Actor</th><th className="p-3">Time</th></tr></thead><tbody>{(data ?? []).map((row) => <tr className="border-b last:border-0" key={row.id}><td className="p-3">{row.action}</td><td className="p-3">{row.entity_type} / {row.entity_id}</td><td className="p-3 font-mono text-xs">{row.actor_id}</td><td className="p-3">{new Date(row.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></section>;
}
