import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { EvidenceForm } from "@/components/admin/EvidenceForm";
import { Empty, Notice, field } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { getAdminCampaign } from "@/lib/data/admin/campaigns";
import { deleteEvidenceAction, deleteUpdateAction, saveEvidenceAction, saveUpdateAction, updateCampaignAction } from "../../../actions";

export default async function CampaignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; message?: string }> }) {
  const { id } = await params; const [{ campaign, updates, evidence }, notice] = await Promise.all([getAdminCampaign(id), searchParams]);
  if (!campaign) notFound();
  return (
    <section>
      <h1 className="text-3xl font-black text-white">Editar campaña</h1>
      <div className="mt-5"><Notice {...notice} /></div>
      <div className="mt-5"><CampaignForm campaign={campaign} action={updateCampaignAction.bind(null, id)} /></div>

      <h2 className="mt-10 text-xl font-bold text-white">Actualizaciones</h2>
      <form action={saveUpdateAction.bind(null, id, null)} className="mt-4 grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-3">
        <input className={field} name="title" placeholder="Título" required />
        <input className={field} name="event_date" type="date" required />
        <textarea className={`${field} sm:col-span-3`} name="content" placeholder="Texto" />
        <SubmitButton>Agregar</SubmitButton>
      </form>
      <div className="mt-4 space-y-3">{updates.length ? updates.map((update) => (
        <article key={update.id} className="rounded-xl border border-white/10 p-4">
          <form action={saveUpdateAction.bind(null, id, update.id)} className="grid gap-3 sm:grid-cols-3">
            <input className={field} name="title" defaultValue={update.title} required />
            <input className={field} name="event_date" type="date" defaultValue={update.event_date} required />
            <textarea className={`${field} sm:col-span-3`} name="content" defaultValue={update.content ?? ""} />
            <SubmitButton tone="secondary">Guardar</SubmitButton>
          </form>
          <form action={deleteUpdateAction.bind(null, id, update.id)} className="mt-2"><SubmitButton tone="danger">Eliminar</SubmitButton></form>
        </article>
      )) : <Empty>No hay actualizaciones.</Empty>}</div>

      <h2 className="mt-10 text-xl font-bold text-white">Evidencias</h2>
      <div className="mt-4 rounded-xl border border-white/10 p-4"><EvidenceForm action={saveEvidenceAction.bind(null, id, null)} /></div>
      <div className="mt-4 space-y-3">{evidence.length ? evidence.map((item) => (
        <article key={item.id} className="rounded-xl border border-white/10 p-4">
          <EvidenceForm evidence={item} action={saveEvidenceAction.bind(null, id, item.id)} />
          <form action={deleteEvidenceAction.bind(null, id, item.id)} className="mt-2"><SubmitButton tone="danger">Eliminar evidencia</SubmitButton></form>
        </article>
      )) : <Empty>No hay evidencias.</Empty>}</div>
    </section>
  );
}
