import "server-only";
import { getAdminDb } from "./shared";

export async function getAdminCampaigns() {
  const db = await getAdminDb();
  const { data, error } = await db.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("No se pudieron cargar las campañas.");
  return data ?? [];
}
export async function getAdminCampaign(id: string) {
  const db = await getAdminDb();
  const [{ data, error }, updates, evidence] = await Promise.all([
    db.from("campaigns").select("*").eq("id", id).maybeSingle(),
    db.from("campaign_updates").select("*").eq("campaign_id", id).order("event_date", { ascending: false }),
    db.from("campaign_evidence").select("*").eq("campaign_id", id).order("evidence_date", { ascending: false }),
  ]);
  if (error || updates.error || evidence.error) throw new Error("No se pudo cargar la campaña.");
  const evidenceRows = evidence.data ?? [];
  const images = evidenceRows.length
    ? await db.from("campaign_evidence_images").select("*").in("evidence_id", evidenceRows.map((item) => item.id)).order("sort_order")
    : { data: [], error: null };
  if (images.error) throw new Error("No se pudieron cargar las imágenes de evidencia.");
  const byEvidence = new Map<string, typeof images.data>();
  for (const image of images.data ?? []) byEvidence.set(image.evidence_id, [...(byEvidence.get(image.evidence_id) ?? []), image]);
  return { campaign: data, updates: updates.data ?? [], evidence: evidenceRows.map((item) => ({ ...item, images: byEvidence.get(item.id) ?? [] })) };
}
