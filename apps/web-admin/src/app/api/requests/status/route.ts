import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const { error } = await supabase.rpc("admin_update_request_status", {
    request_id: String(form.get("requestId") ?? ""),
    request_kind: String(form.get("requestType") ?? ""),
    next_status: String(form.get("status") ?? ""),
    status_note: String(form.get("note") ?? "") || null,
    processing_ref: String(form.get("reference") ?? "") || null
  });
  if (error) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(error.message)}`, request.url), 303);
  return NextResponse.redirect(new URL("/dashboard?updated=1", request.url), 303);
}
