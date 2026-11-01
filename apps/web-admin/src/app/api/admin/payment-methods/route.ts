import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const { supabase } = await requireAdmin("payment_methods.manage");
  const form = await request.formData();
  const { error } = await supabase.from("payment_destinations").insert({
    method: String(form.get("method") ?? "").trim(),
    account_number: String(form.get("accountNumber") ?? "").trim(),
    account_title: String(form.get("accountTitle") ?? "").trim(),
    enabled: true
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!error && user) await supabase.from("audit_logs").insert({ actor_id: user.id, action: "payment_destination_created", entity_type: "payment_destination", after_data: { method: String(form.get("method") ?? "") } });
  return NextResponse.redirect(new URL(`/payment-methods?${error ? "error=Could+not+create+payment+method" : "saved=1"}`, request.url), 303);
}
