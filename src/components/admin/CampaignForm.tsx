import { campaignStatusOptions } from "@/config/campaign-status";
import type { Database } from "@/types/database";
import { field } from "./AdminUI";
import { SubmitButton } from "./SubmitButton";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export function CampaignForm({ action, campaign }: { action: (form: FormData) => void | Promise<void>; campaign?: Campaign | null }) {
  return (
    <form action={action} className="grid gap-4 rounded-xl border border-white/10 bg-white/[.03] p-5 sm:grid-cols-2">
      <label className="text-sm">Título<input className={`${field} mt-1`} name="title" required defaultValue={campaign?.title} /></label>
      <label className="text-sm">Slug<input className={`${field} mt-1`} name="slug" required defaultValue={campaign?.slug} /></label>
      <label className="text-sm">Organización/refugio<input className={`${field} mt-1`} name="ngo_name" defaultValue={campaign?.ngo_name ?? ""} /></label>
      <label className="text-sm">Ubicación<input className={`${field} mt-1`} name="location" defaultValue={campaign?.location ?? ""} /></label>
      <label className="text-sm">Objetivo kg<input className={`${field} mt-1`} name="impact_goal" type="number" min="0" step="1" defaultValue={campaign?.impact_goal ?? ""} /></label>
      <label className="text-sm">Objetivo monetario<input className={`${field} mt-1`} name="goal_amount" type="number" min="0" step="1" defaultValue={campaign?.goal_amount ?? ""} /></label>
      <label className="text-sm">Estado
        <select className={`${field} mt-1`} name="status" defaultValue={campaign?.status ?? "fundraising"}>
          {campaignStatusOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="text-sm">Imagen URL<input className={`${field} mt-1`} name="cover_image_url" type="url" defaultValue={campaign?.cover_image_url ?? ""} /></label>
      <label className="text-sm">Fecha actividad<input className={`${field} mt-1`} name="activity_date" type="date" defaultValue={campaign?.activity_date ?? ""} /></label>
      <label className="text-sm">Fecha entrega<input className={`${field} mt-1`} name="delivery_date" type="date" defaultValue={campaign?.delivery_date ?? ""} /></label>
      <label className="text-sm sm:col-span-2">Resumen<textarea className={`${field} mt-1`} name="excerpt" rows={2} defaultValue={campaign?.excerpt ?? ""} /></label>
      <label className="text-sm sm:col-span-2">Descripción<textarea className={`${field} mt-1`} name="description" rows={6} required defaultValue={campaign?.description ?? ""} /></label>
      {!campaign && <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" /> Publicar ahora</label>}
      <div className="sm:col-span-2"><SubmitButton>{campaign ? "Guardar campaña" : "Crear campaña"}</SubmitButton></div>
    </form>
  );
}
