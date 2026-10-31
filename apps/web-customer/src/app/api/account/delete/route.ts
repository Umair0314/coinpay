import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const confirmation = form.get("confirmation") === "delete";
  if (!password || !confirmation) return NextResponse.redirect(new URL("/account/delete?error=Confirm+the+deletion+and+enter+your+password.", request.url));
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.redirect(new URL("/login", request.url));
    const { error: passwordError } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (passwordError) return NextResponse.redirect(new URL("/account/delete?error=The+password+is+incorrect.", request.url));
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) return NextResponse.redirect(new URL(`/account/delete?error=${encodeURIComponent(error.message)}`, request.url));
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/?deleted=1", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Account deletion is temporarily unavailable.";
    return NextResponse.redirect(new URL(`/account/delete?error=${encodeURIComponent(message)}`, request.url));
  }
}
