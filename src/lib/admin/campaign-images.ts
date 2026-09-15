import "server-only";
import { randomUUID } from "node:crypto";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const CAMPAIGN_IMAGES_BUCKET = "campaign-images";
export const MAX_CAMPAIGN_IMAGE_BYTES = 5 * 1024 * 1024;
export const CAMPAIGN_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const extensions: Record<(typeof CAMPAIGN_IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function hasExpectedSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function uploadCampaignImage(file: File, campaignId: string, kind: "cover" | "evidence", evidenceId?: string) {
  if (!CAMPAIGN_IMAGE_TYPES.includes(file.type as (typeof CAMPAIGN_IMAGE_TYPES)[number])) throw new Error("La imagen debe ser JPG, PNG o WEBP.");
  if (file.size === 0) throw new Error("El archivo de imagen está vacío.");
  if (file.size > MAX_CAMPAIGN_IMAGE_BYTES) throw new Error("La imagen no puede superar los 5 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasExpectedSignature(file.type, bytes)) throw new Error("El contenido del archivo no coincide con un formato de imagen permitido.");
  const extension = extensions[file.type as keyof typeof extensions];
  if (kind === "evidence" && !evidenceId) throw new Error("Falta identificar la evidencia de la imagen.");
  const directory = kind === "evidence" ? `campaigns/${campaignId}/evidence/${evidenceId}` : `campaigns/${campaignId}/cover`;
  const path = `${directory}/${randomUUID()}.${extension}`;
  const storage = createServiceRoleSupabaseClient().storage.from(CAMPAIGN_IMAGES_BUCKET);
  const { error } = await storage.upload(path, bytes, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (error) throw new Error("No se pudo subir la imagen.");
  return { path, publicUrl: storage.getPublicUrl(path).data.publicUrl };
}

export async function removeCampaignImageByPath(path: string | null, campaignId: string, kind: "cover" | "evidence") {
  if (!path || path.includes("..") || !path.startsWith(`campaigns/${campaignId}/${kind}/`)) return;
  const { error } = await createServiceRoleSupabaseClient().storage.from(CAMPAIGN_IMAGES_BUCKET).remove([path]);
  if (error) console.error("[Admin] No se pudo eliminar un archivo", { campaignId, kind, path });
}

export function campaignImagePathFromUrl(value: string | null, campaignId: string, kind: "cover" | "evidence") {
  if (!value) return null;
  try {
    const marker = `/storage/v1/object/public/${CAMPAIGN_IMAGES_BUCKET}/`;
    const url = new URL(value);
    const index = url.pathname.indexOf(marker);
    if (index < 0) return null;
    const path = decodeURIComponent(url.pathname.slice(index + marker.length));
    return path.startsWith(`campaigns/${campaignId}/${kind}/`) && !path.includes("..") ? path : null;
  } catch { return null; }
}

export async function removeCampaignImageByUrl(value: string | null, campaignId: string, kind: "cover" | "evidence") {
  const path = campaignImagePathFromUrl(value, campaignId, kind);
  if (!path) return;
  const { error } = await createServiceRoleSupabaseClient().storage.from(CAMPAIGN_IMAGES_BUCKET).remove([path]);
  if (error) console.error("[Admin] No se pudo eliminar un archivo reemplazado", { campaignId, kind, path });
}
