export const MAX_TREES = 1_000;
const presets = [1, 5, 10, 20];

interface TreeCounterProps { value: number; onChange: (value: number) => void; }

export function TreeCounter({ value, onChange }: TreeCounterProps) {
  return (
    <div aria-label="Cantidad de árboles">
      <div className="flex items-center gap-4">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value === 1} aria-label="Quitar un árbol" className="grid size-12 place-items-center rounded-full border border-white/12 text-xl text-white transition hover:border-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-30">−</button>
      <input aria-label="Cantidad" type="number" inputMode="numeric" min={1} max={MAX_TREES} value={value} onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next) && Number.isInteger(next) && next >= 1) onChange(Math.min(MAX_TREES, next)); }} className="h-12 w-20 rounded-xl border border-white/10 bg-transparent text-center font-display text-2xl font-bold text-white outline-none focus:border-emerald-400" />
      <button type="button" onClick={() => onChange(Math.min(MAX_TREES, value + 1))} disabled={value === MAX_TREES} aria-label="Agregar un árbol" className="grid size-12 place-items-center rounded-full border border-white/12 text-xl text-white transition hover:border-emerald-400/50 disabled:opacity-30">+</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Cantidades rápidas">{presets.map((preset) => <button type="button" key={preset} onClick={() => onChange(preset)} aria-pressed={value === preset} className={`rounded-full border px-3 py-1 text-xs ${value === preset ? "border-emerald-400 bg-emerald-400/15 text-emerald-300" : "border-white/10 text-zinc-500 hover:text-white"}`}>{preset}</button>)}</div>
    </div>
  );
}
