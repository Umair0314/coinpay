import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { decryptWithdrawalPassword } from "@/lib/withdraw-password";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin("withdrawals.approve");
  const { data: row, error } = await supabase.from("withdrawal_requests").select("withdraw_password_encrypted").eq("id", id).maybeSingle();
  if (error || !row?.withdraw_password_encrypted) return NextResponse.json({ error: "This request was created before encrypted password storage was enabled." }, { status: 404 });
  try {
    const password = decryptWithdrawalPassword(row.withdraw_password_encrypted);
    await supabase.from("audit_logs").insert({ actor_id: user.id, action: "withdrawal_password_revealed", entity_type: "withdrawal", entity_id: id });
    return NextResponse.json({ password });
  } catch {
    return NextResponse.json({ error: "Could not decrypt the withdrawal password." }, { status: 500 });
  }
}
