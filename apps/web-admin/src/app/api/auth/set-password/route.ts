import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  if (password.length < 8 || password !== confirmPassword) {
    return NextResponse.redirect(new URL("/set-password?error=Passwords+must+match+and+be+at+least+8+characters.", request.url), 303);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?error=Open the invitation link again.", request.url), 303);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.redirect(new URL(`/set-password?error=${encodeURIComponent(error.message)}`, request.url), 303);
  return NextResponse.redirect(new URL("/mfa", request.url), 303);
}
