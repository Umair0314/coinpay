import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withdrawalSchema } from "@coinpay/shared";

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = withdrawalSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.redirect(new URL("/withdraw/new?error=Check+your+details", request.url));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const { data, error } = await supabase.functions.invoke("create-withdrawal-request", { body: { ...parsed.data, idempotencyKey: crypto.randomUUID() } });
  if (error || !data) return NextResponse.redirect(new URL(`/withdraw/new?error=${encodeURIComponent(error?.message ?? "The request could not be submitted.")}`, request.url));
  return NextResponse.redirect(new URL(`/request-submitted?id=${data.id}&type=withdrawal`, request.url));
}
