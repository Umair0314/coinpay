import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    if (!authData.user) return NextResponse.redirect(new URL("/login?error=This+user+does+not+exist.", request.url));
    if (!authData.user.email_confirmed_at && !authData.user.confirmed_at) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?error=Verify+your+email+with+the+6-digit+code+before+logging+in.", request.url));
    }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("id", authData.user.id).maybeSingle();
    if (profileError) throw new Error(profileError.message);
    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?error=This+user+does+not+exist.", request.url));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login is temporarily unavailable.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
