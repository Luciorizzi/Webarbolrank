import { campaignStatusOptions } from "@/config/campaign-status";
import type { Database } from "@/types/database";
import { field } from "./AdminUI";
import { CampaignGoalFields } from "./CampaignGoalFields";
import { ImageUploadField } from "./ImageUploadField";
import { SubmitButton } from "./SubmitButton";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export function CampaignForm({ action, campaign }: { action: (form: FormData) => void | Promise<void>; campaign?: Campaign | null }) {
  return (
    <form action={action} className="grid gap-4 rounded-xl border border-white/10 bg-white/[.03] p-5 sm:grid-cols-2">
      <label className="text-sm">Título<input className={`${field} mt-1`} name="title" required defaultValue={campaign?.title} /></label>
      <label className="text-sm">Slug<input className={`${field} mt-1`} name="slug" required defaultValue={campaign?.slug} /></label>
      <label className="text-sm">Organización/refugio<input className={`${field} mt-1`} name="ngo_name" defaultValue={campaign?.ngo_name ?? ""} /></label>
      <label className="text-sm">Ubicación<input className={`${field} mt-1`} name="location" defaultValue={campaign?.location ?? ""} /></label>
      <CampaignGoalFields initialKg={campaign?.impact_goal ?? null} />
      <label className="text-sm">Estado
        <select className={`${field} mt-1`} name="status" defaultValue={campaign?.status ?? "fundraising"}>
          {campaignStatusOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <ImageUploadField name="cover_image" currentUrl={campaign?.cover_image_url} label="Imagen principal" helpText="Recomendado: 1600 × 900 px · Relación 16:9 · JPG, PNG o WEBP · Máx. 5 MB" />
      <label className="text-sm">Fecha de entrega<input className={`${field} mt-1`} name="delivery_date" type="date" defaultValue={campaign?.delivery_date ?? ""} /></label>
      <label className="text-sm sm:col-span-2">Resumen<textarea className={`${field} mt-1`} name="excerpt" rows={2} defaultValue={campaign?.excerpt ?? ""} /></label>
      <label className="text-sm sm:col-span-2">Descripción<textarea className={`${field} mt-1`} name="description" rows={6} required defaultValue={campaign?.description ?? ""} /></label>
      {!campaign && <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" /> Publicar ahora</label>}
      <div className="sm:col-span-2"><SubmitButton>{campaign ? "Guardar campaña" : "Crear campaña"}</SubmitButton></div>
    </form>
  );
}
