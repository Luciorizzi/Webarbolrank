import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError } from "./errors";
import type { ParticipantCategory, RankingEntry, RankingPeriod } from "@/types/ranking";

function categoryFromSlug(slug: string | null): ParticipantCategory {
  return slug === "streamers" ? "Streamer" : slug === "creadores" ? "Creador" : slug === "comunidades" ? "Comunidad" : "Empresa";
}

function safeMetric(value: unknown, field: string, participantId: string): number {
  const metric = Number(value);
  if (Number.isFinite(metric) && metric >= 0) return metric;
  console.error(`Valor inválido en ranking.${field}:`, { participantId, value });
  return 0;
}

export async function getRanking(period: RankingPeriod): Promise<RankingEntry[]> {
  const { data, error } = await createServerSupabaseClient().rpc("get_ranking", { ranking_period: period });
  if (error) throw new DataAccessError("el ranking", error);
  return data.map((row) => ({
    id: row.participant_id, slug: row.slug, name: row.name,
    initials: row.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    category: categoryFromSlug(row.category_slug), verified: row.verified,
    description: row.bio ?? "Participante de la comunidad KILO.", position: safeMetric(row.rank_position, "rank_position", row.participant_id),
    impactUnits: safeMetric(row.total_impact_units, "total_impact_units", row.participant_id), contributors: safeMetric(row.donor_count, "donor_count", row.participant_id), recentImpactUnits: safeMetric(row.recent_impact_units, "recent_impact_units", row.participant_id),
  }));
}

export async function getAllRankings(): Promise<Record<RankingPeriod, RankingEntry[]>> {
  const [historical, month, today] = await Promise.all([getRanking("historical"), getRanking("month"), getRanking("today")]);
  return { historical, month, today };
}
