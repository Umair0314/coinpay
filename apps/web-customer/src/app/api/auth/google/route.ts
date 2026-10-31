import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const redirectTo = new URL("/auth/callback?next=/dashboard", request.url).toString();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo }
  });

  if (error || !data.url) {
    const message = error?.message ?? "Google sign-in is unavailable.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }

  return NextResponse.redirect(data.url);
}
