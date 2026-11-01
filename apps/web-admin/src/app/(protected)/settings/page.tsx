import { requireAdmin } from "@/lib/admin";

export default async function Settings() {
  const { supabase } = await requireAdmin("settings.manage");
  const { data } = await supabase.from("system_settings").select("key,value,updated_at").order("key");
  return <section><h1 className="text-3xl font-bold">Settings</h1><p className="mt-1 text-gray-500">Sensitive settings should be changed through audited server mutations.</p><form action="/api/admin/settings" method="post" className="card mt-6 flex flex-wrap gap-3"><input className="field max-w-xs" name="key" placeholder="Setting key" required/><input className="field max-w-xs" name="value" placeholder="Value" required/><button className="button-primary" type="submit">Save setting</button></form><div className="card mt-6 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-3">Key</th><th className="p-3">Value</th><th className="p-3">Updated</th></tr></thead><tbody>{(data ?? []).map((row) => <tr className="border-b last:border-0" key={row.key}><td className="p-3">{row.key}</td><td className="p-3">{row.value}</td><td className="p-3">{new Date(row.updated_at).toLocaleString()}</td></tr>)}</tbody></table></div></section>;
}
