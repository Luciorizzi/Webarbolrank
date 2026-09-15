"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageLightbox } from "@/components/images/ImageLightbox";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 5 * 1024 * 1024;
export const MAX_EVIDENCE_IMAGES = 10;

export interface ExistingEvidenceImage { id: string; image_url: string; sort_order: number }
type LocalImage = { file: File; preview: string; key: string };

export function MultipleImageUploadField({ existingImages = [] }: { existingImages?: ExistingEvidenceImage[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localImagesRef = useRef<LocalImage[]>([]);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => { localImagesRef.current = localImages; }, [localImages]);
  useEffect(() => () => { for (const image of localImagesRef.current) URL.revokeObjectURL(image.preview); }, []);
  const retained = existingImages.filter((image) => !removedIds.has(image.id));
  const visible = [
    ...retained.map((image) => ({ id: image.id, src: image.image_url, alt: "Foto de evidencia" })),
    ...localImages.map((image) => ({ id: `local:${image.key}`, src: image.preview, alt: image.file.name })),
  ];

  function syncFiles(images: LocalImage[]) {
    if (!inputRef.current) return;
    const transfer = new DataTransfer();
    for (const image of images) transfer.items.add(image.file);
    inputRef.current.files = transfer.files;
  }

  function addFiles(files: FileList | null) {
    setError(null);
    if (!files?.length) return;
    const additions = Array.from(files);
    const invalidType = additions.find((file) => !allowedTypes.includes(file.type));
    if (invalidType) { setError(`${invalidType.name}: seleccioná JPG, PNG o WEBP.`); syncFiles(localImages); return; }
    const oversized = additions.find((file) => file.size > maxBytes);
    if (oversized) { setError(`${oversized.name}: cada imagen puede pesar como máximo 5 MB.`); syncFiles(localImages); return; }
    if (retained.length + localImages.length + additions.length > MAX_EVIDENCE_IMAGES) { setError("Podés guardar hasta 10 imágenes por evidencia."); syncFiles(localImages); return; }
    const next = [...localImages, ...additions.map((file) => ({ file, preview: URL.createObjectURL(file), key: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}` }))];
    setLocalImages(next); syncFiles(next);
  }

  function removeLocal(value: string) {
    const key = value.replace(/^local:/, "");
    const removed = localImages.find((image) => image.key === key);
    if (removed) URL.revokeObjectURL(removed.preview);
    const next = localImages.filter((image) => image.key !== key);
    setLocalImages(next); syncFiles(next); setError(null); setLightboxIndex(null);
  }

  return <div className="rounded-xl border border-white/10 bg-black/15 p-4 sm:col-span-2">
    <p className="text-sm text-zinc-300">Fotos</p>
    {visible.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {visible.map((image, index) => <div key={image.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
        <button type="button" className="block aspect-square w-full cursor-zoom-in" onClick={() => setLightboxIndex(index)} aria-label={`Ampliar foto ${index + 1}`}><Image src={image.src} alt={image.alt} width={240} height={240} unoptimized className="h-full w-full object-cover" /></button>
        <button type="button" onClick={() => image.id.startsWith("local:") ? removeLocal(image.id) : (setRemovedIds((current) => new Set(current).add(image.id)), setLightboxIndex(null))} className="absolute right-1.5 top-1.5 rounded-md bg-black/80 px-2 py-1 text-xs text-red-200" aria-label={`Eliminar foto ${index + 1}`}>Eliminar</button>
      </div>)}
    </div> : <div className="mt-3 grid h-28 place-items-center rounded-lg border border-dashed border-white/10 text-sm text-zinc-500">Sin fotos</div>}
    <label className="mt-3 inline-block cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-stone-950">Seleccionar imágenes<input ref={inputRef} className="sr-only" name="evidence_images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => addFiles(event.target.files)} /></label>
    <input type="hidden" name="remove_image_ids" value={JSON.stringify([...removedIds])} />
    <p className="mt-2 text-xs text-zinc-500">Podés cargar varias fotos de la misma entrega.</p>
    <p className="mt-1 text-xs text-zinc-500">Hasta 10 imágenes · Máx. 5 MB cada una · JPG, PNG o WEBP</p>
    {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}
    <ImageLightbox images={visible} initialIndex={lightboxIndex ?? 0} open={lightboxIndex !== null} onClose={() => setLightboxIndex(null)} />
  </div>;
}
