import type { RankingParticipant } from "@/types/ranking";
import { RankingCard } from "./RankingCard";

export function RankingList({ participants, onSelect }: { participants: RankingParticipant[]; onSelect?: (participant: RankingParticipant) => void }) {
  if (participants.length === 0) {
    return <p className="rounded-2xl border border-white/8 bg-white/[0.025] p-6 text-sm text-zinc-500">Todavía no hay participantes para mostrar.</p>;
  }
  return <div className="space-y-3">{participants.map((participant) => <RankingCard key={participant.id} participant={participant} ranking={participants} onSelect={onSelect} />)}</div>;
}
