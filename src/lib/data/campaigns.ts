import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError } from "./errors";
import type { Campaign } from "@/types/campaign";
import type { Database } from "@/types/database";

type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];
type UpdateRow = Database["public"]["Tables"]["campaign_updates"]["Row"];
type EvidenceRow = Database["public"]["Tables"]["campaign_evidence"]["Row"];
type EvidenceImageRow = Database["public"]["Tables"]["campaign_evidence_images"]["Row"];
type EvidenceWithImages = EvidenceRow & { campaign_evidence_images: EvidenceImageRow[] };
type CampaignWithRelations = CampaignRow & { campaign_updates: UpdateRow[]; campaign_evidence: EvidenceWithImages[] };

function mapCampaign(row: CampaignWithRelations): Campaign {
  const safeNumber = (value: unknown, field: string) => {
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) return number;
    console.error(`Valor inválido en campaigns.${field}:`, { campaignId: row.id, value });
    return 0;
  };
  return {
    id: row.id, slug: row.slug, title: row.title, location: row.location ?? "Ubicación a confirmar",
    ngoName: row.ngo_name ?? "Organización a confirmar", goalAmount: safeNumber(row.goal_amount, "goal_amount"),
    raisedAmount: safeNumber(row.raised_amount, "raised_amount"), impactGoal: safeNumber(row.impact_goal, "impact_goal"), status: row.status,
    activityDate: row.activity_date ?? undefined, deliveryDate: row.delivery_date ?? undefined, excerpt: row.excerpt ?? "Actualización de campaña.",
    description: row.description ?? row.excerpt ?? "Información de campaña.", coverImageUrl: row.cover_image_url ?? undefined, publishedAt: row.published_at ?? row.created_at,
    updates: row.campaign_updates.sort((a, b) => a.event_date.localeCompare(b.event_date)).map((update) => ({ id: update.id, campaignId: update.campaign_id, date: update.event_date, title: update.title, content: update.content ?? "" })),
    evidence: row.campaign_evidence.map((evidence) => {
      const related = [...(evidence.campaign_evidence_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((image) => ({ id: image.id, url: image.image_url, sortOrder: image.sort_order }));
      const images = related.length ? related : evidence.type === "photo" && evidence.url ? [{ id: `legacy-${evidence.id}`, url: evidence.url, sortOrder: 0 }] : [];
      return { id: evidence.id, type: evidence.type, label: evidence.label, url: evidence.url ?? undefined, date: evidence.evidence_date ?? undefined, images };
    }),
    isDemo: row.ngo_name?.toLocaleLowerCase("es").includes("dato ficticio de desarrollo") ?? false,
  };
}

const campaignSelect = "*, campaign_updates(*), campaign_evidence(*, campaign_evidence_images(*))";

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await createServerSupabaseClient().from("campaigns").select(campaignSelect).order("published_at", { ascending: false });
  if (error) throw new DataAccessError("las campañas", error);
  return (data as unknown as CampaignWithRelations[]).map(mapCampaign);
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const { data, error } = await createServerSupabaseClient().from("campaigns").select(campaignSelect).eq("slug", slug).maybeSingle();
  if (error) throw new DataAccessError("la campaña", error);
  return data ? mapCampaign(data as unknown as CampaignWithRelations) : null;
}
