"use client";
import { useState } from "react";
import type { RankingEntry, RankingPeriod, RankingParticipant } from "@/types/ranking";
import { RankingList } from "./RankingList";
import { RankingTabs } from "./RankingTabs";

export function InteractiveRanking({ rankings, onSelect }: { rankings: Record<RankingPeriod, RankingEntry[]>; onSelect?: (participant: RankingParticipant) => void }) {
  const [period, setPeriod] = useState<RankingPeriod>("historical");
  return <><RankingTabs value={period} onChange={setPeriod} /><div className="mt-9"><RankingList participants={rankings[period]} onSelect={onSelect} /></div></>;
}
