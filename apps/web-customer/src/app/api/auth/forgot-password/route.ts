import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${new URL(request.url).origin}/reset-password` });
  if (error) return NextResponse.redirect(new URL(`/forgot-password?error=${encodeURIComponent(error.message)}`, request.url));
  return NextResponse.redirect(new URL("/forgot-password?sent=1", request.url));
}
