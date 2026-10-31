import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/login?verified=1";
  if (!code) return NextResponse.redirect(new URL("/login?error=The+confirmation+link+is+invalid+or+expired.", request.url));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("The confirmation link is invalid or expired.")}`, request.url));
  return NextResponse.redirect(new URL(destination, request.url));
}
