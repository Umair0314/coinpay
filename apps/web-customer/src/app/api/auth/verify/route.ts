import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { allowedRequest, jsonResponse, optionsResponse, requestBody } from "../helpers";

export async function POST(request: Request) {
  const body = await requestBody(request);
  const email = String(body.email ?? "").trim().toLowerCase();
  const code = String(body.code ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) return jsonResponse(request, { success: false, message: "Enter a valid email and 6-digit code." }, 400);
  if (!allowedRequest(`verify:${email}`)) return jsonResponse(request, { success: false, message: "Too many verification attempts. Try again later." }, 429);
  const { data, error } = await (await createClient()).auth.verifyOtp({ email, token: code, type: "signup" });
  if (error || !data.user) return jsonResponse(request, { success: false, message: error?.message ?? "The verification code is invalid or expired." }, 400);
  return jsonResponse(request, { success: true, message: "Email verified successfully." });
}

export function OPTIONS(request: Request) { return optionsResponse(request); }
