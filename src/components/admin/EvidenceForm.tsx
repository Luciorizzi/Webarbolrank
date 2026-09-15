"use client";

import { useState } from "react";
import type { Database, EvidenceType } from "@/types/database";
import { field } from "./AdminUI";
import { MultipleImageUploadField } from "./MultipleImageUploadField";
import { SubmitButton } from "./SubmitButton";

type EvidenceImage = Database["public"]["Tables"]["campaign_evidence_images"]["Row"];
type Evidence = Database["public"]["Tables"]["campaign_evidence"]["Row"] & { images: EvidenceImage[] };
const types: { value: EvidenceType; label: string }[] = [{ value: "photo", label: "Foto" }, { value: "receipt", label: "Comprobante" }, { value: "document", label: "Documento" }, { value: "external_link", label: "Enlace externo" }];

export function EvidenceForm({ action, evidence }: { action: (form: FormData) => void | Promise<void>; evidence?: Evidence }) {
  const [type, setType] = useState<EvidenceType>(evidence?.type ?? "photo");
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Tipo<select className={`${field} mt-1`} name="type" value={type} onChange={(event) => setType(event.target.value as EvidenceType)}>{types.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label className="text-sm">Descripción<input className={`${field} mt-1`} name="label" defaultValue={evidence?.label ?? ""} required /></label>
      {type === "photo" ? <MultipleImageUploadField existingImages={evidence?.type === "photo" ? evidence.images : []} /> : <label className="text-sm sm:col-span-2">URL<input className={`${field} mt-1`} name="url" type="url" defaultValue={evidence?.type === type ? evidence.url ?? "" : ""} placeholder="https://…" /></label>}
      <label className="text-sm">Fecha<input className={`${field} mt-1`} name="evidence_date" type="date" defaultValue={evidence?.evidence_date ?? ""} /></label>
      <div className="sm:col-span-2"><SubmitButton tone={evidence ? "secondary" : "primary"}>{evidence ? "Guardar" : "Agregar"}</SubmitButton></div>
    </form>
  );
}
