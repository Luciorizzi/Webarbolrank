import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { DataConfigurationError } from "@/components/common/DataConfigurationError";
import { getCampaigns } from "@/lib/data/campaigns";
import { loadData } from "@/lib/data/result";
export const dynamic = "force-dynamic";
export default async function Page() {
  const result = await loadData(getCampaigns());
  if (result.data === undefined) return <DataConfigurationError message={result.error} />;
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="eyebrow">Transparencia operativa</p>
      <h1 className="mt-3 font-display text-5xl font-black uppercase text-white sm:text-6xl">
        Novedades
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
        Seguimiento transparente de campañas, compras y entregas de alimento a
        refugios y organizaciones.
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {result.data.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </main>
  );
}
