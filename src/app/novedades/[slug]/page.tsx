import { notFound } from "next/navigation";
import { DataConfigurationError } from "@/components/common/DataConfigurationError";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { CampaignTimeline } from "@/components/campaigns/CampaignTimeline";
import { getCampaignBySlug } from "@/lib/data/campaigns";
import { loadData } from "@/lib/data/result";
import { formatARS } from "@/lib/currency";
import { formatImpactKg } from "@/config/finance";
const df = new Intl.DateTimeFormat("es-AR", { timeZone: "UTC" });
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadData(getCampaignBySlug(slug));
  if (result.data === undefined) return <DataConfigurationError message={result.error} />;
  const campaign = result.data;
  if (!campaign) notFound();
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <CampaignStatusBadge status={campaign.status} />
      {campaign.isDemo && <p className="mt-4 w-fit rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Datos ficticios de demostración</p>}
      <h1 className="mt-5 max-w-4xl font-display text-5xl font-black uppercase text-white sm:text-7xl">
        {campaign.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
        {campaign.description}
      </p>
      <section className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Ubicación", campaign.location],
          ["Organización", campaign.ngoName],
          ["Meta", formatARS(campaign.goalAmount)],
          ["Recaudado", formatARS(campaign.raisedAmount)],
          [campaign.status === "completed" ? "Alimento entregado" : "Meta de alimento", formatImpactKg(campaign.impactGoal)],
          [
            "Entrega",
            campaign.deliveryDate
              ? df.format(new Date(campaign.deliveryDate))
              : "A confirmar",
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#100d0a] p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {label}
            </p>
            <p className="mt-2 font-bold text-white">{value}</p>
          </div>
        ))}
      </section>
      <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_.7fr]">
        <section>
          <h2 className="mb-8 font-display text-3xl font-bold uppercase text-white">
            Cronología
          </h2>
          <CampaignTimeline updates={campaign.updates} />
        </section>
        <section>
          <h2 className="font-display text-3xl font-bold uppercase text-white">
            Evidencia
          </h2>
          {campaign.evidence.length ? (
            <ul className="mt-6 space-y-3">
              {campaign.evidence.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm text-zinc-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-zinc-500">
              La campaña sigue abierta. La evidencia se publicará con cada
              actualización.
            </p>
          )}
          <p className="mt-5 text-xs text-zinc-600">
            Datos publicados desde la campaña.
          </p>
        </section>
      </div>
    </main>
  );
}
