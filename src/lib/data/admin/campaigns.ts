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
  return { campaign: data, updates: updates.data ?? [], evidence: evidence.data ?? [] };
}

