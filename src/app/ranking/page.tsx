import { RankingExplorer } from "@/components/ranking/RankingExplorer";
import { DataConfigurationError } from "@/components/common/DataConfigurationError";
import { getAllRankings } from "@/lib/data/ranking";
import { loadData } from "@/lib/data/result";
export const dynamic = "force-dynamic";
export default async function RankingPage() {
  const result = await loadData(getAllRankings());
  if (result.data === undefined) return <DataConfigurationError message={result.error} />;
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="eyebrow">Clasificación general</p>
      <h1 className="mb-10 mt-3 font-display text-5xl font-bold uppercase text-white">
        Ranking
      </h1>
      <p className="-mt-6 mb-10 max-w-2xl text-zinc-400">Clasificación por kilogramos de alimento aportados mediante donaciones confirmadas.</p>
      <RankingExplorer rankings={result.data} />
    </main>
  );
}
