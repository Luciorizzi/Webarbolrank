import type { RankingParticipant } from "@/types/ranking";

export function calculateTreesToNextPosition(
  participant: RankingParticipant,
  ranking: RankingParticipant[],
): number | null {
  if (participant.position === 1) return null;

  const nextParticipant = ranking.find(
    (candidate) => candidate.position === participant.position - 1,
  );

  return nextParticipant
    ? Math.max(nextParticipant.treesFunded - participant.treesFunded + 1, 0)
    : null;
}
