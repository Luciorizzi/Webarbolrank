"use client";
import { useState } from "react";
import { formatImpactKg } from "@/config/finance";
import { formatARS } from "@/lib/currency";
import type { RankingParticipant } from "@/types/ranking";

export function DonationSummary({ participant, donorName, anonymous, impactUnits, total, onEdit }: { participant: RankingParticipant | null; donorName: string; anonymous: boolean; impactUnits: number; total: number; onEdit: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantSlug: participant?.slug, donorName: anonymous ? undefined : donorName, anonymous, impactUnits }),
      });
      const result: unknown = await response.json();
      const payload = result && typeof result === "object" ? result as Record<string, unknown> : {};
      if (!response.ok || typeof payload.init_point !== "string") throw new Error(typeof payload.error === "string" ? payload.error : "No se pudo iniciar el pago.");
      window.location.assign(payload.init_point);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "No se pudo iniciar el pago.");
      setLoading(false);
    }
  }

  return <div><p className="eyebrow">Resumen de donación</p><dl className="my-6 space-y-4 border-y border-white/8 py-5"><div><dt className="text-xs uppercase tracking-wider text-zinc-500">{participant ? "Apoyás a" : "Destino"}</dt><dd className="mt-1 text-xl font-bold text-white">{participant?.name ?? "Donación general"}</dd></div><div><dt className="text-xs uppercase tracking-wider text-zinc-500">Donante</dt><dd className="mt-1 text-white">{anonymous ? "Anónimo" : donorName}</dd></div><div className="flex justify-between"><dt className="text-zinc-500">Aporte</dt><dd className="text-white">{formatImpactKg(impactUnits)} de alimento</dd></div><div className="flex justify-between"><dt className="text-zinc-500">Total</dt><dd className="font-bold text-amber-300">{formatARS(total)}</dd></div><p className="text-xs text-zinc-500">Sin costos adicionales.</p></dl><button type="button" onClick={startCheckout} disabled={loading} className="w-full rounded-full bg-amber-400 px-5 py-4 text-xs font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">{loading ? "Conectando con Mercado Pago…" : "Ir al pago"}</button>{error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}<button type="button" onClick={onEdit} disabled={loading} className="mt-3 w-full rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-white/25 disabled:opacity-50">Volver / Editar</button></div>;
}
