"use client";

import Link from "next/link";
import { formatImpactKg } from "@/config/finance";
import { calculateUnitsToNextPosition } from "@/lib/ranking";
import type { RankingParticipant } from "@/types/ranking";
import { ImpactProgress } from "./ImpactProgress";

const numberFormatter = new Intl.NumberFormat("es-AR");

interface RankingCardProps { participant: RankingParticipant; ranking: RankingParticipant[]; onSelect?: (participant: RankingParticipant) => void; }

export function RankingCard({ participant, ranking, onSelect }: RankingCardProps) {
  const unitsToNext = calculateUnitsToNextPosition(participant, ranking);
  return (
    <article className={`group relative grid min-w-0 gap-5 overflow-hidden rounded-3xl border p-5 transition sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6 ${participant.position === 1 ? "border-amber-400/35 bg-amber-400/[0.07]" : "border-white/9 bg-white/[0.035] hover:border-white/16"}`}>
      <div className="flex items-center gap-4">
        <span className="w-8 font-display text-xl font-bold text-zinc-500">#{participant.position}</span>
        <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300/20 to-orange-400/5 font-display font-bold text-amber-300">{participant.initials}</div>
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2"><h3 className="font-display text-lg font-bold uppercase tracking-tight text-white">{participant.name}</h3>{participant.verified && <span className="grid size-4 place-items-center rounded-full bg-sky-400 text-[10px] font-bold text-sky-950" title="Verificado">✓</span>}</div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{participant.category}</p>
        <p className="text-2xl font-bold text-white">{formatImpactKg(participant.impactUnits)} <span className="text-sm font-normal text-zinc-400">aportados</span></p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500"><span>{numberFormatter.format(participant.contributors)} personas contribuyeron</span><span className="text-amber-400">+{formatImpactKg(participant.recentImpactUnits)} esta semana</span></div>
        <p className="mt-3 text-sm text-zinc-300">{unitsToNext === null ? "Lidera el ranking" : `Faltan ${formatImpactKg(unitsToNext)} para superar al #${participant.position - 1}`}</p>
        <ImpactProgress impactUnits={participant.impactUnits} compact showMilestoneNames={false} />
      </div>
      {onSelect ? <button type="button" onClick={() => onSelect(participant)} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-400 hover:text-amber-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">Alimentar por {participant.name.split(" ")[0]}</button> : <Link href={`/?participant=${participant.slug}#donar`} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-400 hover:text-amber-950">Alimentar por {participant.name.split(" ")[0]}</Link>}
    </article>
  );
}
