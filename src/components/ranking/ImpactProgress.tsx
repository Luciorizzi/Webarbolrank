import { formatImpactKg } from "@/config/finance";
import { getMilestoneProgress } from "@/lib/impact";

export function ImpactProgress({ impactUnits, compact = false }: { impactUnits: number; compact?: boolean }) {
  const progress = getMilestoneProgress(impactUnits);
  const target = progress.nextMilestone ?? progress.previousMilestone;

  if (!target) return null;

  return (
    <div className={compact ? "mt-4" : "mt-8"}>
      <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2 text-xs">
        <span className="min-w-0 font-medium uppercase tracking-[0.12em] text-zinc-500">
          {progress.nextMilestone ? `Próximo logro · ${progress.nextMilestone.name}` : `Máximo logro · ${target.name}`}
        </span>
        <span className="shrink-0 text-right text-zinc-300">
          {progress.nextMilestone
            ? `${formatImpactKg(progress.currentKg)} / ${formatImpactKg(target.threshold)}`
            : `${formatImpactKg(target.threshold)}+`}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-label={`Progreso hacia ${target.name}`}
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
