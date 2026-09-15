import { notFound } from "next/navigation";
import { DataConfigurationError } from "@/components/common/DataConfigurationError";
import { ExpandableImage } from "@/components/images/ExpandableImage";
import { EvidenceGallery } from "@/components/campaigns/EvidenceGallery";
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
      {campaign.coverImageUrl && <ExpandableImage src={campaign.coverImageUrl} alt={`imagen de ${campaign.title}`} className="mt-8 aspect-video w-full rounded-3xl" />}
      <section className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Ubicación", campaign.location],
          ["Organización", campaign.ngoName],
          ["Meta", formatARS(campaign.goalAmount)],
          ["Recaudado", formatARS(campaign.raisedAmount)],
          [campaign.status === "completed" ? "Alimento entregado" : "Meta de alimento", formatImpactKg(campaign.impactGoal)],
          ...(campaign.deliveryDate ? [["Fecha de entrega", df.format(new Date(campaign.deliveryDate))]] : []),
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
          {campaign.evidence.length ? <div className="mt-6 space-y-5">{campaign.evidence.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
              {item.date && <time dateTime={item.date} className="text-xs font-medium uppercase tracking-wider text-zinc-500">{df.format(new Date(item.date))}</time>}
              <p className="mt-2 text-sm leading-6 text-zinc-300">{item.label}</p>
              {item.type === "photo" ? <EvidenceGallery images={item.images} label={item.label} /> : item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-amber-300 hover:text-amber-200">Ver archivo →</a>}
            </article>
          ))}</div> : (
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
