import { IMPACT_MILESTONES, type ImpactMilestone } from "@/config/milestones";
import { normalizeImpactUnits } from "@/config/finance";

export interface ImpactProgress {
  current: number;
  earned: readonly ImpactMilestone[];
  currentMilestone: ImpactMilestone | null;
  nextMilestone: ImpactMilestone | null;
  remaining: number;
  progressPercent: number;
  progressStart: number;
}

export function getImpactProgress(value: unknown): ImpactProgress {
  const current = normalizeImpactUnits(value);
  const earned = IMPACT_MILESTONES.filter((milestone) => current >= milestone.threshold);
  const currentMilestone = earned.at(-1) ?? null;
  const nextMilestone = IMPACT_MILESTONES.find((milestone) => current < milestone.threshold) ?? null;
  const progressStart = currentMilestone?.threshold ?? 0;
  const range = nextMilestone ? nextMilestone.threshold - progressStart : 0;
  const progressPercent = nextMilestone && range > 0
    ? Math.min(100, Math.max(0, ((current - progressStart) / range) * 100))
    : 100;

  return {
    current,
    earned,
    currentMilestone,
    nextMilestone,
    remaining: nextMilestone ? Math.max(0, nextMilestone.threshold - current) : 0,
    progressPercent,
    progressStart,
  };
}
