import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const supabase = await createClient();
  const factorId = String(form.get("factorId") ?? "");
  const code = String(form.get("code") ?? "");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return NextResponse.redirect(new URL(`/mfa?error=${encodeURIComponent("The authenticator code is invalid.")}`, request.url), 303);
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
