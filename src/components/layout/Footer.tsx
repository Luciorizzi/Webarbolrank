import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 text-sm text-zinc-500 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>Plantados · Competencia que genera impacto.</p>
        <div className="flex flex-wrap gap-5"><Link href="/ranking">Ranking</Link><Link href="/novedades">Novedades</Link><Link href="/transparencia">Transparencia</Link><Link href="/como-funciona">Cómo funciona</Link></div>
      </div>
    </footer>
  );
}
