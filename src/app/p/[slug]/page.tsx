import Link from "next/link";
import { notFound } from "next/navigation";
import { DataConfigurationError } from "@/components/common/DataConfigurationError";
import { RecentDonations } from "@/components/donation/RecentDonations";
import { TopDonors } from "@/components/donation/TopDonors";
import { ImpactProgress } from "@/components/ranking/ImpactProgress";
import { formatImpactKg } from "@/config/finance";
import { getRecentDonations, getTopDonors } from "@/lib/data/donations";
import { getParticipantBySlug, getParticipants } from "@/lib/data/participants";
import { loadData } from "@/lib/data/result";
import { calculateUnitsToNextPosition } from "@/lib/ranking";
import { getImpactProgress } from "@/lib/impact";
const nf = new Intl.NumberFormat("es-AR");
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadData(
    Promise.all([
      getParticipantBySlug(slug),
      getParticipants(),
      getRecentDonations(slug),
      getTopDonors(slug),
    ]),
  );
  if (result.data === undefined) return <DataConfigurationError message={result.error} />;
  const [participant, participants, participantDonations, topDonors] =
    result.data;
  if (!participant) notFound();
  const gap = calculateUnitsToNextPosition(participant, participants);
  const previous = participants.find(
    (item) => item.position === participant.position - 1,
  );
  const progress = getImpactProgress(participant.impactUnits);
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <section className="grid gap-8 rounded-[2rem] border border-white/9 bg-white/[0.03] p-6 sm:p-10 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div
          className="grid size-24 place-items-center rounded-3xl border border-amber-400/20 bg-amber-400/10 text-2xl font-bold text-amber-300"
          aria-label={`Avatar de ${participant.name}`}
        >
          {participant.initials}
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            #{participant.position} del ranking · {participant.category}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white sm:text-6xl">
            {participant.name}{" "}
            {participant.verified && <span className="text-sky-400">✓</span>}
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            {participant.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            <p>
              <strong className="text-2xl text-white">
                {formatImpactKg(participant.impactUnits)}
              </strong>
              <br />
              <span className="text-xs text-zinc-500">de alimento aportados</span>
            </p>
            <p>
              <strong className="text-2xl text-white">
                {nf.format(participant.contributors)}
              </strong>
              <br />
              <span className="text-xs text-zinc-500">
                aportes contabilizados
              </span>
            </p>
            <p>
              <strong className="text-2xl text-amber-300">
                +{formatImpactKg(participant.recentImpactUnits)}
              </strong>
              <br />
              <span className="text-xs text-zinc-500">últimos 7 días</span>
            </p>
          </div>
          <p className="mt-5 text-sm text-zinc-300">
            {gap === null
              ? "Lidera el ranking."
              : `Faltan ${formatImpactKg(gap)} para superar a ${previous?.name}.`}
          </p>
          <ImpactProgress impactUnits={participant.impactUnits} />
        </div>
        <Link
          href={`/?participant=${participant.slug}#donar`}
          className="rounded-full bg-amber-400 px-5 py-4 text-center text-xs font-bold uppercase text-amber-950"
        >
          Alimentar por {participant.name.split(" ")[0]}
        </Link>
      </section>
      <section className="mt-8 rounded-3xl border border-white/9 bg-white/[0.025] p-6 sm:p-8">
        <p className="eyebrow">Logros</p>
        <h2 className="mt-3 font-display text-2xl font-bold uppercase text-white">Historial de impacto</h2>
        {progress.earned.length ? <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{progress.earned.map((milestone) => <li key={milestone.id} className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.045] p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">{formatImpactKg(milestone.threshold)}</p><h3 className="mt-2 font-bold text-white">{milestone.name}</h3><p className="mt-1 text-sm leading-6 text-zinc-500">{milestone.description}</p></li>)}</ul> : <p className="mt-5 text-sm text-zinc-500">Su primer logro se desbloquea al alcanzar 100 kg aportados.</p>}
      </section>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <RecentDonations
          donations={participantDonations}
          participants={participants}
        />
        <TopDonors donors={topDonors} />
      </div>
    </main>
  );
}
