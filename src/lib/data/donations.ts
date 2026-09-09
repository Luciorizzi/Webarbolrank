import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError } from "./errors";
import type { Donation, DonorRankingEntry } from "@/types/donation";

function safeImpact(value: unknown, context: string): number {
  const impact = Number(value);
  if (Number.isFinite(impact) && impact >= 0) return impact;
  console.error("Valor de impacto inválido:", { context, value });
  return 0;
}

export async function getRecentDonations(participantSlug: string | null = null, limit = 5): Promise<Donation[]> {
  const { data, error } = await createServerSupabaseClient().rpc("get_recent_donations", { filter_participant_slug: participantSlug, result_limit: limit });
  if (error) throw new DataAccessError("las donaciones recientes", error);
  return data.map((row) => ({ id: row.id, donorName: row.donor_name, anonymous: row.anonymous, participantSlug: row.participant_slug, impactUnits: safeImpact(row.impact_units, `donation:${row.id}`), amount: row.amount, createdAt: row.created_at }));
}

export async function getTopDonors(participantSlug: string | null = null, limit = 3): Promise<DonorRankingEntry[]> {
  const { data, error } = await createServerSupabaseClient().rpc("get_top_donors", { filter_participant_slug: participantSlug, result_limit: limit });
  if (error) throw new DataAccessError("el top de donantes", error);
  return data.map((row) => ({ donorName: row.donor_name, impactUnits: safeImpact(row.impact_units, `donor:${row.donor_name}`) }));
}
