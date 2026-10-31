"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  async function submit(form: FormData) {
    const password = String(form.get("password") ?? "");
    if (password.length < 8) { setMessage("Use at least 8 characters."); return; }
    const { error } = await createClient().auth.updateUser({ password });
    setMessage(error?.message ?? "Password updated. You can now log in.");
  }
  return <main className="min-h-screen py-10"><div className="container-page"><h1 className="text-3xl font-bold">Choose a new password</h1><form className="card mt-8 space-y-4" action={submit}><label className="block text-sm font-semibold">New password<input className="field" name="password" type="password" minLength={8} required /></label><button className="button-primary w-full" type="submit">Update password</button>{message && <p className="text-sm text-primary">{message}</p>}</form></div></main>;
}
