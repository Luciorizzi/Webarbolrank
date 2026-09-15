"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAuthSupabaseClient } from "@/lib/supabase/auth-server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { calculateCampaignGoalAmount } from "@/config/finance";
import { removeCampaignImageByPath, removeCampaignImageByUrl, uploadCampaignImage } from "@/lib/admin/campaign-images";
import { bool, campaignStatus, dateValue, evidenceType, integer, nullablePostgresUuid, slugValue, text, urlValue, uuid, validateCampaignDeliveryDate } from "@/lib/admin/validation";

const ok = (path: string, message: string) => redirect(`${path}?message=${encodeURIComponent(message)}`);
const fail = (path: string, error: unknown) => redirect(`${path}?error=${encodeURIComponent(error instanceof Error ? error.message : "Error inesperado.")}`);
function audit(userId: string, action: string, entity: string, entityId: string) { console.info("[Admin]", { userId, action, entity, entityId }); }

export async function loginAction(form: FormData) {
  const email = String(form.get("email") ?? "").trim(), password = String(form.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=Completá email y contraseña.");
  const auth = await createAuthSupabaseClient();
  const result = await auth.auth.signInWithPassword({ email, password });
  if (result.error || !result.data.user) redirect("/admin/login?error=Credenciales inválidas.");
  const { data } = await createServiceRoleSupabaseClient().from("admin_users").select("user_id").eq("user_id", result.data.user.id).maybeSingle();
  if (!data) { await auth.auth.signOut(); redirect("/admin/login?error=No tenés permisos de administración."); }
  redirect("/admin");
}
export async function logoutAction() { const auth = await createAuthSupabaseClient(); await auth.auth.signOut(); redirect("/admin/login"); }

function participantPayload(form: FormData) { return { name: text(form, "name", true, 120)!, slug: slugValue(form), category_id: nullablePostgresUuid(form, "category_id", "categoría"), avatar_url: urlValue(form, "avatar_url"), active: bool(form, "active") }; }
export async function createParticipantAction(form: FormData) {
  const admin = await requireAdmin();
  try { const payload = participantPayload(form); const db = createServiceRoleSupabaseClient(); if (payload.category_id && !(await db.from("categories").select("id").eq("id", payload.category_id).maybeSingle()).data) throw new Error("categoría inválida."); const { data, error } = await db.from("participants").insert(payload).select("id").single(); if (error) throw new Error(error.code === "23505" ? "El slug ya existe." : "No se pudo crear el participante."); audit(admin.userId, "create", "participant", data.id); revalidatePath("/admin/participantes"); ok("/admin/participantes", "Participante creado."); } catch (error) { fail("/admin/participantes", error); }
}
export async function updateParticipantAction(id: string, form: FormData) {
  const admin = await requireAdmin(); const safeId = uuid(id);
  try { const payload = participantPayload(form); const db = createServiceRoleSupabaseClient(); if (payload.category_id && !(await db.from("categories").select("id").eq("id", payload.category_id).maybeSingle()).data) throw new Error("categoría inválida."); const { error } = await db.from("participants").update(payload).eq("id", safeId); if (error) throw new Error(error.code === "23505" ? "El slug ya existe." : "No se pudo guardar."); audit(admin.userId, "update", "participant", safeId); revalidatePath("/admin/participantes"); ok(`/admin/participantes/${safeId}`, "Cambios guardados."); } catch (error) { fail(`/admin/participantes/${safeId}`, error); }
}
export async function toggleParticipantAction(id: string, active: boolean) { const admin = await requireAdmin(); const safeId = uuid(id); const { error } = await createServiceRoleSupabaseClient().from("participants").update({ active }).eq("id", safeId); if (error) fail("/admin/participantes", new Error("No se pudo cambiar el estado.")); audit(admin.userId, active ? "activate" : "deactivate", "participant", safeId); revalidatePath("/admin/participantes"); ok("/admin/participantes", active ? "Participante activado." : "Participante desactivado."); }

function campaignPayload(form: FormData) {
  const status = campaignStatus(String(form.get("status") ?? ""));
  const deliveryDate = validateCampaignDeliveryDate(status, dateValue(form, "delivery_date"));
  const impactGoal = integer(form, "impact_goal");
  return { title: text(form, "title", true, 180)!, slug: slugValue(form), ngo_name: text(form, "ngo_name", false, 180), location: text(form, "location", false, 180), impact_goal: impactGoal, goal_amount: calculateCampaignGoalAmount(impactGoal ?? 0), status, delivery_date: deliveryDate, excerpt: text(form, "excerpt", false, 500), description: text(form, "description", true, 10000) };
}
function optionalFile(form: FormData, key: string) { const value = form.get(key); return value instanceof File && value.size > 0 ? value : null; }
export async function createCampaignAction(form: FormData) {
  const admin = await requireAdmin(); const campaignId = randomUUID(); let uploadedUrl: string | null = null;
  try {
    const file = optionalFile(form, "cover_image");
    if (file) uploadedUrl = (await uploadCampaignImage(file, campaignId, "cover")).publicUrl;
    const { data, error } = await createServiceRoleSupabaseClient().from("campaigns").insert({ id: campaignId, ...campaignPayload(form), cover_image_url: uploadedUrl, published_at: bool(form, "published") ? new Date().toISOString() : null }).select("id").single();
    if (error) throw new Error(error.code === "23505" ? "El slug ya existe." : "No se pudo crear la campaña.");
    audit(admin.userId, "create", "campaign", data.id); revalidatePath("/admin/campanas");
  } catch (error) { if (uploadedUrl) await removeCampaignImageByUrl(uploadedUrl, campaignId, "cover"); fail("/admin/campanas", error); }
  ok(`/admin/campanas/${campaignId}`, "Campaña creada.");
}
export async function updateCampaignAction(id: string, form: FormData) {
  const admin = await requireAdmin(); const safeId = uuid(id); let uploadedUrl: string | null = null;
  try {
    const db = createServiceRoleSupabaseClient();
    const { data: current, error: readError } = await db.from("campaigns").select("cover_image_url").eq("id", safeId).single();
    if (readError) throw new Error("No se pudo cargar la imagen actual.");
    const file = optionalFile(form, "cover_image"); const remove = form.get("cover_image_remove") === "true";
    if (file) uploadedUrl = (await uploadCampaignImage(file, safeId, "cover")).publicUrl;
    const nextUrl = uploadedUrl ?? (remove ? null : current.cover_image_url);
    const { error } = await db.from("campaigns").update({ ...campaignPayload(form), cover_image_url: nextUrl }).eq("id", safeId);
    if (error) throw new Error(error.code === "23505" ? "El slug ya existe." : "No se pudo guardar.");
    if (current.cover_image_url && current.cover_image_url !== nextUrl) await removeCampaignImageByUrl(current.cover_image_url, safeId, "cover");
    audit(admin.userId, "update", "campaign", safeId); revalidatePath("/admin/campanas"); revalidatePath("/novedades");
  } catch (error) { if (uploadedUrl) await removeCampaignImageByUrl(uploadedUrl, safeId, "cover"); fail(`/admin/campanas/${safeId}`, error); }
  ok(`/admin/campanas/${safeId}`, "Cambios guardados.");
}
export async function toggleCampaignPublishAction(id: string, publish: boolean) { const admin = await requireAdmin(); const safeId = uuid(id); const { error } = await createServiceRoleSupabaseClient().from("campaigns").update({ published_at: publish ? new Date().toISOString() : null }).eq("id", safeId); if (error) fail("/admin/campanas", new Error("No se pudo cambiar la publicación.")); audit(admin.userId, publish ? "publish" : "unpublish", "campaign", safeId); revalidatePath("/admin/campanas"); ok("/admin/campanas", publish ? "Campaña publicada." : "Campaña despublicada."); }

export async function saveUpdateAction(campaignId: string, updateId: string | null, form: FormData) { const admin = await requireAdmin(); const cid = uuid(campaignId, "campaign_id"); try { const payload = { campaign_id: cid, title: text(form, "title", true, 180)!, content: text(form, "content", false, 5000), event_date: dateValue(form, "event_date") || (() => { throw new Error("event_date: campo requerido."); })() }; const db = createServiceRoleSupabaseClient(); const result = updateId ? await db.from("campaign_updates").update(payload).eq("id", uuid(updateId)).select("id").single() : await db.from("campaign_updates").insert(payload).select("id").single(); if (result.error) throw new Error("No se pudo guardar la actualización."); audit(admin.userId, updateId ? "update" : "create", "campaign_update", result.data.id); revalidatePath(`/admin/campanas/${cid}`); ok(`/admin/campanas/${cid}`, "Actualización guardada."); } catch (error) { fail(`/admin/campanas/${cid}`, error); } }
export async function deleteUpdateAction(campaignId: string, id: string) { const admin = await requireAdmin(); const cid = uuid(campaignId), safeId = uuid(id); const { error } = await createServiceRoleSupabaseClient().from("campaign_updates").delete().eq("id", safeId).eq("campaign_id", cid); if (error) fail(`/admin/campanas/${cid}`, new Error("No se pudo eliminar.")); audit(admin.userId, "delete", "campaign_update", safeId); revalidatePath(`/admin/campanas/${cid}`); ok(`/admin/campanas/${cid}`, "Actualización eliminada."); }
export async function saveEvidenceAction(campaignId: string, evidenceId: string | null, form: FormData) {
  const admin = await requireAdmin(); const cid = uuid(campaignId); const safeEvidenceId = evidenceId ? uuid(evidenceId) : randomUUID(); const creating = !evidenceId;
  const uploaded: { path: string; publicUrl: string }[] = []; let imagesInserted = false;
  try {
    const db = createServiceRoleSupabaseClient();
    const currentResult = creating ? { data: null, error: null } : await db.from("campaign_evidence").select("type,url").eq("id", safeEvidenceId).eq("campaign_id", cid).single();
    if (currentResult.error) throw new Error("No se pudo cargar la evidencia actual.");
    const currentImagesResult = creating ? { data: [], error: null } : await db.from("campaign_evidence_images").select("*").eq("evidence_id", safeEvidenceId).order("sort_order");
    if (currentImagesResult.error) throw new Error("No se pudieron cargar las fotos actuales.");
    let removeIds: string[] = [];
    try { const parsed = JSON.parse(String(form.get("remove_image_ids") ?? "[]")); if (Array.isArray(parsed)) removeIds = parsed.map((id) => uuid(String(id), "image_id")); } catch { throw new Error("La selección de imágenes para eliminar no es válida."); }
    const currentImages = currentImagesResult.data ?? [];
    if (removeIds.some((id) => !currentImages.some((image) => image.id === id))) throw new Error("Una imagen seleccionada no pertenece a esta evidencia.");
    const files = form.getAll("evidence_images").filter((value): value is File => value instanceof File && value.size > 0);
    const type = evidenceType(String(form.get("type") ?? ""));
    const retained = type === "photo" ? currentImages.filter((image) => !removeIds.includes(image.id)) : [];
    if (type === "photo" && retained.length + files.length === 0) throw new Error("Seleccioná al menos una imagen para la evidencia fotográfica.");
    if (retained.length + files.length > 10) throw new Error("Podés guardar hasta 10 imágenes por evidencia.");
    const payload = { campaign_id: cid, type, label: text(form, "label", true, 240)!, url: type === "photo" ? null : urlValue(form, "url"), evidence_date: dateValue(form, "evidence_date") };
    const result = creating ? await db.from("campaign_evidence").insert({ id: safeEvidenceId, ...payload }).select("id").single() : await db.from("campaign_evidence").update(payload).eq("id", safeEvidenceId).eq("campaign_id", cid).select("id").single();
    if (result.error) throw new Error("No se pudo guardar la evidencia.");
    for (const file of files) uploaded.push(await uploadCampaignImage(file, cid, "evidence", safeEvidenceId));
    if (uploaded.length) {
      const startOrder = retained.reduce((maximum, image) => Math.max(maximum, image.sort_order), -1) + 1;
      const { error } = await db.from("campaign_evidence_images").insert(uploaded.map((image, index) => ({ evidence_id: safeEvidenceId, image_url: image.publicUrl, storage_path: image.path, sort_order: startOrder + index })));
      if (error) throw new Error("No se pudieron relacionar las imágenes con la evidencia.");
      imagesInserted = true;
    }
    const imagesToRemove = type === "photo" ? currentImages.filter((image) => removeIds.includes(image.id)) : currentImages;
    if (imagesToRemove.length) {
      const { error } = await db.from("campaign_evidence_images").delete().in("id", imagesToRemove.map((image) => image.id)).eq("evidence_id", safeEvidenceId);
      if (error) throw new Error("No se pudieron eliminar las imágenes seleccionadas.");
      for (const image of imagesToRemove) {
        if (image.storage_path) await removeCampaignImageByPath(image.storage_path, cid, "evidence");
        else await removeCampaignImageByUrl(image.image_url, cid, "evidence");
      }
    }
    const legacyUrl = currentResult.data?.type === "photo" ? currentResult.data.url : null;
    const legacyUrlHasRelation = legacyUrl ? currentImages.some((image) => image.image_url === legacyUrl) : false;
    if (legacyUrl && !legacyUrlHasRelation && (type !== "photo" || files.length > 0)) await removeCampaignImageByUrl(legacyUrl, cid, "evidence");
    audit(admin.userId, creating ? "create" : "update", "campaign_evidence", result.data.id); revalidatePath(`/admin/campanas/${cid}`); revalidatePath("/novedades");
  } catch (error) {
    if (!imagesInserted) for (const image of uploaded) await removeCampaignImageByPath(image.path, cid, "evidence");
    if (creating) await createServiceRoleSupabaseClient().from("campaign_evidence").delete().eq("id", safeEvidenceId).eq("campaign_id", cid);
    fail(`/admin/campanas/${cid}`, error);
  }
  ok(`/admin/campanas/${cid}`, "Evidencia guardada.");
}
export async function deleteEvidenceAction(campaignId: string, id: string) {
  const admin = await requireAdmin(); const cid = uuid(campaignId), safeId = uuid(id); const db = createServiceRoleSupabaseClient();
  const [{ data: current, error: readError }, images] = await Promise.all([db.from("campaign_evidence").select("type,url").eq("id", safeId).eq("campaign_id", cid).single(), db.from("campaign_evidence_images").select("image_url,storage_path").eq("evidence_id", safeId)]);
  if (readError || !current || images.error) fail(`/admin/campanas/${cid}`, new Error("No se pudo cargar la evidencia."));
  const { error } = await db.from("campaign_evidence").delete().eq("id", safeId).eq("campaign_id", cid);
  if (error) fail(`/admin/campanas/${cid}`, new Error("No se pudo eliminar."));
  for (const image of images.data ?? []) {
    if (image.storage_path) await removeCampaignImageByPath(image.storage_path, cid, "evidence");
    else await removeCampaignImageByUrl(image.image_url, cid, "evidence");
  }
  if (current!.type === "photo") await removeCampaignImageByUrl(current!.url, cid, "evidence");
  audit(admin.userId, "delete", "campaign_evidence", safeId); revalidatePath(`/admin/campanas/${cid}`); revalidatePath("/novedades"); ok(`/admin/campanas/${cid}`, "Evidencia eliminada.");
}
