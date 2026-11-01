import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { depositSchema } from "@coinpay/shared";

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = depositSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.redirect(new URL("/deposit/new?error=Check+your+details", request.url));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const path = `${user.id}/${crypto.randomUUID()}`;
  const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, parsed.data.proof, { contentType: parsed.data.proof.type, upsert: false });
  if (uploadError) return NextResponse.redirect(new URL(`/deposit/new?error=${encodeURIComponent(uploadError.message)}`, request.url));
  const { proof: _proof, ...requestBody } = parsed.data;
  const { data, error } = await supabase.functions.invoke("create-deposit-request", { body: { ...requestBody, attachmentPath: path, idempotencyKey: crypto.randomUUID() } });
  if (error || !data) {
    const detail = data?.error || error?.message || "The request could not be submitted.";
    await supabase.storage.from("payment-proofs").remove([path]);
    return NextResponse.redirect(new URL(`/deposit/new?error=${encodeURIComponent(String(detail))}`, request.url));
  }
  return NextResponse.redirect(new URL(`/requests/${data.id}`, request.url));
}
