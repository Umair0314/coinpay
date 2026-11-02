import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { user } = await requireSuperAdmin();
  const form = await request.formData();
  const action = String(form.get("action") ?? "");
  const targetUserId = String(form.get("userId") ?? "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.redirect(new URL("/customers?error=Server+customer+configuration+missing", request.url), 303);
  if (!targetUserId || !["block", "unblock", "delete"].includes(action)) return NextResponse.redirect(new URL("/customers?error=Invalid+customer+action.", request.url), 303);
  const adminClient = createSupabaseClient(supabaseUrl, serviceKey);
  const { data: targetRole } = await adminClient.from("user_roles").select("roles(name)").eq("user_id", targetUserId).maybeSingle();
  const targetRoleName = (targetRole?.roles as { name?: string } | null)?.name;
  if (targetRoleName && targetRoleName !== "customer") return NextResponse.redirect(new URL("/customers?error=Admin+accounts+must+be+managed+from+Staff.", request.url), 303);

  if (action === "delete") {
    const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (error) return NextResponse.redirect(new URL(`/customers?error=${encodeURIComponent(error.message)}`, request.url), 303);
    await adminClient.from("audit_logs").insert({ actor_id: user.id, action: "customer_deleted", entity_type: "customer", entity_id: targetUserId });
    return NextResponse.redirect(new URL("/customers?saved=Customer+deleted.", request.url), 303);
  }

  const { error } = await adminClient.from("profiles").update({ blocked_at: action === "block" ? new Date().toISOString() : null }).eq("id", targetUserId);
  if (error) return NextResponse.redirect(new URL(`/customers?error=${encodeURIComponent(error.message)}`, request.url), 303);
  await adminClient.from("audit_logs").insert({ actor_id: user.id, action: action === "block" ? "customer_blocked" : "customer_unblocked", entity_type: "customer", entity_id: targetUserId });
  return NextResponse.redirect(new URL(`/customers?saved=Customer+${action === "block" ? "blocked" : "unblocked"}.`, request.url), 303);
}
