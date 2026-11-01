import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedRequest, corsHeaders, jsonResponse, optionsResponse, requestBody } from "../helpers";

export async function POST(request: Request) {
  const body = await requestBody(request);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || name.length < 1;
  if (invalid) return isJson ? jsonResponse(request, { success: false, message: "Enter a valid name, email, and password of at least 8 characters." }, 400) : NextResponse.redirect(new URL("/register?error=Check+your+details", request.url));
  if (!allowedRequest(`register:${email}`)) return jsonResponse(request, { success: false, message: "Too many registration attempts. Try again later." }, 429);
  try {
    const supabase = await createClient();
    const emailRedirectTo = new URL("/auth/callback", request.url).toString();
    const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo } });
    if (!signupError && signupData.user && (signupData.session || signupData.user.email_confirmed_at || signupData.user.confirmed_at)) {
      return isJson
        ? jsonResponse(request, { success: true, message: "Account created. You can now log in." })
        : NextResponse.redirect(new URL("/login?registered=1", request.url), 303);
    }
    if (signupError?.message.toLowerCase().includes("already registered")) {
      const admin = createAdminClient();
      const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (usersError) throw new Error(usersError.message);
      const existingUser = users.users.find((user) => user.email?.toLowerCase() === email);

      const isEmailConfirmed = Boolean(existingUser?.email_confirmed_at || existingUser?.confirmed_at);
      if (existingUser && !isEmailConfirmed) {
        const { error: resendError } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo } });
        if (resendError) throw new Error(resendError.message);
        return isJson
          ? jsonResponse(request, { success: true, message: "A new confirmation link was sent to your email." })
          : NextResponse.redirect(new URL("/login?registered=1", request.url), 303);
      } else {
        return isJson
          ? jsonResponse(request, { success: false, message: "This email is already registered. Log in or reset your password." }, 400)
          : NextResponse.redirect(new URL("/register?error=This+email+is+already+registered.+Log+in+or+reset+your+password.", request.url));
      }
    }
    if (signupError) {
      const emailDeliveryFailed = signupError.message.toLowerCase().includes("sending confirmation email");
      const message = emailDeliveryFailed
        ? "We could not send the verification email. Configure Supabase Auth SMTP and try again."
        : signupError.message;
      return isJson
        ? jsonResponse(request, { success: false, message }, emailDeliveryFailed ? 503 : 400)
        : NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup is temporarily unavailable.";
    return isJson ? jsonResponse(request, { success: false, message }, 500) : NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(message)}`, request.url));
  }
  return isJson ? jsonResponse(request, { success: true, message: "Confirmation link sent to your email." }) : NextResponse.redirect(new URL("/login?registered=1", request.url), 303);
}

export function OPTIONS(request: Request) { return optionsResponse(request); }
