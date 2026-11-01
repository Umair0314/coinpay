import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const { supabase } = await requireAdmin("settings.manage");
  const form = await request.formData();
  const { error } = await supabase.from("system_settings").upsert({ key: String(form.get("key") ?? ""), value: String(form.get("value") ?? ""), updated_at: new Date().toISOString() });
  const { data: { user } } = await supabase.auth.getUser();
  if (!error && user) await supabase.from("audit_logs").insert({ actor_id: user.id, action: "setting_updated", entity_type: "system_setting", after_data: { key: String(form.get("key") ?? "") } });
  return NextResponse.redirect(new URL(`/settings?${error ? "error=Could+not+save+setting" : "saved=1"}`, request.url), 303);
}
