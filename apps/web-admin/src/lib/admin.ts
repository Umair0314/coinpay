import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function isDevelopmentMfaBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.ADMIN_MFA_BYPASS_DEVELOPMENT === "true";
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
