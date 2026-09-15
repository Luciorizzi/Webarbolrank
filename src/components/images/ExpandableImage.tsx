"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";

export function ExpandableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [open, setOpen] = useState(false); const [failed, setFailed] = useState(false);
  if (failed) return <div className={`${className ?? ""} grid place-items-center border border-white/10 bg-zinc-950 text-sm text-zinc-500`}>Imagen no disponible</div>;
  return <><button type="button" onClick={() => setOpen(true)} className={`relative block cursor-zoom-in overflow-hidden focus-visible:outline ${className ?? ""}`} aria-label={`Ampliar ${alt}`}><Image src={src} alt={alt} fill unoptimized sizes="100vw" onError={() => setFailed(true)} className="object-cover" /></button><ImageLightbox images={[{ src, alt }]} open={open} onClose={() => setOpen(false)} /></>;
}

