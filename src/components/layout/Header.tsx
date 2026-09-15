import Link from "next/link";
import { BRAND_NAME } from "@/config/brand";

const links = [
  { href: "/#ranking", label: "Ranking" },
  { href: "/novedades", label: "Novedades" },
  { href: "/como-funciona", label: "Cómo funciona" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0b08]/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-3 sm:px-8 md:flex-nowrap md:py-0">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
          <span className="grid size-8 place-items-center rounded-full bg-amber-400 text-sm text-[#171006]">K</span>
          {BRAND_NAME}
        </Link>
        <nav className="order-3 flex w-full items-center justify-between text-xs text-zinc-400 md:order-none md:w-auto md:justify-start md:gap-7 md:text-sm" aria-label="Navegación principal">
          {links.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>)}
        </nav>
        <Link href="/#donar" className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#171006] transition hover:bg-amber-300">Alimentar</Link>
      </div>
    </header>
  );
}
