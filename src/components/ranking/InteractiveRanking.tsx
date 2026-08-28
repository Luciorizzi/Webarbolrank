"use client";
import { useState } from "react";
import { rankings } from "@/data/rankings";
import type { RankingPeriod, RankingParticipant } from "@/types/ranking";
import { RankingList } from "./RankingList";
import { RankingTabs } from "./RankingTabs";

export function InteractiveRanking({ onSelect }: { onSelect?: (participant: RankingParticipant) => void }) {
  const [period, setPeriod] = useState<RankingPeriod>("historical");
  return <><RankingTabs value={period} onChange={setPeriod} /><div className="mt-9"><RankingList participants={rankings[period]} onSelect={onSelect} /></div></>;
}
