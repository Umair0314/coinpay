import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  const auth = request.headers.get("Authorization");
  if (!auth) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const body = await request.json();
  if (!body.idempotencyKey || !body.gameId || !body.payoutMethod || !body.accountNumber || !body.accountTitle || Number(body.amountPkr) <= 0) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  const { data: withdrawalSetting } = await admin.from("system_settings").select("value").eq("key", "withdrawals_enabled").single();
  if (withdrawalSetting?.value === "false") return new Response(JSON.stringify({ error: "Withdrawals are currently unavailable." }), { status: 403 });
  const { data: game } = await admin.from("games").select("name").eq("id", body.gameId).eq("enabled", true).single();
  const { data: rate } = await admin.from("exchange_rates").select("withdrawal_pkr_per_coin,min_amount_pkr,max_amount_pkr").eq("game_id", body.gameId).lte("effective_from", new Date().toISOString()).or("effective_to.is.null,effective_to.gt." + new Date().toISOString()).order("effective_from", { ascending: false }).limit(1).single();
  if (!game || !rate || Number(body.amountPkr) < Number(rate.min_amount_pkr) || (rate.max_amount_pkr && Number(body.amountPkr) > Number(rate.max_amount_pkr))) return new Response(JSON.stringify({ error: "The selected game is not available for this amount." }), { status: 400 });
  const { data, error } = await admin.from("withdrawal_requests").insert({ customer_id: user.id, game_id: body.gameId, game_name_snapshot: game.name, player_id: body.playerId, requested_amount: body.amountPkr, rate_used: rate.withdrawal_pkr_per_coin, calculated_payout: Number(body.amountPkr) * Number(rate.withdrawal_pkr_per_coin), payout_method: body.payoutMethod, account_number: body.accountNumber, account_title: body.accountTitle, whatsapp_number: body.whatsappNumber || null, idempotency_key: body.idempotencyKey }).select("id").single();
  return new Response(JSON.stringify(error ? { error: error.message } : data), { status: error ? 400 : 200, headers: { "Content-Type": "application/json" } });
});
