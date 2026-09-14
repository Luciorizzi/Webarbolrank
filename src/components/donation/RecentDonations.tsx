import { formatImpactKg } from "@/config/finance";
import type { Donation } from "@/types/donation";
import type { Participant } from "@/types/ranking";

export function RecentDonations({ donations, participants }: { donations: Donation[]; participants: Participant[] }) {
  return <section><p className="eyebrow">Actividad</p><h2 className="mt-3 font-display text-2xl font-bold uppercase text-white">Últimas donaciones</h2><div className="mt-5 divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.025] px-5">{donations.slice(0, 5).map((donation) => { const participant = donation.participantSlug ? participants.find((item) => item.slug === donation.participantSlug) : undefined; const donor = donation.anonymous ? "Anónimo" : donation.donorName ?? "Donante"; return <p key={donation.id} className="py-4 text-sm leading-6 text-zinc-300"><span className="font-medium text-white">{donor}</span> aportó <strong className="text-amber-300">{formatImpactKg(donation.impactUnits)}</strong>{participant ? ` por ${participant.name}` : ""}</p>; })}{donations.length === 0 && <p className="py-5 text-sm text-zinc-500">Todavía no hay aportes confirmados.</p>}</div></section>;
}
