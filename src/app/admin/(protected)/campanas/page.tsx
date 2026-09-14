import Link from "next/link";
import { AdminCampaignStatusBadge } from "@/components/admin/CampaignStatusBadge";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { Empty, Notice } from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { getAdminCampaigns } from "@/lib/data/admin/campaigns";
import { createCampaignAction, toggleCampaignPublishAction } from "../../actions";

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const [campaigns, notice] = await Promise.all([getAdminCampaigns(), searchParams]);
  return (
    <section>
      <h1 className="text-3xl font-black text-white">Campañas</h1>
      <div className="mt-5"><Notice {...notice} /></div>
      <details className="mt-5 rounded-xl border border-white/10 p-4">
        <summary className="cursor-pointer font-bold text-white">Crear campaña</summary>
        <div className="mt-4"><CampaignForm action={createCampaignAction} /></div>
      </details>
      <div className="mt-8 overflow-x-auto">
        {campaigns.length ? (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500"><tr>{["Título", "Organización", "Ubicación", "Objetivo kg", "Estado", "Publicada", "Fecha", "Acciones"].map((heading) => <th key={heading} className="border-b border-white/10 p-3">{heading}</th>)}</tr></thead>
            <tbody>{campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-white/5">
                <td className="p-3 text-white">{campaign.title}</td>
                <td className="p-3">{campaign.ngo_name ?? "—"}</td>
                <td className="p-3">{campaign.location ?? "—"}</td>
                <td className="p-3">{campaign.impact_goal ?? "—"}</td>
                <td className="p-3"><AdminCampaignStatusBadge status={campaign.status} /></td>
                <td className="p-3">{campaign.published_at ? "Sí" : "No"}</td>
                <td className="p-3">{new Date(campaign.created_at).toLocaleDateString("es-AR")}</td>
                <td className="flex gap-2 p-3">
                  <Link className="text-amber-300" href={`/admin/campanas/${campaign.id}`}>Editar</Link>
                  <form action={toggleCampaignPublishAction.bind(null, campaign.id, !campaign.published_at)}><SubmitButton tone="secondary">{campaign.published_at ? "Despublicar" : "Publicar"}</SubmitButton></form>
                </td>
              </tr>
            ))}</tbody>
          </table>
        ) : <Empty>No hay campañas.</Empty>}
      </div>
    </section>
  );
}
