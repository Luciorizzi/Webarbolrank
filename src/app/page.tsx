import Link from "next/link";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { DataConfigurationError } from "@/components/common/DataConfigurationError";
import { Stat } from "@/components/common/Stat";
import { HomeExperience } from "@/components/home/HomeExperience";
import { RecentDonations } from "@/components/donation/RecentDonations";
import { TopDonors } from "@/components/donation/TopDonors";
import { getCampaigns } from "@/lib/data/campaigns";
import { getRecentDonations, getTopDonors } from "@/lib/data/donations";
import { getAllRankings } from "@/lib/data/ranking";
import { loadData } from "@/lib/data/result";
import { formatImpactKg } from "@/config/finance";
const numberFormatter = new Intl.NumberFormat("es-AR");
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ participant?: string }>;
}) {
  const { participant: slug } = await searchParams;
  const result = await loadData(
    Promise.all([
      getAllRankings(),
      getCampaigns(),
      getRecentDonations(),
      getTopDonors(),
    ]),
  );
  if (result.data === undefined) return <DataConfigurationError message={result.error} />;
  const [rankings, campaigns, donations, topDonors] = result.data;
  const participants = rankings.historical;
  const initialParticipant = slug
    ? participants.find((participant) => participant.slug === slug)
    : undefined;
  const totalImpactUnits = participants.reduce(
    (total, participant) => total + participant.impactUnits,
    0,
  );
  const totalDonors = participants.reduce(
    (total, participant) => total + participant.contributors,
    0,
  );
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-24 text-center sm:px-8 sm:pt-32">
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-amber-300">
          <span className="size-2 animate-pulse rounded-full bg-amber-400" />
          Ranking de impacto
        </div>
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-black uppercase leading-[0.94] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
          ¿Quién sumó más <span className="text-amber-400">kilos?</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
          Personas, comunidades y empresas compiten por sumar kilos de alimento y generar impacto. Llevá a tu comunidad a la cima mientras ayudamos a refugios y organizaciones de todo el país.
        </p>
        <div className="mx-auto mt-12 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/8 bg-white/[0.025] px-1 py-5">
          <div className="min-w-0 px-2 sm:px-10">
            <Stat value={formatImpactKg(totalImpactUnits)} label="de alimento aportados" />
          </div>
          <div className="min-w-0 px-2 sm:px-10">
            <Stat
              value={numberFormatter.format(totalDonors)}
              label="aportes contabilizados"
            />
          </div>
          <div className="min-w-0 px-2 sm:px-10">
            <Stat value={numberFormatter.format(participants.length)} label="participantes activos" />
          </div>
        </div>
      </section>
      <HomeExperience
        rankings={rankings}
        participants={participants}
        initialParticipant={initialParticipant}
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-20 sm:px-8 md:grid-cols-2">
        <RecentDonations donations={donations} participants={participants} />
        <TopDonors donors={topDonors} />
      </section>
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-9 flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Transparencia operativa</p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-white sm:text-4xl">
              Últimas novedades
            </h2>
          </div>
          <Link
            href="/novedades"
            className="hidden text-sm font-bold text-amber-300 sm:block"
          >
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {campaigns.slice(0, 3).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
        <Link
          href="/novedades"
          className="mt-6 inline-block text-sm font-bold text-amber-300 sm:hidden"
        >
          Ver todas las novedades →
        </Link>
      </section>
      <section className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          <div>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-white">
              Una métrica clara
            </h2>
          </div>
          <div>
            <p className="text-4xl font-black text-amber-400">01</p>
            <h3 className="mt-4 font-bold text-white">Elegís a quién apoyar</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Seleccionás una comunidad o hacés una donación general.
            </p>
          </div>
          <div>
            <p className="text-4xl font-black text-amber-400">02</p>
            <h3 className="mt-4 font-bold text-white">El ranking se mueve</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Cada kilogramo confirmado se suma al total público del participante.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
