import type { DonorRankingEntry } from "@/types/donation";

export function TopDonors({ donors }: { donors: DonorRankingEntry[] }) {
  return <section><p className="eyebrow">Comunidad</p><h2 className="mt-3 font-display text-2xl font-bold uppercase text-white">Top donantes</h2><ol className="mt-5 divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.025] px-5">{donors.map((donor, index) => <li key={donor.donorName} className="flex justify-between gap-4 py-4"><span className="text-zinc-300">#{index + 1} {donor.donorName}</span><strong className="text-white">{donor.trees} árboles</strong></li>)}</ol></section>;
}
