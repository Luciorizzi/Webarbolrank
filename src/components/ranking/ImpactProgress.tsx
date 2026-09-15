import { formatImpactKg } from "@/config/finance";
import { getMilestoneProgress } from "@/lib/impact";

export function ImpactProgress({ impactUnits, compact = false, showMilestoneNames = true }: { impactUnits: number; compact?: boolean; showMilestoneNames?: boolean }) {
  const progress = getMilestoneProgress(impactUnits);
  const target = progress.nextMilestone ?? progress.previousMilestone;

  if (!target) return null;

  return (
    <div className={compact ? "mt-4" : "mt-8"}>
      <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2 text-xs">
        {(showMilestoneNames || progress.nextMilestone) && <span className="min-w-0 font-medium uppercase tracking-[0.12em] text-zinc-500">
          {showMilestoneNames ? (progress.nextMilestone ? `Próximo logro · ${progress.nextMilestone.name}` : `Máximo logro · ${target.name}`) : "Progreso"}
        </span>}
        <span className="ml-auto shrink-0 text-right text-zinc-300">
          {progress.nextMilestone
            ? `${formatImpactKg(progress.currentKg)} / ${formatImpactKg(target.threshold)}`
            : `${formatImpactKg(target.threshold)}+`}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-label={showMilestoneNames ? `Progreso hacia ${target.name}` : "Progreso de impacto"}
        aria-valuemin={progress.previousMilestone?.threshold ?? 0}
        aria-valuemax={target.threshold}
        aria-valuenow={Math.min(progress.currentKg, target.threshold)}
      >
        <div className="impact-progress-fill h-full origin-left rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${progress.progressPercent}%` }} />
      </div>
      {!compact && <p className="mt-3 text-sm text-zinc-400">{progress.nextMilestone ? `Faltan ${formatImpactKg(progress.remainingKg)} para el próximo logro.` : "Completó todos los logros actuales."}</p>}
    </div>
  );
}
