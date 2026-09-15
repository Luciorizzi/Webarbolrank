import type { CampaignStatusDb, EvidenceType } from "@/types/database";

export function text(form: FormData, key: string, required = false, max = 4000) {
  const value = String(form.get(key) ?? "").trim();
  if (required && !value) throw new Error(`${key}: campo requerido.`);
  if (value.length > max) throw new Error(`${key}: demasiado largo.`);
  return value || null;
}
export function slugValue(form: FormData) {
  const raw = text(form, "slug", true, 100)!;
  const value = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new Error("slug: formato inválido.");
  return value;
}
export function uuid(value: string, field = "id") {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new Error(`${field}: UUID inválido.`);
  return value;
}
export function nullablePostgresUuid(form: FormData, key: string, field: string) {
  const raw = form.get(key);
  if (raw === null) return null;
  const value = String(raw).trim();
  if (!value) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error(`${field}: UUID inválido.`);
  return value;
}
export function bool(form: FormData, key: string) { return form.get(key) === "on" || form.get(key) === "true"; }
export function integer(form: FormData, key: string, nullable = true) {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw && nullable) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${key}: debe ser un entero positivo.`);
  return value;
}
export function dateValue(form: FormData, key: string) {
  const value = text(form, key);
  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${key}: fecha inválida.`);
  return value;
}
export function urlValue(form: FormData, key: string) {
  const value = text(form, key, false, 1000);
  if (!value) return null;
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`${key}: URL inválida.`);
  return value;
}
export function campaignStatus(value: string): CampaignStatusDb {
  if (!["fundraising", "goal_reached", "scheduled", "completed"].includes(value)) throw new Error("status: valor inválido.");
  return value as CampaignStatusDb;
}
export function validateCampaignDeliveryDate(status: CampaignStatusDb, deliveryDate: string | null) {
  if (status === "completed" && !deliveryDate) throw new Error("Debés indicar la fecha de entrega para completar la campaña.");
  return deliveryDate;
}
export function evidenceType(value: string): EvidenceType {
  if (!["photo", "receipt", "document", "external_link"].includes(value)) throw new Error("type: valor inválido.");
  return value as EvidenceType;
}
