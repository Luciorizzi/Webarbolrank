import "server-only";
import { getAdminDb } from "./shared";

export async function getAdminParticipants() {
  const db = await getAdminDb();
  const [{ data, error }, { data: categories }, { data: ranking }] = await Promise.all([
    db.from("participants").select("*").order("created_at", { ascending: false }),
    db.from("categories").select("*").order("name"),
    db.rpc("get_ranking", { ranking_period: "historical" }),
  ]);
  if (error) throw new Error("No se pudieron cargar los participantes.");
  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const kgMap = new Map((ranking ?? []).map((r) => [r.participant_id, Number(r.total_impact_units)]));
  return { participants: (data ?? []).map((p) => ({ ...p, category: p.category_id ? categoryMap.get(p.category_id) ?? "—" : "—", approvedKg: kgMap.get(p.id) ?? 0 })), categories: categories ?? [] };
}

export async function getAdminParticipant(id: string) {
  const db = await getAdminDb();
  const [{ data, error }, { data: categories }] = await Promise.all([db.from("participants").select("*").eq("id", id).maybeSingle(), db.from("categories").select("*").order("name")]);
  if (error) throw new Error("No se pudo cargar el participante.");
  return { participant: data, categories: categories ?? [] };
}

