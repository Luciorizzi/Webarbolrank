"use client";
import { useEffect, useRef, useState } from "react";
import { TREE_PRICE } from "@/config/finance";
import { formatARS } from "@/lib/currency";
import { calculateDonationTotal } from "@/lib/donation";
import type { RankingParticipant } from "@/types/ranking";
import { DonationSummary } from "./DonationSummary";
import { ParticipantSelector } from "./ParticipantSelector";
import { TreeCounter } from "./TreeCounter";

export function DonateWidget({ participants, participant, onParticipantChange }: { participants: RankingParticipant[]; participant: RankingParticipant | null; onParticipantChange: (participant: RankingParticipant | null) => void }) {
  const [trees, setTrees] = useState(1);
  const [donorName, setDonorName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [nameError, setNameError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const total = calculateDonationTotal(trees);
  useEffect(() => {
    if (!summaryOpen) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSummaryOpen(false); };
    document.addEventListener("keydown", closeOnEscape); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [summaryOpen]);
  function openSummary() {
    if (!anonymous && !donorName.trim()) { setNameError("Ingresá tu nombre o alias, o elegí donar de forma anónima."); return; }
    setNameError(""); setSummaryOpen(true);
  }
  return <>
    <section id="donar" className="scroll-mt-24 py-20 sm:py-28"><div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/12 via-white/[0.035] to-cyan-400/5 p-6 sm:p-10"><div className="absolute -right-16 -top-20 size-64 rounded-full bg-emerald-400/10 blur-3xl" /><div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
      <div><p className="eyebrow">Tu impacto</p><h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">Plantá árboles</h2><p className="mt-4 max-w-lg text-zinc-400">Podés donar directamente o elegir una comunidad del ranking. Cada aporte suma impacto y competencia.</p><p className="mt-5 text-lg text-white">Cada árbol = <strong className="text-emerald-300">{formatARS(TREE_PRICE)} final</strong></p>{participant && <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4"><p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Estás plantando por</p><p className="mt-1 font-bold uppercase text-white">{participant.name} {participant.verified && <span className="text-sky-400">✓</span>}</p><button type="button" onClick={() => onParticipantChange(null)} className="mt-2 text-xs text-emerald-300 underline underline-offset-4">Cambiar a donación general</button></div>}</div>
      <div className="rounded-3xl border border-white/10 bg-[#0a100d]/80 p-5 shadow-2xl sm:p-8"><ParticipantSelector participants={participants} value={participant} onChange={onParticipantChange} /><label className="mt-5 block"><span className="mb-2 block text-xs uppercase tracking-[0.15em] text-zinc-500">Tu nombre o alias</span><input value={donorName} onChange={(event) => { setDonorName(event.target.value); setNameError(""); }} disabled={anonymous} required={!anonymous} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "donor-name-error" : undefined} className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40" placeholder={anonymous ? "Se mostrará como Anónimo" : "Ej: Lucio"} /></label><label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={anonymous} onChange={(event) => { setAnonymous(event.target.checked); setNameError(""); }} className="size-4 accent-emerald-400" />Donar de forma anónima</label>{nameError && <p id="donor-name-error" role="alert" className="mt-3 text-xs text-red-300">{nameError}</p>}<div className="mt-6"><TreeCounter value={trees} onChange={setTrees} /></div><div className="my-7 border-y border-white/8 py-6"><p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total final</p><p className="mt-1 font-display text-4xl font-bold text-white">{formatARS(total)}</p><p className="mt-2 text-xs text-zinc-500">{trees} {trees === 1 ? "árbol" : "árboles"} · Sin costos adicionales</p></div><button type="button" onClick={openSummary} className="w-full rounded-full bg-emerald-400 px-6 py-4 text-sm font-bold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Continuar</button></div>
    </div></div></section>
    {summaryOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSummaryOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="donation-summary-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#0b110e] p-6 shadow-2xl sm:p-8"><div className="mb-4 flex justify-end"><button ref={closeButtonRef} type="button" onClick={() => setSummaryOpen(false)} aria-label="Cerrar resumen" className="grid size-9 place-items-center rounded-full border border-white/10 text-xl text-zinc-400 hover:text-white">×</button></div><div id="donation-summary-title"><DonationSummary participant={participant} donorName={donorName.trim()} anonymous={anonymous} trees={trees} total={total} onEdit={() => setSummaryOpen(false)} /></div></div></div>}
  </>;
}
