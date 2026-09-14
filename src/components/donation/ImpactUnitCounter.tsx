import { DONATION_UNIT_PRESETS, formatImpactKg, KG_PER_DONATION_UNIT, MAX_IMPACT_KG } from "@/config/finance";

export const MAX_IMPACT_UNITS = MAX_IMPACT_KG;
const presets = DONATION_UNIT_PRESETS.map((units) => units * KG_PER_DONATION_UNIT);

interface ImpactUnitCounterProps { value: number; onChange: (value: number) => void; }

export function ImpactUnitCounter({ value, onChange }: ImpactUnitCounterProps) {
  return (
    <div aria-label="Kilogramos de alimento a aportar">
      <div className="flex items-center gap-4">
      <button type="button" onClick={() => onChange(Math.max(KG_PER_DONATION_UNIT, value - KG_PER_DONATION_UNIT))} disabled={value === KG_PER_DONATION_UNIT} aria-label="Quitar un kilogramo" className="grid size-12 place-items-center rounded-full border border-white/12 text-xl text-white transition hover:border-amber-400/50 disabled:cursor-not-allowed disabled:opacity-30">−</button>
      <input aria-label="Kilogramos" type="number" inputMode="numeric" min={KG_PER_DONATION_UNIT} step={KG_PER_DONATION_UNIT} max={MAX_IMPACT_UNITS} value={value} onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next) && Number.isInteger(next) && next >= KG_PER_DONATION_UNIT && next % KG_PER_DONATION_UNIT === 0) onChange(Math.min(MAX_IMPACT_UNITS, next)); }} className="h-12 w-20 rounded-xl border border-white/10 bg-transparent text-center font-display text-2xl font-bold text-white outline-none focus:border-amber-400" />
      <button type="button" onClick={() => onChange(Math.min(MAX_IMPACT_UNITS, value + KG_PER_DONATION_UNIT))} disabled={value === MAX_IMPACT_UNITS} aria-label="Agregar un kilogramo" className="grid size-12 place-items-center rounded-full border border-white/12 text-xl text-white transition hover:border-amber-400/50 disabled:opacity-30">+</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Cantidades rápidas">{presets.map((preset) => <button type="button" key={preset} onClick={() => onChange(preset)} aria-pressed={value === preset} className={`rounded-full border px-3 py-1 text-xs ${value === preset ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 text-zinc-500 hover:text-white"}`}>{formatImpactKg(preset)}</button>)}</div>
    </div>
  );
}
