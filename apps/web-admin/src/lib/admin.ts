import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function isDevelopmentMfaBypassEnabled() {
  return process.env.ADMIN_MFA_BYPASS_DEVELOPMENT === "true";
}

export async function requireSuperAdmin() {
  const result = await requireAdmin("staff.manage");
  const { data: role } = await result.supabase.from("user_roles").select("roles(name)").eq("user_id", result.user.id).maybeSingle();
  const roleName = (role?.roles as { name?: string } | null)?.name ?? null;
  if (roleName !== "super_admin") redirect("/dashboard?error=Super%20Admin%20access%20required");
  return result;
}

export async function requireAdmin(permission?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isDevelopmentMfaBypassEnabled()) {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.currentLevel !== "aal2") redirect("/mfa");
  }
  const { data: allowed, error } = permission
    ? await supabase.rpc("has_admin_permission", { requested_permission: permission })
    : { data: true, error: null };
  if (error || !allowed) redirect("/dashboard?error=Permission%20denied");
  return { supabase, user };
}
