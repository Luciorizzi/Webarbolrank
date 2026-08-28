import Link from "next/link";

const links = [
  { href: "/ranking", label: "Ranking" },
  { href: "/novedades", label: "Novedades" },
  { href: "/como-funciona", label: "Cómo funciona" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080d0b]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
          <span className="grid size-8 place-items-center rounded-full bg-emerald-400 text-sm text-[#07100b]">P</span>
          Plantados
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex" aria-label="Navegación principal">
          {links.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>)}
        </nav>
        <Link href="/#donar" className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#07100b] transition hover:bg-emerald-300">Plantar</Link>
      </div>
    </header>
  );
}
