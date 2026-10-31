import type { CustomerRequest, Game, PaymentDestination } from "@coinpay/shared";
import { createClient } from "./supabase/server";

export type CustomerSettings = { withdrawalsEnabled: boolean; whatsappChannelUrl: string | null; supportWhatsappNumber: string | null };

export async function getCustomerSettings(): Promise<CustomerSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("system_settings").select("key,value").in("key", ["withdrawals_enabled", "whatsapp_channel_url", "support_whatsapp_number"]);
  if (error) throw new Error(error.message);
  const values = Object.fromEntries((data ?? []).map((item) => [item.key, item.value]));
  return {
    withdrawalsEnabled: values.withdrawals_enabled !== "false",
    whatsappChannelUrl: values.whatsapp_channel_url || null,
    supportWhatsappNumber: values.support_whatsapp_number || null
  };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.message !== "Auth session missing!") throw new Error(error.message);
  return user;
}

export async function getGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("games").select("id,name,player_id_label,enabled").eq("enabled", true).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((game) => ({ id: game.id, name: game.name, playerIdLabel: game.player_id_label, enabled: game.enabled }));
}

export async function getPaymentDestinations(): Promise<PaymentDestination[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payment_destinations").select("id,method,account_number,account_title").eq("enabled", true).order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({ id: item.id, method: item.method, accountNumber: item.account_number, accountTitle: item.account_title }));
}

export async function getMyRequests(): Promise<CustomerRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("customer_requests").select("id,type,status,requested_amount,game_name_snapshot,player_id,created_at,calculated_coins").order("created_at", { ascending: false }).limit(10);
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({ id: item.id, type: item.type, status: item.status, amountPkr: Number(item.requested_amount), gameName: item.game_name_snapshot, playerId: item.player_id, createdAt: item.created_at, calculatedCoins: item.calculated_coins ? Number(item.calculated_coins) : undefined }));
}
