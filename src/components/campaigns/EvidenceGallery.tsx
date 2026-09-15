"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CampaignEvidenceImage } from "@/types/campaign";
import { ImageLightbox } from "@/components/images/ImageLightbox";

export function EvidenceGallery({ images: evidenceImages, label }: { images: CampaignEvidenceImage[]; label: string }) {
  const [active, setActive] = useState(0); const [lightbox, setLightbox] = useState<number | null>(null); const [failed, setFailed] = useState<Set<string>>(new Set()); const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const visible = evidenceImages.filter((item) => !failed.has(item.id));
  if (!visible.length) return null;
  const go = (next: number) => { const index = (next + visible.length) % visible.length; setActive(index); refs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }); };
  const images = visible.map((item, index) => ({ src: item.url, alt: `${label}, foto ${index + 1}`, caption: label }));
  return <div className="mt-4"><div className="overflow-hidden"><div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none]">{visible.map((item, index) => <button ref={(element) => { refs.current[index] = element; }} key={item.id} type="button" onClick={() => setLightbox(index)} className="group relative aspect-[4/3] min-w-full snap-start overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left sm:min-w-[calc(50%-0.375rem)]" aria-label={`Ampliar foto ${index + 1} de ${label}`}><Image src={item.url} alt={`${label}, foto ${index + 1}`} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" onError={() => { setFailed((current) => new Set(current).add(item.id)); setActive(0); }} className="object-cover transition duration-300 group-hover:scale-[1.02]" /></button>)}</div></div>{visible.length > 1 && <div className="mt-3 flex items-center justify-between"><button type="button" onClick={() => go(active - 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-amber-400">← Anterior</button><div className="flex gap-2" aria-label="Seleccionar imagen">{visible.map((item, index) => <button key={item.id} type="button" onClick={() => go(index)} aria-label={`Ir a imagen ${index + 1}`} className={`size-2 rounded-full ${index === active ? "bg-amber-400" : "bg-white/20"}`} />)}</div><button type="button" onClick={() => go(active + 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-amber-400">Siguiente →</button></div>}<ImageLightbox images={images} initialIndex={lightbox ?? 0} open={lightbox !== null} onClose={() => setLightbox(null)} /></div>;
}
