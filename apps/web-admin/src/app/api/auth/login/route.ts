import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Invalid admin credentials.")}`, request.url), 303);
  const { data: { user } } = await supabase.auth.getUser();
  const { data: isAdmin } = await supabase.rpc("is_admin_user", { target_user: user?.id });
  if (!isAdmin) { await supabase.auth.signOut(); return NextResponse.redirect(new URL("/login?error=This+account+is+not+an+admin.", request.url), 303); }
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return NextResponse.redirect(new URL(assurance?.currentLevel === "aal2" ? "/dashboard" : "/mfa", request.url), 303);
}
