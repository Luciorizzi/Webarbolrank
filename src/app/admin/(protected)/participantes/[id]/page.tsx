import { notFound } from "next/navigation";
import { Notice } from "@/components/admin/AdminUI";
import { ParticipantForm } from "@/components/admin/ParticipantForm";
import { getAdminParticipant } from "@/lib/data/admin/participants";
import { updateParticipantAction } from "../../../actions";
export default async function EditParticipantPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; message?: string }> }) { const { id } = await params; const [{ participant, categories }, notice] = await Promise.all([getAdminParticipant(id), searchParams]); if (!participant) notFound(); return <section><h1 className="text-3xl font-black text-white">Editar participante</h1><div className="mt-5"><Notice {...notice} /></div><div className="mt-5"><ParticipantForm participant={participant} categories={categories} action={updateParticipantAction.bind(null,id)} /></div></section>; }

