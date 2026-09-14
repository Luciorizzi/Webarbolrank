import { IMPACT_MILESTONES, type ImpactMilestone } from "@/config/milestones";
import { normalizeImpactUnits } from "@/config/finance";

export interface ImpactProgress {
  currentKg: number;
  earned: readonly ImpactMilestone[];
  previousMilestone: ImpactMilestone | null;
  nextMilestone: ImpactMilestone | null;
  remainingKg: number;
  progressPercent: number;
}

export function getMilestoneProgress(value: unknown): ImpactProgress {
  const currentKg = normalizeImpactUnits(value);
  const earned = IMPACT_MILESTONES.filter((milestone) => currentKg >= milestone.threshold);
  const previousMilestone = earned.at(-1) ?? null;
  const nextMilestone = IMPACT_MILESTONES.find((milestone) => currentKg < milestone.threshold) ?? null;
  const progressStart = previousMilestone?.threshold ?? 0;
  const range = nextMilestone ? nextMilestone.threshold - progressStart : 0;
  const progressPercent = nextMilestone && range > 0
    ? Math.min(100, Math.max(0, ((currentKg - progressStart) / range) * 100))
    : 100;

  return {
    currentKg,
    earned,
    previousMilestone,
    nextMilestone,
    remainingKg: nextMilestone ? Math.max(0, nextMilestone.threshold - currentKg) : 0,
    progressPercent,
  };
}

export function formatMilestoneBadge(threshold: number): string {
  if (threshold < 1_000) return `${threshold} KG`;
  const thousands = threshold / 1_000;
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K KG`;
}
