"use client";
import { useMemo, useState } from "react";
import type { ParticipantCategory, RankingEntry, RankingPeriod } from "@/types/ranking";
import { RankingList } from "./RankingList";
import { RankingTabs } from "./RankingTabs";

type Filter = "Todos" | ParticipantCategory;
const filters: Filter[] = ["Todos", "Streamer", "Creador", "Comunidad"];
export function RankingExplorer({ rankings }: { rankings: Record<RankingPeriod, RankingEntry[]> }) { const [period, setPeriod] = useState<RankingPeriod>("historical"); const [filter, setFilter] = useState<Filter>("Todos"); const entries = useMemo(() => rankings[period].filter((item) => filter === "Todos" || item.category === filter), [rankings, period, filter]); return <><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><RankingTabs value={period} onChange={setPeriod} /><div className="flex max-w-full gap-2 overflow-x-auto pb-1">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`shrink-0 rounded-full border px-3 py-2 text-xs ${filter === item ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-white/10 text-zinc-500"}`}>{item === "Streamer" ? "Streamers" : item === "Creador" ? "Creadores" : item === "Comunidad" ? "Comunidades" : item}</button>)}</div></div><p className="my-6 text-sm text-zinc-500">{entries.length} {entries.length === 1 ? "participante" : "participantes"}</p><RankingList participants={entries} /></>; }
