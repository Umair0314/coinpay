import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  const auth = request.headers.get("Authorization");
  if (!auth) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  const body = await request.json();
  if (!body.idempotencyKey || !body.gameId || !body.paymentDestinationId || !body.playerId || Number(body.amountPkr) <= 0) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  const { data: game } = await admin.from("games").select("name").eq("id", body.gameId).eq("enabled", true).single();
  const { data: rate } = await admin.from("exchange_rates").select("purchase_coins_per_pkr,min_amount_pkr,max_amount_pkr").eq("game_id", body.gameId).lte("effective_from", new Date().toISOString()).or("effective_to.is.null,effective_to.gt." + new Date().toISOString()).order("effective_from", { ascending: false }).limit(1).single();
  if (!game || !rate || Number(body.amountPkr) < Number(rate.min_amount_pkr) || (rate.max_amount_pkr && Number(body.amountPkr) > Number(rate.max_amount_pkr))) return new Response(JSON.stringify({ error: "The selected game is not available for this amount." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  const { data, error } = await admin.from("deposit_requests").insert({ customer_id: user.id, game_id: body.gameId, game_name_snapshot: game.name, player_id: body.playerId, requested_amount: body.amountPkr, rate_used: rate.purchase_coins_per_pkr, calculated_coins: Number(body.amountPkr) * Number(rate.purchase_coins_per_pkr), payment_destination_id: body.paymentDestinationId, transaction_id: body.transactionId || null, whatsapp_number: null, idempotency_key: body.idempotencyKey }).select("id").single();
  if (!error && data) {
    if (body.attachmentPath) await admin.from("transaction_attachments").insert({ request_id: data.id, request_type: "deposit", customer_id: user.id, storage_path: body.attachmentPath, mime_type: "image/*" });
    await admin.from("transaction_status_history").insert({ request_id: data.id, request_type: "deposit", from_status: null, to_status: "pending", actor_id: user.id, note: "Request submitted by customer." });
  }
  return new Response(JSON.stringify(error ? { error: error.message } : data), { status: error ? 400 : 200, headers: { ...cors, "Content-Type": "application/json" } });
});
