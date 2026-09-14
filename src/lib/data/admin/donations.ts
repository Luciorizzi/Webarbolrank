import "server-only";
import type { DonationStatus } from "@/types/database";
import { getAdminDb } from "./shared";

export type DonationFilters = { page?: number; status?: string; participant?: string; anonymous?: string; date?: string; search?: string };
export async function getAdminDonations(filters: DonationFilters) {
  const db = await getAdminDb();
  const page = Math.max(1, Number(filters.page) || 1), from = (page - 1) * 50;
  let query = db.from("donations").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, from + 49);
  if (["pending", "approved", "rejected", "refunded"].includes(filters.status ?? "")) query = query.eq("status", filters.status as DonationStatus);
  if (filters.participant) query = query.eq("participant_id", filters.participant);
  if (filters.anonymous === "true" || filters.anonymous === "false") query = query.eq("anonymous", filters.anonymous === "true");
  if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) query = query.gte("created_at", `${filters.date}T00:00:00`).lt("created_at", `${filters.date}T23:59:59.999`);
  if (filters.search) {
    const search = filters.search.trim();
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(search)) throw new Error("La búsqueda contiene caracteres inválidos.");
    const clauses = [`payment_reference.eq.${search}`, `preference_id.eq.${search}`];
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(search)) clauses.unshift(`id.eq.${search}`);
    query = query.or(clauses.join(","));
  }
  const [{ data, error, count }, { data: participants }] = await Promise.all([query, db.from("participants").select("id,name").order("name")]);
  if (error) throw new Error("No se pudieron cargar las donaciones.");
  const rows = data ?? [], participantMap = new Map((participants ?? []).map((p) => [p.id, p.name]));
  const donorIds = [...new Set(rows.map((d) => d.donor_id).filter(Boolean))] as string[];
  const { data: donors } = donorIds.length ? await db.from("donors").select("id,display_name").in("id", donorIds) : { data: [] };
  const donorMap = new Map((donors ?? []).map((d) => [d.id, d.display_name]));
  return { rows: rows.map((d) => ({ ...d, donor: d.anonymous ? "Anónimo" : (d.donor_id ? donorMap.get(d.donor_id) : null) ?? "—", participant: d.participant_id ? participantMap.get(d.participant_id) ?? "—" : "General" })), participants: participants ?? [], count: count ?? 0, page, pages: Math.max(1, Math.ceil((count ?? 0) / 50)) };
}
export async function getAdminDonation(id: string) {
  const db = await getAdminDb();
  const { data, error } = await db.from("donations").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const [{ data: donor }, { data: participant }] = await Promise.all([data.donor_id ? db.from("donors").select("display_name").eq("id", data.donor_id).maybeSingle() : Promise.resolve({ data: null }), data.participant_id ? db.from("participants").select("name").eq("id", data.participant_id).maybeSingle() : Promise.resolve({ data: null })]);
  return { ...data, donor: data.anonymous ? "Anónimo" : donor?.display_name ?? "—", participant: participant?.name ?? "General" };
}
