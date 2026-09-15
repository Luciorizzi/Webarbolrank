"use client";
import { useEffect, useRef, useState } from "react";
import { DONATION_UNIT_PRICE, formatImpactKg, KG_PER_DONATION_UNIT } from "@/config/finance";
import { formatARS } from "@/lib/currency";
import { calculateDonationTotal } from "@/lib/donation";
import type { RankingParticipant } from "@/types/ranking";
import { DonationSummary } from "./DonationSummary";
import { ParticipantSelector } from "./ParticipantSelector";
import { ImpactUnitCounter } from "./ImpactUnitCounter";

export function DonateWidget({ participants, participant, onParticipantChange }: { participants: RankingParticipant[]; participant: RankingParticipant | null; onParticipantChange: (participant: RankingParticipant | null) => void }) {
  const [impactUnits, setImpactUnits] = useState(KG_PER_DONATION_UNIT);
  const [donorName, setDonorName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [nameError, setNameError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const total = calculateDonationTotal(impactUnits);
  useEffect(() => {
    if (!summaryOpen) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSummaryOpen(false); };
    document.addEventListener("keydown", closeOnEscape); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [summaryOpen]);
  function openSummary() {
    const normalizedDonorName = donorName.trim();
    if (!anonymous && normalizedDonorName.length < 2) { setNameError("Ingresá un nombre o alias de al menos 2 caracteres."); return; }
    if (!anonymous && normalizedDonorName.length > 60) { setNameError("El nombre o alias puede tener hasta 60 caracteres."); return; }
    setNameError(""); setSummaryOpen(true);
  }
  return <>
    <section id="donar" className="scroll-mt-32 py-20 sm:py-28 md:scroll-mt-24"><div className="relative overflow-hidden rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-400/12 via-white/[0.035] to-orange-400/5 p-6 sm:p-10"><div className="absolute -right-16 -top-20 size-64 rounded-full bg-amber-400/10 blur-3xl" /><div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
      <div><p className="eyebrow">Tu impacto</p><h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">Sumá alimento</h2><p className="mt-4 max-w-lg text-zinc-400">Aportá kilogramos de alimento directamente o sumalos a una comunidad del ranking.</p><p className="mt-5 text-lg text-white">{formatImpactKg(KG_PER_DONATION_UNIT)} = <strong className="text-amber-300">{formatARS(DONATION_UNIT_PRICE)} final</strong></p>{participant && <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4"><p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Estás sumando por</p><p className="mt-1 font-bold uppercase text-white">{participant.name} {participant.verified && <span className="text-sky-400">✓</span>}</p><button type="button" onClick={() => onParticipantChange(null)} className="mt-2 text-xs text-amber-300 underline underline-offset-4">Cambiar a donación general</button></div>}</div>
      <div className="rounded-3xl border border-white/10 bg-[#100d09]/80 p-5 shadow-2xl sm:p-8"><ParticipantSelector participants={participants} value={participant} onChange={onParticipantChange} /><label className="mt-5 block"><span className="mb-2 block text-xs uppercase tracking-[0.15em] text-zinc-500">Tu nombre o alias</span><input value={donorName} onChange={(event) => { setDonorName(event.target.value); setNameError(""); }} disabled={anonymous} required={!anonymous} minLength={anonymous ? undefined : 2} maxLength={60} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "donor-name-error" : anonymous ? "anonymous-name-help" : undefined} className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40" placeholder={anonymous ? "Se mostrará como Anónimo" : "Ej: Lucio"} />{nameError && <span id="donor-name-error" role="alert" className="mt-2 block text-xs text-red-300">{nameError}</span>}{anonymous && <span id="anonymous-name-help" className="mt-2 block text-xs text-zinc-500">Públicamente aparecerá como Anónimo.</span>}</label><label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={anonymous} onChange={(event) => { setAnonymous(event.target.checked); setNameError(""); }} className="size-4 accent-amber-400" />Donar de forma anónima</label><div className="mt-6"><ImpactUnitCounter value={impactUnits} onChange={setImpactUnits} /></div><div className="my-7 border-y border-white/8 py-6"><p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Aportás</p><p className="mt-1 font-display text-3xl font-bold uppercase text-white">{formatImpactKg(impactUnits)} de alimento</p><p className="mt-5 text-xs uppercase tracking-[0.18em] text-zinc-500">Total final</p><p className="mt-1 font-display text-4xl font-bold text-white">{formatARS(total)}</p><p className="mt-2 text-xs text-zinc-500">Sin costos adicionales</p></div><button type="button" onClick={openSummary} className="w-full rounded-full bg-amber-400 px-6 py-4 text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Continuar</button></div>
    </div></div></section>
    {summaryOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSummaryOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="donation-summary-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#110e0a] p-6 shadow-2xl sm:p-8"><div className="mb-4 flex justify-end"><button ref={closeButtonRef} type="button" onClick={() => setSummaryOpen(false)} aria-label="Cerrar resumen" className="grid size-9 place-items-center rounded-full border border-white/10 text-xl text-zinc-400 hover:text-white">×</button></div><div id="donation-summary-title"><DonationSummary participant={participant} donorName={donorName.trim()} anonymous={anonymous} impactUnits={impactUnits} total={total} onEdit={() => setSummaryOpen(false)} /></div></div></div>}
  </>;
}
