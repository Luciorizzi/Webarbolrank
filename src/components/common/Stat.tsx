export function Stat({ value, label }: { value: string; label: string }) {
  return <div><p className="font-display text-2xl font-bold text-white sm:text-3xl">{value}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p></div>;
}
