import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { supabase, user } = await requireSuperAdmin();
  const form = await request.formData();
  const action = String(form.get("action") ?? "invite");
  const targetUserId = String(form.get("userId") ?? "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.redirect(new URL("/staff?error=Server+staff+configuration+missing", request.url), 303);
  }
  const adminClient = createSupabaseClient(supabaseUrl, serviceKey);

  if (action === "remove-role" || action === "delete-user") {
    if (!targetUserId || targetUserId === user.id) {
      return NextResponse.redirect(new URL("/staff?error=You+cannot+remove+your+own+staff+access.", request.url), 303);
    }

    const { data: targetRole } = await adminClient
      .from("user_roles")
      .select("role_id,roles(name)")
      .eq("user_id", targetUserId)
      .maybeSingle();
    const roleName = (targetRole?.roles as { name?: string } | null)?.name;
    if (!targetRole || !roleName || roleName === "customer") {
      return NextResponse.redirect(new URL("/staff?error=Staff+member+not+found.", request.url), 303);
    }

    if (roleName === "super_admin") {
      const { count } = await adminClient
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role_id", targetRole.role_id);
      if ((count ?? 0) <= 1) {
        return NextResponse.redirect(new URL("/staff?error=The+last+Super+Admin+cannot+be+removed.", request.url), 303);
      }
    }

    if (action === "remove-role") {
      const { error } = await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
      if (error) return NextResponse.redirect(new URL(`/staff?error=${encodeURIComponent(error.message)}`, request.url), 303);
      await adminClient.from("audit_logs").insert({
        actor_id: user.id,
        action: "staff_role_removed",
        entity_type: "user_role",
        entity_id: targetUserId,
        before_data: { role: roleName },
      });
      return NextResponse.redirect(new URL("/staff?saved=Staff+role+removed.", request.url), 303);
    }

    const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (error) return NextResponse.redirect(new URL(`/staff?error=${encodeURIComponent(error.message)}`, request.url), 303);
    await adminClient.from("audit_logs").insert({
      actor_id: user.id,
      action: "staff_user_deleted",
      entity_type: "user_role",
      entity_id: targetUserId,
      before_data: { role: roleName },
    });
    return NextResponse.redirect(new URL("/staff?saved=Staff+user+deleted.", request.url), 303);
  }

  const email = String(form.get("email") ?? "").trim();
  const roleId = String(form.get("roleId") ?? "");
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.redirect(new URL("/staff?error=Server+invite+configuration+missing", request.url), 303);
  }
  const adminAppUrl = process.env.ADMIN_APP_URL;
  if (!adminAppUrl) {
    return NextResponse.redirect(new URL("/staff?error=Admin+invite+URL+configuration+missing", request.url), 303);
  }
  const redirectTo = new URL("/auth/callback?next=/set-password", `${adminAppUrl.replace(/\/$/, "")}/`).toString();
  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, { redirectTo });
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
