import { formatImpactKg } from "@/config/finance";
import type { Donation } from "@/types/donation";
import type { Participant } from "@/types/ranking";

export function RecentDonations({ donations, participants }: { donations: Donation[]; participants: Participant[] }) {
  return <section><p className="eyebrow">Actividad</p><h2 className="mt-3 font-display text-2xl font-bold uppercase text-white">Últimas donaciones</h2><div className="mt-5 divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.025] px-5">{donations.slice(0, 5).map((donation) => { const participant = donation.participantSlug ? participants.find((item) => item.slug === donation.participantSlug) : undefined; return <div key={donation.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium text-zinc-200">{donation.anonymous ? "Anónimo" : donation.donorName}</p><p className="mt-1 text-xs text-zinc-500">{participant ? `por ${participant.name}` : "Donación general"}</p></div><strong className="shrink-0 text-sm text-amber-300">+{formatImpactKg(donation.impactUnits)}</strong></div>; })}</div></section>;
}
