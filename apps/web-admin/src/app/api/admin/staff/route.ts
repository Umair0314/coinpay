import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { supabase, user } = await requireSuperAdmin();
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const roleId = String(form.get("roleId") ?? "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.redirect(new URL("/staff?error=Server+invite+configuration+missing", request.url), 303);
  }
  const adminClient = createSupabaseClient(supabaseUrl, serviceKey);
  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email);
  const error = inviteError ?? (invited.user
    ? (await adminClient.from("user_roles").upsert(
        { user_id: invited.user.id, role_id: roleId, invited_by: user.id },
        { onConflict: "user_id" }
      )).error
    : new Error("Invitation failed"));
  if (!error && user) await adminClient.from("audit_logs").insert({ actor_id: user.id, action: "staff_invited", entity_type: "user_role", after_data: { email, role_id: roleId } });
  const result = error ? `error=${encodeURIComponent(error.message)}` : "saved=1";
  return NextResponse.redirect(new URL(`/staff?${result}`, request.url), 303);
}
