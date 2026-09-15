"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useRef, useState } from "react";

export type LightboxImage = { src: string; alt: string; caption?: string; date?: string };

export function ImageLightbox(props: { images: LightboxImage[]; initialIndex?: number; open: boolean; onClose: () => void }) {
  if (!props.open || !props.images.length) return null;
  return <OpenImageLightbox key={props.initialIndex ?? 0} images={props.images} initialIndex={props.initialIndex ?? 0} onClose={props.onClose} />;
}

function OpenImageLightbox({ images, initialIndex, onClose }: { images: LightboxImage[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(Math.min(initialIndex, images.length - 1));
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const close = useEffectEvent(onClose);
  const multiple = images.length > 1;
  const current = images[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow; const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden"; closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (multiple && event.key === "ArrowLeft") setIndex((value) => (value - 1 + images.length) % images.length);
      if (multiple && event.key === "ArrowRight") setIndex((value) => (value + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
  }, [images.length, multiple]);

  const previous = () => setIndex((value) => (value - 1 + images.length) % images.length);
  const next = () => setIndex((value) => (value + 1) % images.length);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Visor de imágenes" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }} onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (!multiple || touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) { if (delta < 0) next(); else previous(); } touchStart.current = null; }}>
      <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-black/70 text-2xl text-white hover:border-amber-400" aria-label="Cerrar imagen">×</button>
      {multiple && <button type="button" onClick={previous} className="absolute left-3 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-black/70 text-xl text-white hover:border-amber-400 sm:left-6" aria-label="Imagen anterior">←</button>}
      <div className="pointer-events-none flex max-h-full w-full max-w-6xl flex-col items-center justify-center">
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          {failedSrc === current.src ? <div className="grid h-64 w-full max-w-xl place-items-center rounded-2xl border border-white/10 bg-zinc-950 text-sm text-zinc-500">Imagen no disponible</div> : <Image key={current.src} src={current.src} alt={current.alt} width={1600} height={1200} unoptimized onError={() => setFailedSrc(current.src)} className="pointer-events-auto h-auto max-h-[calc(100vh-10rem)] w-auto max-w-full object-contain" />}
        </div>
        {(current.caption || current.date || multiple) && <div className="mt-4 text-center"><p className="text-sm text-zinc-200">{current.caption}</p>{current.date && <p className="mt-1 text-xs text-zinc-500">{current.date}</p>}{multiple && <p className="mt-2 text-xs text-amber-300">{index + 1} / {images.length}</p>}</div>}
      </div>
      {multiple && <button type="button" onClick={next} className="absolute right-3 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-black/70 text-xl text-white hover:border-amber-400 sm:right-6" aria-label="Imagen siguiente">→</button>}
    </div>
  );
}
