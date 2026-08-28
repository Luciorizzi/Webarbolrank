"use client";

import type { RankingPeriod } from "@/types/ranking";

const periods: { value: RankingPeriod; label: string }[] = [
  { value: "historical", label: "Histórico" },
  { value: "month", label: "Este mes" },
  { value: "today", label: "Hoy" },
];

export function RankingTabs({ value, onChange }: { value: RankingPeriod; onChange: (period: RankingPeriod) => void }) {
  return <div className="flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1" aria-label="Período del ranking">{periods.map((period) => <button key={period.value} type="button" aria-pressed={value === period.value} onClick={() => onChange(period.value)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${value === period.value ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"}`}>{period.label}</button>)}</div>;
}
