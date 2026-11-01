import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const { supabase } = await requireAdmin("staff.manage");
  const form = await request.formData();
  const { error } = await supabase.from("user_roles").upsert({ user_id: String(form.get("userId") ?? ""), role_id: String(form.get("roleId") ?? "") });
  const { data: { user } } = await supabase.auth.getUser();
  if (!error && user) await supabase.from("audit_logs").insert({ actor_id: user.id, action: "staff_role_assigned", entity_type: "user_role", after_data: { user_id: String(form.get("userId") ?? ""), role_id: String(form.get("roleId") ?? "") } });
  return NextResponse.redirect(new URL(`/staff?${error ? "error=Could+not+assign+role" : "saved=1"}`, request.url), 303);
}
