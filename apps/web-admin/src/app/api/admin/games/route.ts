import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const { supabase } = await requireAdmin("games.manage");
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const { data: game, error } = await supabase.from("games").insert({ name, enabled: true }).select("id").single();
  if (!error && game) {
    await supabase.from("exchange_rates").insert({
      game_id: game.id,
      purchase_coins_per_pkr: Number(form.get("purchaseRate")),
      withdrawal_pkr_per_coin: Number(form.get("withdrawalRate")),
      min_amount_pkr: Number(form.get("minAmount")),
      max_amount_pkr: Number(form.get("maxAmount"))
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("audit_logs").insert({ actor_id: user.id, action: "game_created", entity_type: "game", entity_id: game.id, after_data: { name } });
  }
  return NextResponse.redirect(new URL(`/games?${error ? "error=Could+not+create+game" : "saved=1"}`, request.url), 303);
}
