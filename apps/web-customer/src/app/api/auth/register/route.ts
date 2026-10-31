import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!email || password.length < 8 || !name) return NextResponse.redirect(new URL("/register?error=Check+your+details", request.url));
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(error.message)}`, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup is temporarily unavailable.";
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(message)}`, request.url));
  }
  return NextResponse.redirect(new URL("/login?registered=1", request.url));
}
