import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  const authorization = request.headers.get("Authorization");
  if (!authorization) return new Response(JSON.stringify({ error: "Authentication required." }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user?.email) return new Response(JSON.stringify({ error: "Authentication required." }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } });
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("DELETION_FROM_EMAIL");
  if (!resendKey || !from) return new Response(JSON.stringify({ error: "Account deletion is not available until confirmation email delivery is configured." }), { status: 503, headers: { ...headers, "Content-Type": "application/json" } });

  const { data: attachments } = await supabase.from("transaction_attachments").select("storage_path").eq("customer_id", user.id);
  if (attachments?.length) await supabase.storage.from("payment-proofs").remove(attachments.map((item) => item.storage_path));
  await supabase.from("transaction_attachments").update({ customer_id: null, attachment_deleted_at: new Date().toISOString() }).eq("customer_id", user.id);
  await supabase.from("deposit_requests").update({ customer_id: null, player_id: "[deleted]", whatsapp_number: null }).eq("customer_id", user.id);
  await supabase.from("withdrawal_requests").update({ customer_id: null, player_id: "[deleted]", account_number: "[deleted]", account_title: "[deleted]", whatsapp_number: null }).eq("customer_id", user.id);
  await supabase.from("account_deletion_requests").update({ user_id: null, resolved_at: new Date().toISOString() }).eq("user_id", user.id);

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (deleteError) return new Response(JSON.stringify({ error: "The account could not be deleted. Contact support." }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });

  const emailResponse = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [user.email], subject: "Your CoinPay account was deleted", text: "Your CoinPay account has been deleted. Required transaction records are retained for accounting, while personal details and payment proofs were removed." }) });
  if (!emailResponse.ok) return new Response(JSON.stringify({ error: "Your account was deleted, but the confirmation email could not be sent." }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ deleted: true }), { headers: { ...headers, "Content-Type": "application/json" } });
});
