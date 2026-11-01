import { requireAdmin } from "@/lib/admin";

export default async function Staff() {
  const { supabase } = await requireAdmin("staff.manage");
  const [{ data }, { data: roles }] = await Promise.all([
    supabase.from("user_roles").select("user_id,created_at,roles(name)").order("created_at", { ascending: false }),
    supabase.from("roles").select("id,name").neq("name", "customer").order("name")
  ]);
  return <section><h1 className="text-3xl font-bold">Staff and roles</h1><p className="mt-1 text-gray-500">Invite staff from Supabase Auth, then assign roles in this protected area.</p><form action="/api/admin/staff" method="post" className="card mt-6 flex flex-wrap gap-3"><input className="field max-w-md" name="userId" placeholder="Supabase Auth user ID" required/><select className="field max-w-xs" name="roleId" required><option value="">Select role</option>{(roles ?? []).map((role) => <option value={role.id} key={role.id}>{role.name}</option>)}</select><button className="button-primary" type="submit">Assign role</button></form><div className="card mt-6 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-3">User ID</th><th className="p-3">Role</th><th className="p-3">Assigned</th></tr></thead><tbody>{(data ?? []).map((row) => <tr className="border-b last:border-0" key={row.user_id}><td className="p-3 font-mono text-xs">{row.user_id}</td><td className="p-3">{JSON.stringify(row.roles).replace(/[{}\[\]"]/g, "").replace("name:", "")}</td><td className="p-3">{new Date(row.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></section>;
}
