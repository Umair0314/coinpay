import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { user } = await requireSuperAdmin();
  const form = await request.formData();
  const requestId = String(form.get("requestId") ?? "");
  const requestType = String(form.get("requestType") ?? "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.redirect(new URL("/dashboard?error=Server+request+configuration+missing", request.url), 303);
  if (!requestId || !["deposit", "withdrawal"].includes(requestType)) {
    return NextResponse.redirect(new URL("/dashboard?error=Invalid+request+deletion.", request.url), 303);
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceKey);
  const table = requestType === "deposit" ? "deposit_requests" : "withdrawal_requests";
  const { data: requestRow, error: requestError } = await adminClient.from(table).select("id").eq("id", requestId).maybeSingle();
  if (requestError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(requestError.message)}`, request.url), 303);
  if (!requestRow) return NextResponse.redirect(new URL("/dashboard?error=Request+not+found.", request.url), 303);

  const { data: attachments, error: attachmentsError } = await adminClient
    .from("transaction_attachments")
    .select("storage_path")
    .eq("request_id", requestId)
    .eq("request_type", requestType);
  if (attachmentsError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(attachmentsError.message)}`, request.url), 303);

  const paths = (attachments ?? []).map((attachment) => attachment.storage_path);
  if (paths.length) {
    const { error: storageError } = await adminClient.storage.from("payment-proofs").remove(paths);
    if (storageError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(storageError.message)}`, request.url), 303);
  }

  const { error: attachmentDeleteError } = await adminClient.from("transaction_attachments").delete().eq("request_id", requestId).eq("request_type", requestType);
  if (attachmentDeleteError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(attachmentDeleteError.message)}`, request.url), 303);
  const { error: historyError } = await adminClient.from("transaction_status_history").delete().eq("request_id", requestId).eq("request_type", requestType);
  if (historyError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(historyError.message)}`, request.url), 303);
  const { error: notificationError } = await adminClient.from("notifications").delete().eq("request_id", requestId).eq("request_type", requestType);
  if (notificationError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(notificationError.message)}`, request.url), 303);
  const { error: deleteError } = await adminClient.from(table).delete().eq("id", requestId);
  if (deleteError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(deleteError.message)}`, request.url), 303);

  const { error: auditError } = await adminClient.from("audit_logs").insert({
    actor_id: user.id,
    action: "request_deleted",
    entity_type: requestType,
    entity_id: requestId,
    before_data: { request_type: requestType, request_id: requestId },
  });
  if (auditError) return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(auditError.message)}`, request.url), 303);
  return NextResponse.redirect(new URL("/dashboard?saved=Request+deleted.", request.url), 303);
}
