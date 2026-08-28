import Link from "next/link";

export function PlaceholderPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <main className="mx-auto min-h-[65vh] max-w-6xl px-5 py-24 sm:px-8"><p className="eyebrow">{eyebrow}</p><h1 className="mt-4 max-w-3xl font-display text-5xl font-bold uppercase tracking-tight text-white">{title}</h1><p className="mt-6 max-w-2xl text-lg text-zinc-400">{description}</p><Link href="/" className="mt-10 inline-flex rounded-full border border-white/12 px-5 py-3 text-sm text-white hover:border-emerald-400/40">Volver al inicio</Link></main>;
}
