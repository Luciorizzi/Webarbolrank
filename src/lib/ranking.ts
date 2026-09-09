import type { RankingParticipant } from "@/types/ranking";
import { KG_PER_DONATION_UNIT } from "@/config/finance";

export function calculateUnitsToNextPosition(
  participant: RankingParticipant,
  ranking: RankingParticipant[],
): number | null {
  if (participant.position === 1) return null;

  const nextParticipant = ranking.find(
    (candidate) => candidate.position === participant.position - 1,
  );

  return nextParticipant
    ? Math.max(nextParticipant.impactUnits - participant.impactUnits + KG_PER_DONATION_UNIT, 0)
    : null;
}
