import { createClient } from "@/lib/supabase/server";
import { allowedRequest, jsonResponse, optionsResponse, requestBody } from "../helpers";

export async function POST(request: Request) {
  const body = await requestBody(request);
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonResponse(request, { success: false, message: "Enter a valid email." }, 400);
  if (!allowedRequest(`resend:${email}`)) return jsonResponse(request, { success: false, message: "Please wait before requesting another code." }, 429);
  const { error } = await (await createClient()).auth.resend({ type: "signup", email });
  if (error) return jsonResponse(request, { success: false, message: error.message }, 400);
  return jsonResponse(request, { success: true, message: "A new verification code was sent." });
}

export function OPTIONS(request: Request) { return optionsResponse(request); }
