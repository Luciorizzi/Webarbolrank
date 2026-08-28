"use client";
import { useState } from "react";
import { DonateWidget } from "@/components/donation/DonateWidget";
import { InteractiveRanking } from "@/components/ranking/InteractiveRanking";
import { rankingParticipants } from "@/data/participants";
import type { RankingParticipant } from "@/types/ranking";

export function HomeExperience({ initialParticipant }: { initialParticipant?: RankingParticipant }) {
  const [participant, setParticipant] = useState<RankingParticipant | null>(initialParticipant ?? null);
  function selectParticipant(selected: RankingParticipant) { setParticipant(selected); window.history.replaceState(null, "", `/?participant=${selected.slug}#donar`); document.getElementById("donar")?.scrollIntoView({ behavior: "smooth" }); }
  return <><section id="ranking" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"><div className="mb-9"><p className="eyebrow">La competencia</p><h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">Ranking</h2><p className="mt-3 text-zinc-500">Elegí el período y apoyá a tu comunidad.</p></div><InteractiveRanking onSelect={selectParticipant} /></section><div className="mx-auto max-w-6xl px-5 sm:px-8"><DonateWidget participants={rankingParticipants} participant={participant} onParticipantChange={setParticipant} /></div></>;
}
