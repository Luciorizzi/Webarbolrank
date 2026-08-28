import type { RankingParticipant } from "@/types/ranking";
import { RankingCard } from "./RankingCard";

export function RankingList({ participants, onSelect }: { participants: RankingParticipant[]; onSelect?: (participant: RankingParticipant) => void }) {
  return <div className="space-y-3">{participants.map((participant) => <RankingCard key={participant.id} participant={participant} ranking={participants} onSelect={onSelect} />)}</div>;
}
