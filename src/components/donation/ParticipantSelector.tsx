import type { RankingParticipant } from "@/types/ranking";

export function ParticipantSelector({ participants, value, onChange }: { participants: RankingParticipant[]; value: RankingParticipant | null; onChange: (participant: RankingParticipant | null) => void }) {
  return <label className="block"><span className="mb-2 block text-xs uppercase tracking-[0.15em] text-zinc-500">Participante</span><select value={value?.slug ?? ""} onChange={(event) => onChange(participants.find((item) => item.slug === event.target.value) ?? null)} className="w-full rounded-xl border border-white/10 bg-[#0a100d] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"><option value="">Donación general</option>{participants.map((participant) => <option key={participant.id} value={participant.slug}>{participant.name}</option>)}</select></label>;
}
