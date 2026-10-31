import { NextResponse } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 60_000;
const limit = 10;

export function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = process.env.AUTH_ALLOWED_ORIGINS?.split(",").map((value) => value.trim()) ?? [];
  return {
    "Access-Control-Allow-Origin": origin && (allowed.length === 0 || allowed.includes(origin)) ? origin : allowed[0] ?? "*",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin"
  };
}

export function optionsResponse(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export function jsonResponse(request: Request, body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

export function allowedRequest(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export async function requestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return await request.json() as Record<string, unknown>;
  const form = await request.formData();
  return Object.fromEntries(form.entries()) as Record<string, unknown>;
}
