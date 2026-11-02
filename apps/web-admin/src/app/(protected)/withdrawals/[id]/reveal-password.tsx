"use client";

import { useState } from "react";

export default function RevealPassword({ requestId, available }: { requestId: string; available: boolean }) {
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function reveal() {
    setError("");
    const response = await fetch(`/api/withdrawals/${requestId}/password`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "Could not reveal password.");
    else setPassword(result.password);
  }
  if (!available) return <p className="text-sm text-gray-500">Unavailable for requests created before encrypted password storage.</p>;
  return <div className="mt-4"><button className="button-outline" type="button" onClick={reveal}>{password ? "Hide game password" : "Reveal game password"}</button>{password && <p className="mt-2 rounded-lg bg-amber-50 p-3 font-mono text-lg">{password}</p>}{error && <p className="mt-2 text-sm text-red-700">{error}</p>}</div>;
}
