"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/images/ImageLightbox";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 5 * 1024 * 1024;

export function ImageUploadField({ name, currentUrl, label, helpText, required = false }: { name: string; currentUrl?: string | null; label: string; helpText: string; required?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);

  function selectFile(file?: File) {
    setError(null);
    if (!file) return;
    if (!allowedTypes.includes(file.type)) { setError("Seleccioná una imagen JPG, PNG o WEBP."); if (inputRef.current) inputRef.current.value = ""; return; }
    if (file.size > maxBytes) { setError("La imagen no puede superar los 5 MB."); if (inputRef.current) inputRef.current.value = ""; return; }
    if (localPreview) URL.revokeObjectURL(localPreview);
    const url = URL.createObjectURL(file);
    setLocalPreview(url); setPreview(url); setRemoved(false);
  }

  function removeImage() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null); setPreview(null); setRemoved(true); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-4 sm:col-span-2">
      <p className="text-sm text-zinc-300">{label}</p>
      {preview ? <button type="button" onClick={() => setLightboxOpen(true)} className="mt-3 block cursor-zoom-in overflow-hidden rounded-lg" aria-label={`Ampliar ${label.toLowerCase()}`}><Image src={preview} alt={`Vista previa de ${label.toLowerCase()}`} width={640} height={352} unoptimized onError={() => { setPreview(null); setLightboxOpen(false); }} className="h-44 w-full object-cover sm:w-80" /></button> : <div className="mt-3 grid h-32 place-items-center rounded-lg border border-dashed border-white/10 text-sm text-zinc-500">Sin imagen</div>}
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-stone-950">{preview ? "Cambiar imagen" : "Seleccionar imagen"}<input ref={inputRef} className="sr-only" name={name} type="file" accept="image/jpeg,image/png,image/webp" required={required && !currentUrl} onChange={(event) => selectFile(event.target.files?.[0])} /></label>
        {preview && <button type="button" onClick={removeImage} className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300">Eliminar imagen</button>}
      </div>
      <input type="hidden" name={`${name}_remove`} value={removed ? "true" : "false"} />
      <p className="mt-2 text-xs text-zinc-500">{helpText}</p>
      {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}
      {preview && <ImageLightbox images={[{ src: preview, alt: `Vista previa de ${label.toLowerCase()}` }]} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}
