"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const completeInvite = async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (!accessToken || !refreshToken) {
        setError("The invitation link is invalid or expired.");
        return;
      }

      const { error: sessionError } = await createClient().auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        setError("The invitation link is invalid or expired.");
        return;
      }
      router.replace("/set-password");
    };
    void completeInvite();
  }, [router]);

  return <main className="mx-auto min-h-screen max-w-md px-5 py-16"><div className="card"><h1 className="text-2xl font-bold">{error ? "Invitation unavailable" : "Accepting invitation..."}</h1>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}</div></main>;
}
