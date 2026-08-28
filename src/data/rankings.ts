import { rankingParticipants } from "./participants";
import type { RankingEntry, RankingPeriod } from "@/types/ranking";

const periodTrees: Record<RankingPeriod, Record<string, number>> = {
  historical: { spreen: 12_482, davo: 12_351, coscu: 10_221, momo: 8_904, luquitas: 7_610 },
  month: { davo: 1_840, spreen: 1_702, momo: 1_260, coscu: 1_105, luquitas: 910 },
  today: { coscu: 184, davo: 161, spreen: 147, luquitas: 96, momo: 72 },
};

export const rankings: Record<RankingPeriod, RankingEntry[]> = Object.fromEntries(
  Object.entries(periodTrees).map(([period, trees]) => [period, Object.entries(trees).map(([id, treesFunded], index) => {
    const participant = rankingParticipants.find((item) => item.id === id);
    if (!participant) throw new Error(`Participante inexistente: ${id}`);
    return { ...participant, position: index + 1, treesFunded };
  })]),
) as Record<RankingPeriod, RankingEntry[]>;
